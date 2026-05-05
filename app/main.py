from pydantic import BaseModel, Field
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import shutil
import os
from pathlib import Path

from app.database import db
from app.services.pdf_processor import pdf_processor
from app.services.llm_service import llm_service

from app.services.graph_service import graph_service
from app.services.vector_service import vector_service
from app.services.search_service import search_service
from app.services.arxiv_service import arxiv_service

# Yuklenen dosyalarin gecici olarak tutulacagi klasor
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- UYGULAMA BASLARKEN ---
    print("Uygulama baslatiliyor...")
    try:
        db.connect()
        db.init_neo4j_schema()
    except Exception as e:
        print(f"Baslatma hatasi: {e}")
    yield
    # --- UYGULAMA KAPANIRKEN ---
    print("Uygulama kapatiliyor...")
    db.close()

app = FastAPI(
    title="GraphScholar API",
    lifespan=lifespan
)

# CORS Middleware ayari (React Frontend'in Backend'e erisebilmesi icin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Uretime (Production) gecerken buraya frontend'in gercek domain'i yazilmali
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "GraphScholar Hybrid RAG API is running and connected to DBs"}

@app.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    """
    PDF'i alir, Gemini ile analiz eder, aninda Neo4j/ChromaDB'ye kaydeder.
    Referans zenginlestirmesi arka planda calisir — kullanici beklemez.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sadece PDF dosyalari kabul edilir.")
    
    file_path = UPLOAD_DIR / file.filename
    
    try:
        # 1. Dosyayi gecici olarak kaydet
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. PDF'den metni cikar
        raw_text = pdf_processor.extract_text_from_pdf(str(file_path))
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="PDF metni okunamadi.")
        
        # 3. Gemini ile analiz et (metadata: title, authors, year, abstract, concepts, references)
        metadata = llm_service.extract_metadata(raw_text)
        
        chunks_count = 0
        if metadata:
            # 4. Neo4j'ye ANINDA kaydet (ArXiv zenginlestirmesi olmadan — hizli)
            graph_service.add_paper_with_metadata(metadata)
            
            # 5. ChromaDB'ye ANINDA kaydet
            paper_id = metadata.get("title", file.filename).lower().replace(" ", "_")[:50]
            chunks = pdf_processor.simple_chunk_text(raw_text)
            chunks_count = len(chunks)
            
            vector_service.add_chunks(
                paper_id=paper_id,
                chunks=chunks,
                metadata={
                    "title": metadata.get("title"),
                    "year": metadata.get("year", 0),
                    "paper_id": paper_id
                }
            )

            # 6. Referanslari ARKA PLANDA zenginlestir (ArXiv - kullaniciyi bekletmez)
            references = metadata.get("references", [])
            if references and background_tasks:
                background_tasks.add_task(
                    graph_service.enrich_references_background,
                    paper_id=paper_id,
                    references=references[:10]  # Ilk 10 referansi zenginlestir
                )
                print(f"Arka plan gorevi baslatildi: {len(references[:10])} referans zenginlestirilecek.")
        
        return {
            "filename": file.filename,
            "status": "success",
            "saved_to_graph": bool(metadata),
            "saved_to_vector": bool(metadata),
            "chunks_count": chunks_count,
            "analysis": metadata,
            "background_enrichment": f"{len(metadata.get('references',[])[:10])} referans arka planda isleniyor"
        }
        
    except Exception as e:
        print(f"Isleme hatasi: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if file_path.exists():
            os.remove(file_path)

class ArXivRequest(BaseModel):
    title: str

@app.post("/add-from-arxiv")
async def add_from_arxiv(request: ArXivRequest):
    """
    ArXiv'den basliga gore makale bulur ve sisteme (Graph + Vector) ekler.
    """
    paper_info = arxiv_service.search_paper_by_title(request.title)
    if not paper_info:
        raise HTTPException(status_code=404, detail="Makale ArXiv'de bulunamadi.")
    
    try:
        # 1. Graph Veritabanina Ekle — yazarlar dahil tam metadata
        metadata = {
            "title": paper_info["title"],
            "year": paper_info["published"],
            "abstract": paper_info["summary"],
            "url": paper_info["url"],
            "arxiv_id": paper_info["arxiv_id"],
            "authors": paper_info.get("authors", []),
            "concepts": [],
            "references": []
        }
        
        graph_service.add_paper_with_metadata(metadata)
        
        # 2. Vector Veritabanina Ekle (Ozet kismini chunk olarak ekliyoruz)
        paper_id = paper_info["arxiv_id"]
        chunks = [paper_info["summary"]] # Su an sadece ozeti ekliyoruz, tam metin icin PDF indirme eklenebilir
        
        vector_service.add_chunks(
            paper_id=paper_id,
            chunks=chunks,
            metadata={
                "title": paper_info["title"],
                "year": paper_info["published"],
                "paper_id": paper_id,
                "is_abstract": True
            }
        )
        
        return {
            "status": "success",
            "paper": paper_info
        }
    except Exception as e:
        print(f"ArXiv ekleme hatasi: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search-arxiv")
async def search_arxiv(q: str):
    """
    Konuya gore ArXiv'de arama yapar.
    """
    if not q:
        return {"results": []}
    
    results = arxiv_service.search_papers(q)
    return {"results": results}

class QueryRequest(BaseModel):
    question: str
    history: list[dict] = Field(default_factory=list)

@app.post("/query")
async def query_system(request: QueryRequest):
    """
    Sisteme doğal dilde soru sorar. 
    Vektör (ChromaDB) ve Grafik (Neo4j) verilerini birleştirerek cevap üretir.
    """
    try:
        result = search_service.perform_hybrid_search(request.question, request.history)
        return result
    except Exception as e:
        print(f"Sorgulama hatasi: {e}")
        return {"error": str(e), "status": "failed"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/papers")
async def list_papers():
    try:
        papers = graph_service.list_papers()
        return {
            "papers": papers,
            "count": len(papers),
        }
    except Exception as e:
        print(f"Makale listeleme hatasi: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/library/overview")
async def library_overview():
    try:
        stats = graph_service.get_library_stats()
        chunk_count = vector_service.collection.count()
        return {
            "stats": {
                **stats,
                "chunk_count": chunk_count,
            }
        }
    except Exception as e:
        print(f"Kutuphane ozet hatasi: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enrich-authors")
async def enrich_authors(background_tasks: BackgroundTasks):
    """
    Neo4j'deki yazarsiz makaleleri bulur ve ArXiv'den yazarlarini arka planda ceker.
    """
    try:
        with db.neo4j_driver.session() as session:
            records = session.run("""
                MATCH (p:Paper)
                WHERE NOT (p)<-[:WROTE]-(:Author)
                AND p.title IS NOT NULL
                RETURN p.arxiv_id AS id, p.title AS title
                LIMIT 30
            """)
            papers_without_authors = [{"id": r["id"], "title": r["title"]} for r in records]

        if not papers_without_authors:
            return {"status": "ok", "message": "Tüm makalelerde yazar zaten mevcut.", "count": 0}

        background_tasks.add_task(graph_service.enrich_authors_background, papers_without_authors)

        return {
            "status": "started",
            "message": f"{len(papers_without_authors)} makale için yazar zenginleştirmesi arka planda başladı.",
            "count": len(papers_without_authors),
            "papers": [p["title"][:60] for p in papers_without_authors]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/seed-demo")
async def seed_demo():
    """
    Hazır, birbirine atıf yapan 5 AI makalesini doğrudan Neo4j'ye ekler.
    ArXiv API veya LLM kullanmaz — anlık çalışır.
    """
    papers = [
        {
            "arxiv_id": "1706.03762",
            "title": "Attention Is All You Need",
            "year": 2017,
            "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.",
            "url": "https://arxiv.org/abs/1706.03762",
            "authors": ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit"],
            "concepts": ["Transformer", "Self-Attention", "Neural Machine Translation", "Deep Learning"],
            "cites": []
        },
        {
            "arxiv_id": "1810.04805",
            "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
            "year": 2018,
            "abstract": "We introduce BERT, which stands for Bidirectional Encoder Representations from Transformers. BERT is designed to pre-train deep bidirectional representations from unlabeled text.",
            "url": "https://arxiv.org/abs/1810.04805",
            "authors": ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"],
            "concepts": ["BERT", "Pre-training", "NLP", "Transformer", "Fine-tuning"],
            "cites": ["1706.03762"]
        },
        {
            "arxiv_id": "2005.14165",
            "title": "Language Models are Few-Shot Learners",
            "year": 2020,
            "abstract": "We train GPT-3, an autoregressive language model with 175 billion parameters, and test its few-shot performance across NLP tasks.",
            "url": "https://arxiv.org/abs/2005.14165",
            "authors": ["Tom Brown", "Benjamin Mann", "Nick Ryder", "Melanie Subbiah"],
            "concepts": ["GPT-3", "Few-Shot Learning", "Large Language Models", "NLP", "Deep Learning"],
            "cites": ["1706.03762", "1810.04805"]
        },
        {
            "arxiv_id": "1907.11692",
            "title": "RoBERTa: A Robustly Optimized BERT Pretraining Approach",
            "year": 2019,
            "abstract": "We present a replication study of BERT pretraining that carefully measures the impact of many key hyperparameters and training data size.",
            "url": "https://arxiv.org/abs/1907.11692",
            "authors": ["Yinhan Liu", "Myle Ott", "Naman Goyal", "Jingfei Du"],
            "concepts": ["RoBERTa", "BERT", "Pre-training", "NLP", "Fine-tuning"],
            "cites": ["1810.04805", "1706.03762"]
        },
        {
            "arxiv_id": "2010.11929",
            "title": "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
            "year": 2020,
            "abstract": "We show that a pure transformer applied directly to sequences of image patches can perform very well on image classification tasks.",
            "url": "https://arxiv.org/abs/2010.11929",
            "authors": ["Alexey Dosovitskiy", "Lucas Beyer", "Alexander Kolesnikov", "Dirk Weissenborn"],
            "concepts": ["Vision Transformer", "ViT", "Image Classification", "Transformer", "Deep Learning"],
            "cites": ["1706.03762"]
        },
    ]

    try:
        with db.neo4j_driver.session() as session:
            for p in papers:
                # Makaleyi ekle
                session.run("""
                    MERGE (p:Paper {arxiv_id: $arxiv_id})
                    SET p.title = $title, p.year = $year, p.abstract = $abstract, p.url = $url
                """, **{k: p[k] for k in ["arxiv_id","title","year","abstract","url"]})

                # Yazarları ekle ve bağla
                for author in p["authors"]:
                    session.run("""
                        MERGE (a:Author {name: $name})
                        WITH a MATCH (p:Paper {arxiv_id: $arxiv_id})
                        MERGE (a)-[:WROTE]->(p)
                    """, name=author, arxiv_id=p["arxiv_id"])

                # Kavramları ekle ve bağla
                for concept in p["concepts"]:
                    session.run("""
                        MERGE (c:Concept {name: $name})
                        WITH c MATCH (p:Paper {arxiv_id: $arxiv_id})
                        MERGE (p)-[:MENTIONS]->(c)
                    """, name=concept, arxiv_id=p["arxiv_id"])

            # Atıf bağlarını ekle
            for p in papers:
                for cited_id in p["cites"]:
                    session.run("""
                        MATCH (a:Paper {arxiv_id: $from_id})
                        MATCH (b:Paper {arxiv_id: $to_id})
                        MERGE (a)-[:CITES]->(b)
                    """, from_id=p["arxiv_id"], to_id=cited_id)

        return {"status": "success", "message": f"{len(papers)} makale ve tüm ilişkiler başarıyla eklendi.", "count": len(papers)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/graph/path")
async def get_path(start: str, end: str):
    try:
        return graph_service.get_shortest_path(start, end)
    except Exception as e:
        print(f"Yol bulma hatasi: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/graph")
async def get_graph(limit: int = 40):
    try:
        return graph_service.get_graph_snapshot(limit=limit)
    except Exception as e:
        print(f"Grafik ozet hatasi: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
#  SOHBET GEÇMİŞİ CRUD (PostgreSQL)
# ─────────────────────────────────────────────────────────────

from app.models import Conversation, Message as MessageModel

class ConversationCreate(BaseModel):
    title: str = ""

class ConversationRename(BaseModel):
    title: str

class MessageCreate(BaseModel):
    role: str        # 'user' | 'assistant'
    content: str


def _get_session():
    """Yardımcı: mevcut PostgreSQL oturumunu döner."""
    if not db.SessionLocal:
        raise HTTPException(status_code=503, detail="PostgreSQL bağlantısı henüz hazır değil.")
    return db.SessionLocal()


@app.get("/conversations")
async def list_conversations():
    """Tüm sohbetleri (mesajları ile birlikte) döner."""
    session = _get_session()
    try:
        convs = session.query(Conversation).order_by(Conversation.updated_at.desc()).all()
        return [
            {
                "id": c.id,
                "title": c.title or "",
                "createdAt": c.created_at.isoformat() if c.created_at else None,
                "updatedAt": c.updated_at.isoformat() if c.updated_at else None,
                "messages": [
                    {"id": m.id, "role": m.role, "text": m.content,
                     "createdAt": m.created_at.isoformat() if m.created_at else None}
                    for m in c.messages
                ],
            }
            for c in convs
        ]
    finally:
        session.close()


@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Tek bir sohbeti mesajlarıyla döner."""
    session = _get_session()
    try:
        c = session.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not c:
            raise HTTPException(status_code=404, detail="Sohbet bulunamadı.")
        return {
            "id": c.id,
            "title": c.title or "",
            "createdAt": c.created_at.isoformat() if c.created_at else None,
            "updatedAt": c.updated_at.isoformat() if c.updated_at else None,
            "messages": [
                {"id": m.id, "role": m.role, "text": m.content,
                 "createdAt": m.created_at.isoformat() if m.created_at else None}
                for m in c.messages
            ],
        }
    finally:
        session.close()


