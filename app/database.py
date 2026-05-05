import os
from neo4j import GraphDatabase
import chromadb
from dotenv import load_dotenv

# .env dosyasındaki değişkenleri sisteme yükle
load_dotenv()

class Database:
    def __init__(self):
        # Ayarları .env dosyasından çekiyoruz
        # Docker içinde çalışırken localhost yerine servis isimlerini (neo4j, chromadb) kullanır
        self.neo4j_uri = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
        self.neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        self.neo4j_password = os.getenv("NEO4J_PASSWORD", "password123")
        
        self.chroma_host = os.getenv("CHROMA_HOST", "chromadb")
        self.chroma_port = int(os.getenv("CHROMA_PORT", 8000))

        # PostgreSQL Ayarları
        pg_user = os.getenv("POSTGRES_USER", "admin")
        pg_password = os.getenv("POSTGRES_PASSWORD", "admin123")
        pg_db = os.getenv("POSTGRES_DB", "graphscholar")
        # Railway/Render DATABASE_URL'ini önce dene, yoksa Docker servis adını kullan
        self.postgres_uri = os.getenv(
            "DATABASE_URL",
            f"postgresql://{pg_user}:{pg_password}@postgres:5432/{pg_db}"
        )

        self.neo4j_driver = None
        self.chroma_client = None
        self.SessionLocal = None
        self.engine = None

    def connect(self):
        """Veritabanlarina baglanti saglar."""
        import time
        max_retries = 10
        for i in range(max_retries):
            try:
                # Neo4j baglantisini baslat
                self.neo4j_driver = GraphDatabase.driver(
                    self.neo4j_uri, 
                    auth=(self.neo4j_user, self.neo4j_password)
                )
                self.neo4j_driver.verify_connectivity()
                
                # ChromaDB HTTP istemcisini baslat
                self.chroma_client = chromadb.HttpClient(
                    host=self.chroma_host, 
                    port=self.chroma_port
                )
                # Chroma baglantisini test et
                self.chroma_client.heartbeat()

                # PostgreSQL baglantisini kur
                from sqlalchemy import create_engine
                from sqlalchemy.orm import sessionmaker
                self.engine = create_engine(self.postgres_uri)
                self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
                
                # Tablolari otomatik olustur (varsa dokunmaz)
                from app.models import Base
                Base.metadata.create_all(bind=self.engine)
                
                print("Veritabanı bağlantıları (Neo4j, Chroma, Postgres) başarılı.")
                return 
            except Exception as e:
                print(f"Baglanti denemesi {i+1} basarisiz: {e}")
                if i < max_retries - 1:
                    time.sleep(5)
                else:
                    raise e

    def close(self):
        """Bağlantıları güvenli bir şekilde kapatır."""
        if self.neo4j_driver:
            self.neo4j_driver.close()

    def init_neo4j_schema(self):
        """Neo4j'de verilerin düzenli olması için gerekli kuralları koyar."""
        if not self.neo4j_driver:
            return
            
        constraints = [
            "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Paper) REQUIRE p.arxiv_id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (a:Author) REQUIRE a.name IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Concept) REQUIRE c.name IS UNIQUE"
        ]
        
        with self.neo4j_driver.session() as session:
            for query in constraints:
                session.run(query)
        print("Neo4j semasi (Constraints) basariyla uygulandi.")

# Bu sınıftan tek bir nesne (Singleton) oluşturuyoruz
db = Database()
