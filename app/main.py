from fastapi import FastAPI, UploadFile, File, HTTPException
from contextlib import asynccontextmanager
import shutil
import os
from pathlib import Path

from app.database import db
from app.services.pdf_processor import pdf_processor
from app.services.llm_service import llm_service

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

@app.get("/")
async def root():
    return {"message": "GraphScholar Hybrid RAG API is running and connected to DBs"}

@app.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    """
    Bir PDF dosyasi alir, metnini cikarir ve Gemini ile analiz eder.
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
        
        # 3. Gemini ile analiz et
        metadata = llm_service.extract_metadata(raw_text)
        
        return {
            "filename": file.filename,
            "analysis": metadata
        }
        
    except Exception as e:
        print(f"Isleme hatasi: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Islem bittikten sonra gecici dosyayi silebiliriz
        if file_path.exists():
            os.remove(file_path)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
