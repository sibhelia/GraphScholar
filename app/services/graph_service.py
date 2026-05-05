from app.database import db
from app.services.arxiv_service import arxiv_service
import threading

class GraphService:
    """Neo4j uzerindeki grafik islemlerini yoneten servis."""

    def add_paper_with_metadata(self, metadata: dict):
        """
        Gemini'den gelen metadata bilgisini Neo4j'ye kaydeder.
        Yazarlar ve atiflar arasinda baglanti kurar.
        """
        title = metadata.get("title", "Unknown Title")
        authors = metadata.get("authors", [])
        year = metadata.get("year")
        abstract = metadata.get("abstract", "")
        references = metadata.get("references", [])
        concepts = metadata.get("concepts", [])
        
        # Basit bir benzersiz kimlik olusturuyoruz
        paper_id = title.lower().replace(" ", "_")[:50]

        with db.neo4j_driver.session() as session:
            # 1. Makale dugumunu olustur veya guncelle
            session.run("""
                MERGE (p:Paper {arxiv_id: $paper_id})
                SET p.title = $title, p.year = $year, p.abstract = $abstract
            """, paper_id=paper_id, title=title, year=year, abstract=abstract)

            # 2. Yazar dugumlerini olustur ve makaleye bagla
            for author_name in authors:
                session.run("""
                    MERGE (a:Author {name: $name})
                    WITH a
                    MATCH (p:Paper {arxiv_id: $paper_id})
                    MERGE (a)-[:WROTE]->(p)
                """, name=author_name, paper_id=paper_id)

            # 3. Kavram dugumlerini olustur ve makaleye bagla
            for concept_name in concepts:
                session.run("""
                    MERGE (c:Concept {name: $name})
                    WITH c
                    MATCH (p:Paper {arxiv_id: $paper_id})
                    MERGE (p)-[:MENTIONS]->(c)
                """, name=concept_name, paper_id=paper_id)

            # 4. Atif yapilan makaleleri olustur ve bagla (ArXiv araması OLMADAN — hızlı)
            # Referansları sadece başlıklarıyla kaydediyoruz; ArXiv enrichment arka planda yapılabilir
            max_refs = min(len(references), 20)  # En fazla 20 referans al
            for ref_title in references[:max_refs]:
                if not ref_title or len(ref_title) < 5:
                    continue
                ref_id = ref_title.lower().replace(" ", "_")[:50]
                session.run("""
                    MERGE (rp:Paper {arxiv_id: $ref_id})
                    ON CREATE SET rp.title = $ref_title
                    WITH rp
                    MATCH (p:Paper {arxiv_id: $paper_id})
                    MERGE (p)-[:CITES]->(rp)
                """, ref_id=ref_id, ref_title=ref_title, paper_id=paper_id)

        print(f"Grafik veritabanina kaydedildi: {title} ({len(authors)} yazar, {len(concepts)} kavram, {min(len(references),20)} atif)")

    def enrich_references_background(self, paper_id: str, references: list):
        """
        Arka planda calisir: referans stub dugumlerini ArXiv'den gercek verilerle zenginlestirir.
        Kullanici bu metodu beklemez — yanit zaten verilmistir.
        """
        print(f"[ARKA PLAN] {len(references)} referans zenginlestirme basliyor...")
        enriched = 0
        for ref_title in references:
            if not ref_title or len(ref_title) < 10:
                continue
            try:
                arxiv_data = arxiv_service.search_paper_by_title(ref_title)
                if not arxiv_data:
                    continue
                    
                ref_id_slug = ref_title.lower().replace(" ", "_")[:50]
                
                with db.neo4j_driver.session() as session:
                    # Stub dugumu gercek arxiv verileriyle guncelle ve CITES bagini koru
                    session.run("""
                        MATCH (stub:Paper {arxiv_id: $slug})
                        SET stub.arxiv_id = $real_id,
                            stub.title = $real_title,
                            stub.abstract = $abstract,
                            stub.url = $url,
                            stub.year = $year
                    """, 
                    slug=ref_id_slug,
                    real_id=arxiv_data["arxiv_id"],
                    real_title=arxiv_data["title"],
                    abstract=arxiv_data.get("summary", ""),
                    url=arxiv_data.get("url", ""),
                    year=arxiv_data.get("published"))
                    
                enriched += 1
                print(f"[ARKA PLAN] Zenginlestirildi: {arxiv_data['title'][:50]}")
            except Exception as e:
                print(f"[ARKA PLAN] Zenginlestirme hatasi ({ref_title[:40]}): {e}")
                continue
                
        print(f"[ARKA PLAN] Tamamlandi: {enriched}/{len(references)} referans zenginlestirildi.")

    def enrich_authors_background(self, papers: list):
        """
        Yazarsiz makale listesini alir, ArXiv'de basliga gore arar,
        bulunan yazarlari Neo4j'ye ekler ve WROTE baglantisi kurar.
        """
        print(f"[YAZAR ZENGİNLEŞTİRME] {len(papers)} makale icin basliyor...")
        updated = 0
        for paper in papers:
            title = paper.get("title", "")
            paper_id = paper.get("id", "")
            if not title or len(title) < 5:
                continue
            try:
                arxiv_data = arxiv_service.search_paper_by_title(title)
                if not arxiv_data or not arxiv_data.get("authors"):
                    print(f"[YAZAR] Bulunamadi: {title[:50]}")
                    continue

                authors = arxiv_data["authors"]
                with db.neo4j_driver.session() as session:
                    for author_name in authors:
                        session.run("""
                            MERGE (a:Author {name: $name})
                            WITH a
                            MATCH (p:Paper {arxiv_id: $paper_id})
                            MERGE (a)-[:WROTE]->(p)
                        """, name=author_name, paper_id=paper_id)

                updated += 1
                print(f"[YAZAR] {len(authors)} yazar eklendi: {title[:50]}")
            except Exception as e:
                print(f"[YAZAR] Hata ({title[:40]}): {e}")
                continue

        print(f"[YAZAR ZENGİNLEŞTİRME] Tamamlandi: {updated}/{len(papers)} makale guncellendi.")

    def get_paper_neighbors(self, title: str) -> dict:
        """
        Bir makalenin bagli oldugu kavramlari ve atiflari getirir.
        """
        with db.neo4j_driver.session() as session:
            query = """
            MATCH (p:Paper)
            WHERE p.title CONTAINS $title
            OPTIONAL MATCH (p)-[:MENTIONS]->(c:Concept)
            OPTIONAL MATCH (p)-[:CITES]->(ref:Paper)
            RETURN collect(distinct c.name) as concepts, 
                   collect(distinct ref.title) as citations
            """
            record = session.run(query, title=title).single()
            if record:
                return {
                    "concepts": record["concepts"],
                    "citations": record["citations"]
                }
            return {"concepts": [], "citations": []}

    def list_papers(self) -> list[dict]:
        """Kayitli makaleleri temel bilgileriyle listeler."""
        with db.neo4j_driver.session() as session:
            records = session.run("""
                MATCH (p:Paper)
                OPTIONAL MATCH (a:Author)-[:WROTE]->(p)
                OPTIONAL MATCH (p)-[:MENTIONS]->(c:Concept)
                OPTIONAL MATCH (p)-[:CITES]->(ref:Paper)
                RETURN
                    p.arxiv_id AS id,
                    p.title AS title,
                    p.year AS year,
                    p.abstract AS abstract,
                    p.url AS url,
                    collect(DISTINCT a.name) AS authors,
                    collect(DISTINCT c.name) AS concepts,
                    count(DISTINCT ref) AS citation_count
                ORDER BY coalesce(p.year, 0) DESC, p.title ASC
            """)

            papers = []
            for record in records:
                papers.append({
                    "id": record["id"],
                    "title": record["title"],
                    "year": record["year"],
                    "abstract": record["abstract"] or "",
                    "url": record["url"] or "",
                    "authors": [a for a in record["authors"] if a],
                    "concepts": [c for c in record["concepts"] if c],
                    "citation_count": record["citation_count"] or 0,
                })
            return papers

    def get_paper_summaries(self, limit: int = 10) -> list[dict]:
        """Arama fallback'i icin en anlamli makale ozetlerini dondurur."""
        with db.neo4j_driver.session() as session:
            records = session.run("""
                MATCH (p:Paper)
                OPTIONAL MATCH (a:Author)-[:WROTE]->(p)
                RETURN
                    p.arxiv_id AS id,
                    p.title AS title,
                    p.year AS year,
                    p.abstract AS abstract,
                    collect(DISTINCT a.name) AS authors
                ORDER BY
                    CASE WHEN p.abstract IS NULL OR trim(p.abstract) = "" THEN 1 ELSE 0 END ASC,
                    coalesce(p.year, 0) DESC,
                    p.title ASC
                LIMIT $limit
            """, limit=limit)

            summaries = []
            for record in records:
                abstract = (record["abstract"] or "").strip()
                summaries.append({
                    "id": record["id"],
                    "title": record["title"] or "Bilinmeyen Makale",
                    "year": record["year"],
                    "abstract": abstract,
                    "authors": [a for a in record["authors"] if a],
                })
            return summaries

    def get_graph_snapshot(self, limit: int = 40) -> dict:
        """Arayuz icin hafif bir grafik ozeti dondurur."""
        with db.neo4j_driver.session() as session:
            paper_records = session.run("""
                MATCH (p:Paper)
                RETURN p.arxiv_id AS id, p.title AS title, p.year AS year
                ORDER BY coalesce(p.year, 0) DESC, p.title ASC
                LIMIT $limit
            """, limit=limit)

            nodes = []
            node_ids = set()
            paper_ids = []

            for record in paper_records:
                paper_id = record["id"]
                paper_ids.append(paper_id)
                node_ids.add(paper_id)
                nodes.append({
                    "id": paper_id,
                    "label": record["title"] or paper_id,
                    "group": "paper",
                    "year": record["year"],
                })

            if not paper_ids:
                return {"nodes": [], "edges": []}

            relation_records = session.run("""
                MATCH (p:Paper)-[r:CITES|MENTIONS|WROTE]-(n)
                WHERE p.arxiv_id IN $paper_ids
                RETURN
                    p.arxiv_id AS source_id,
                    coalesce(p.title, p.arxiv_id) AS source_title,
                    type(r) AS rel_type,
                    labels(n)[0] AS target_label,
                    coalesce(n.arxiv_id, n.name) AS target_id,
                    coalesce(n.title, n.name, n.arxiv_id) AS target_title,
                    n.year AS target_year
                LIMIT $edge_limit
            """, paper_ids=paper_ids, edge_limit=limit * 6)

            edges = []
            for record in relation_records:
                target_id = record["target_id"]
                if not target_id:
                    continue

                if target_id not in node_ids:
                    node_ids.add(target_id)
                    label = record["target_label"]
                    group = "paper"
                    if label == "Concept":
                        group = "concept"
                    elif label == "Author":
                        group = "Author"
                        
                    nodes.append({
                        "id": target_id,
                        "label": record["target_title"] or target_id,
                        "group": group,
                        "year": record["target_year"],
                    })

                edges.append({
                    "id": f'{record["source_id"]}-{record["rel_type"]}-{target_id}',
                    "from": record["source_id"],
                    "to": target_id,
                    "label": record["rel_type"],
                    "arrows": "to",
                })

            return {"nodes": nodes, "edges": edges}

    def get_shortest_path(self, start_id: str, end_id: str) -> dict:
        """Iki dugum arasindaki en kisa yolu (shortestPath) bulur."""
        with db.neo4j_driver.session() as session:
            # shortestPath fonksiyonunu kullanarak yolu bul
            query = """
            MATCH (start {arxiv_id: $start_id}), (end {arxiv_id: $end_id})
            MATCH p = shortestPath((start)-[*..6]-(end))
            RETURN p
            """
            # Not: id'ler hem arxiv_id (makale) hem name (yazar/kavram) olabilir.
            # Dugumleri daha genel bir 'id' property'si uzerinden aramak daha iyi olabilir
            # ama su anki semada arxiv_id ve name kullaniliyor.
            
            # Daha esnek bir arama sorgusu:
            query = """
            MATCH (start), (end)
            WHERE (start.arxiv_id = $start_id OR start.name = $start_id)
              AND (end.arxiv_id = $end_id OR end.name = $end_id)
            MATCH p = shortestPath((start)-[*..6]-(end))
            RETURN 
                [n in nodes(p) | {
                    id: coalesce(n.arxiv_id, n.name), 
                    label: coalesce(n.title, n.name, n.arxiv_id),
                    group: labels(n)[0]
                }] AS nodes,
                [r in relationships(p) | {
                    id: id(r),
                    from: coalesce(startNode(r).arxiv_id, startNode(r).name),
                    to: coalesce(endNode(r).arxiv_id, endNode(r).name),
                    label: type(r)
                }] AS edges
            """
            
            result = session.run(query, start_id=start_id, end_id=end_id).single()
            if result:
                return {
                    "nodes": result["nodes"],
                    "edges": result["edges"]
                }
            return {"nodes": [], "edges": []}

    def get_library_stats(self) -> dict:
        """Kullanicinin kutuphanesi icin detayli analitik istatistikler dondurur."""
        with db.neo4j_driver.session() as session:
            # Temel sayilar
            counts = session.run("""
                MATCH (p:Paper)
                OPTIONAL MATCH (a:Author)-[:WROTE]->(p)
                OPTIONAL MATCH (p)-[:MENTIONS]->(c:Concept)
                OPTIONAL MATCH ()-[r:CITES]->()
                RETURN
                    count(DISTINCT p) AS paper_count,
                    count(DISTINCT a) AS author_count,
                    count(DISTINCT c) AS concept_count,
                    count(DISTINCT r) AS citation_edges
            """).single()

            # En cok atif alanlar
            top_papers_res = session.run("""
                MATCH (p:Paper)
                OPTIONAL MATCH (other:Paper)-[r:CITES]->(p)
                WITH p, count(r) AS citations
                ORDER BY citations DESC
                LIMIT 5
                MATCH (p)
                OPTIONAL MATCH (a:Author)-[:WROTE]->(p)
                RETURN p.title AS title, citations, collect(DISTINCT a.name) AS authors, p.year AS year
            """)
            top_cited_papers = [
                {"title": r["title"], "citations": r["citations"], "authors": r["authors"], "year": r["year"]}
                for r in top_papers_res
            ]

            # H-Index Hesaplama (Kutuphane icindeki atiflara gore)
            # h-endeksi: h adet makalenin her birinin en az h atif almasi
            h_index_res = session.run("""
                MATCH (p:Paper)
                OPTIONAL MATCH (other:Paper)-[r:CITES]->(p)
                WITH p, count(r) AS citations
                ORDER BY citations DESC
                WITH collect(citations) AS citation_list
                UNWIND range(1, size(citation_list)) AS i
                WITH i, citation_list[i-1] AS c
                WHERE c >= i
                RETURN max(i) AS h_index
            """).single()
            h_index = h_index_res["h_index"] if h_index_res and h_index_res["h_index"] else 0

            # Yillik buyume
            growth_res = session.run("""
                MATCH (p:Paper)
                WHERE p.year IS NOT NULL
                RETURN p.year AS year, count(p) AS count
                ORDER BY year ASC
            """)
            growth_by_year = [{"year": r["year"], "count": r["count"]} for r in growth_res]

        return {
            "paper_count": counts["paper_count"] if counts else 0,
            "author_count": counts["author_count"] if counts else 0,
            "concept_count": counts["concept_count"] if counts else 0,
            "citation_edges": counts["citation_edges"] if counts else 0,
            "top_cited_papers": top_cited_papers,
            "h_index": h_index,
            "growth_by_year": growth_by_year
        }

# Singleton nesnesi
graph_service = GraphService()
