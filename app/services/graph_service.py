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

# Singleton nesnesi
graph_service = GraphService()
