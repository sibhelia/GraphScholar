from app.database import db
from app.services.arxiv_service import arxiv_service

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

            # 4. Atif yapilan makaleleri olustur ve bagla
            total_refs = len(references)
            for idx, ref_title in enumerate(references):
                print(f"Referans işleniyor ({idx+1}/{total_refs}): {ref_title[:50]}...")
                # ArXiv'den gercek bilgileri cekmeye calis
                arxiv_data = arxiv_service.search_paper_by_title(ref_title)
                
                if arxiv_data:
                    ref_id = arxiv_data["arxiv_id"]
                    ref_final_title = arxiv_data["title"]
                    ref_summary = arxiv_data["summary"]
                    ref_url = arxiv_data["url"]
                else:
                    ref_id = ref_title.lower().replace(" ", "_")[:50]
                    ref_final_title = ref_title
                    ref_summary = ""
                    ref_url = ""

                session.run("""
                    MERGE (rp:Paper {arxiv_id: $ref_id})
                    ON CREATE SET rp.title = $ref_title, rp.abstract = $summary, rp.url = $url
                    WITH rp
                    MATCH (p:Paper {arxiv_id: $paper_id})
                    MERGE (p)-[:CITES]->(rp)
                """, ref_id=ref_id, ref_title=ref_final_title, summary=ref_summary, url=ref_url, paper_id=paper_id)

        print(f"Grafik veritabanina kaydedildi: {title}")

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
                MATCH (p:Paper)-[r:CITES|MENTIONS]->(n)
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
            """, paper_ids=paper_ids, edge_limit=limit * 4)

            edges = []
            for record in relation_records:
                target_id = record["target_id"]
                if not target_id:
                    continue

                if target_id not in node_ids:
                    node_ids.add(target_id)
                    group = "concept" if record["target_label"] == "Concept" else "paper"
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

    def get_library_stats(self) -> dict:
        """Kullanicinin kutuphanesi icin ozet istatistikler dondurur."""
        with db.neo4j_driver.session() as session:
            record = session.run("""
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

        return {
            "paper_count": record["paper_count"] if record else 0,
            "author_count": record["author_count"] if record else 0,
            "concept_count": record["concept_count"] if record else 0,
            "citation_edges": record["citation_edges"] if record else 0,
        }

# Singleton nesnesi
graph_service = GraphService()
