import os
import time
from google import genai
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv
from typing import List, Dict

# Ayarlari yukle
load_dotenv()

class VectorService:
    """ChromaDB uzerinde vektor arama ve saklama islemlerini yoneten servis."""

    def __init__(self):
        # ChromaDB baglantisi (Daha stabil bir yapi ile)
        chroma_host = os.getenv("CHROMA_HOST", "chromadb")
        chroma_port = os.getenv("CHROMA_PORT", "8000")
        
        # Baglanti Deneme Dongusu
        for attempt in range(10):
            try:
                print(f"ChromaDB'ye baglaniliyor (Deneme {attempt + 1}/10)...")
                self.chroma_client = chromadb.HttpClient(
                    host=chroma_host,
                    port=int(chroma_port),
                    settings=Settings(allow_reset=True, anonymized_telemetry=False)
                )
                # Baglantiyi test et
                self.chroma_client.heartbeat()
                print("ChromaDB baglantisi basarili!")
                break
            except Exception as e:
                if attempt < 9:
                    print(f"ChromaDB'ye baglanilamadi, 5 saniye sonra tekrar denenecek... Hata: {e}")
                    time.sleep(5)
                else:
                    print("ChromaDB'ye baglanti 10 deneme sonunda basarisiz oldu.")
                    raise e
        
        # Gemini istemcisi (Embedding/Vektore cevirme icin)
        api_key = os.getenv("GOOGLE_API_KEY")
        self.genai_client = genai.Client(api_key=api_key)
        
        # Dinamik olarak en iyi embedding modelini bul
        self.embed_model = None
        for m in self.genai_client.models.list():
            if "embed" in m.name.lower():
                self.embed_model = m.name # Tam ismi kullan (models/... dahil)
                break
        
        if not self.embed_model:
            self.embed_model = "models/text-embedding-004" # Geri donus noktasi
            
        print(f"Vektör servisi başlatıldı. Seçilen Model: {self.embed_model}")
        
        # Koleksiyonu olustur veya al
        self.collection = self.chroma_client.get_or_create_collection(
            name="research_papers",
            metadata={"hnsw:space": "cosine"} # Benzerlik olcutu
        )

    def add_chunks(self, paper_id: str, chunks: List[str], metadata: Dict):
        """
        Metin parcalarini vektore cevirip ChromaDB'ye kaydeder.
        """
        if not chunks:
            return

        print(f"Vektore cevirme basliyor: {len(chunks)} parca...")
        
        ids = [f"{paper_id}_{i}" for i in range(len(chunks))]
        
        # Gemini ile toplu embedding (vektore cevirme) al
        try:
            embeddings_response = self.genai_client.models.embed_content(
                model=self.embed_model,
                contents=chunks,
                config={"task_type": "RETRIEVAL_DOCUMENT"}
            )
            
            embeddings = embeddings_response.embeddings
            
            # ChromaDB'ye metadata ile birlikte ekle
            self.collection.add(
                documents=chunks,
                embeddings=embeddings,
                metadatas=[metadata for _ in chunks],
                ids=ids
            )
            print(f"Vektör veritabanına {len(chunks)} parça başarıyla eklendi.")
        except Exception as e:
            print(f"Vektore cevirme veya kayit hatasi: {e}")

# Singleton nesnesi
vector_service = VectorService()