@app.post("/conversations", status_code=201)
async def create_conversation(body: ConversationCreate):
    """Yeni boş bir sohbet oluşturur."""
    session = _get_session()
    try:
        conv = Conversation(title=body.title)
        session.add(conv)
        session.commit()
        session.refresh(conv)
        return {"id": conv.id, "title": conv.title, "createdAt": conv.created_at.isoformat(), "updatedAt": conv.updated_at.isoformat(), "messages": []}
    finally:
        session.close()


@app.patch("/conversations/{conversation_id}")
async def rename_conversation(conversation_id: str, body: ConversationRename):
    """Sohbet başlığını günceller."""
    session = _get_session()
    try:
        conv = session.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Sohbet bulunamadı.")
        conv.title = body.title
        session.commit()
        return {"ok": True}
    finally:
        session.close()


@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Sohbeti ve tüm mesajlarını siler."""
    session = _get_session()
    try:
        conv = session.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Sohbet bulunamadı.")
        session.delete(conv)
        session.commit()
        return {"ok": True}
    finally:
        session.close()


@app.post("/conversations/{conversation_id}/messages", status_code=201)
async def add_message(conversation_id: str, body: MessageCreate):
    """Bir sohbete yeni mesaj ekler ve sohbetin updated_at'ini günceller."""
    session = _get_session()
    try:
        conv = session.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Sohbet bulunamadı.")
        msg = MessageModel(conversation_id=conversation_id, role=body.role, content=body.content)
        session.add(msg)
        # updated_at'i elle güncelle
        from datetime import datetime, timezone
        conv.updated_at = datetime.now(timezone.utc)
        session.commit()
        session.refresh(msg)
        return {"id": msg.id, "role": msg.role, "text": msg.content, "createdAt": msg.created_at.isoformat()}
    finally:
        session.close()
