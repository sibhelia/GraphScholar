from app.database import db

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

            # 3. Atif yapilan makaleleri olustur ve bagla
            for ref_title in references:
                ref_id = ref_title.lower().replace(" ", "_")[:50]
                session.run("""
                    MERGE (rp:Paper {arxiv_id: $ref_id})
                    ON CREATE SET rp.title = $ref_title
                    WITH rp
                    MATCH (p:Paper {arxiv_id: $paper_id})
                    MERGE (p)-[:CITES]->(rp)
                """, ref_id=ref_id, ref_title=ref_title, paper_id=paper_id)

        print(f"Grafik veritabanina kaydedildi: {title}")

# Singleton nesnesi
graph_service = GraphService()
