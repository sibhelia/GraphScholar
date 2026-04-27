import os
from typing import List, Dict
from app.services.vector_service import vector_service
from app.services.graph_service import graph_service
from app.services.llm_service import llm_service
from google import genai

class SearchService:
    """Vektor ve Graph verilerini birlestirerek akilli aramalar yapan servis."""

    def __init__(self):
        self.genai_client = vector_service.genai_client
        self.embed_model = vector_service.embed_model

    def perform_hybrid_search(self, query: str) -> Dict:
        """
        1. Vektor arama yap (ChromaDB)
        2. Graph genisletme yap (Neo4j)
        3. Gemini ile sentezle
        """
        print(f"Hibrit arama basliyor: '{query}'")

        # --- ADIM 1: VEKTOR ARAMA ---
        # Soruyu vektöre çevir
        query_embedding_response = self.genai_client.models.embed_content(
            model=self.embed_model,
            contents=query,
            config={"task_type": "RETRIEVAL_QUERY"}
        )
        # Gemini objesinden saf sayi listesini (values) ayikla
        query_embedding = query_embedding_response.embeddings[0].values

        # ChromaDB'den en yakin 5 parcayi bul
        vector_results = vector_service.collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
            include=["documents", "metadatas", "distances"]
        )

        relevant_docs = vector_results.get("documents", [[]])[0]
        relevant_metadatas = vector_results.get("metadatas", [[]])[0]
        relevant_distances = vector_results.get("distances", [[]])[0]
        
        # Hangi makalelerle ilgiliyiz?
        paper_titles = list(set([m.get("title") for m in relevant_metadatas if m.get("title")]))

        # --- ADIM 2: GRAPH GENISLETME ---
        graph_context = ""
        if paper_titles:
            # Neo4j'den bu makalelerin bagli oldugu kavramlari ve atiflari getir
            # (Basitlik icin ilk asamada bir Cypher sorgusu ile iliskileri cekiyoruz)
            for title in paper_titles:
                neighbor_data = graph_service.get_paper_neighbors(title)
                if neighbor_data:
                    concepts = ", ".join(neighbor_data.get("concepts", []))
                    citations = ", ".join(neighbor_data.get("citations", []))
                    graph_context += f"\n- Makale: '{title}'\n  Ilgili Kavramlar: {concepts}\n  Atif Yaptigi Eserler: {citations}\n"

        # --- ADIM 3: GEMINI ILE SENTEZ ---
        # Bağlamı oluştur
        context_text = "\n".join(relevant_docs)
        
        prompt = f"""
        Sen GraphScholar sisteminin akademik asistanisin. Sana asagida sunulan hem metin parcalarindan (Vektör) 
        hem de makale iliskilerinden (Graph) yararlanarak kullanicinin sorusunu cevapla.
        
        Soru: {query}
        
        METIN BAGLAMI (Vektör Veritabanindan):
        {context_text}
        
        ILISKISEL BAGLAM (Graph Veritabanindan):
        {graph_context}
        
        Cevabini akademik, yardimsever ve net bir dille yaz. Eger bilgi baglamda yoksa "Bilgi bulamadim" demek yerine, 
        elindeki bilgilerle en yakin tahmini yap veya hangi makalelere bakilmasi gerektigini soyle.
        """

        # Gemini'den cevabi al
        response = llm_service.client.models.generate_content(
            model=llm_service.model_name,
            contents=prompt
        )

        sources = []
        for idx, doc in enumerate(relevant_docs):
            metadata = relevant_metadatas[idx] if idx < len(relevant_metadatas) else {}
            distance = relevant_distances[idx] if idx < len(relevant_distances) else None
            sources.append({
                "title": metadata.get("title") or "Bilinmeyen Kaynak",
                "paper_id": metadata.get("paper_id"),
                "year": metadata.get("year"),
                "excerpt": doc[:320].strip(),
                "score": round(1 - distance, 4) if isinstance(distance, (int, float)) else None,
            })

        return {
            "answer": response.text,
            "relevant_papers": paper_titles,
            "source_chunks_count": len(relevant_docs),
            "sources": sources,
        }

# Singleton nesnesi
search_service = SearchService()
