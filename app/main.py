from fastapi import FastAPI

app = FastAPI(title="GraphScholar API")

@app.get("/")
async def root():
    return {"message": "GraphScholar Hybrid RAG API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
