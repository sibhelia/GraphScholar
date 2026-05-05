from typing import Dict

from app.services.graph_service import graph_service
from app.services.llm_service import llm_service
from app.services.vector_service import vector_service


class SearchService:
    """Vektor ve graph verilerini birlestirerek arama yapan servis."""

    def __init__(self):
        self.genai_client = vector_service.genai_client
        self.embed_model = vector_service.embed_model

    def _search_vector_context(self, query: str) -> tuple[list[str], list[dict], list[float]]:
        """ChromaDB'den ilgili metin parcalarini bulur."""
        try:
            query_embedding_response = self.genai_client.models.embed_content(
                model=self.embed_model,
                contents=query,
                config={"task_type": "RETRIEVAL_QUERY"},
            )
            query_embedding = query_embedding_response.embeddings[0].values

            vector_results = vector_service.collection.query(
                query_embeddings=[query_embedding],
                n_results=5,
                include=["documents", "metadatas", "distances"],
            )

            docs = vector_results.get("documents", [[]])[0] or []
            metadatas = vector_results.get("metadatas", [[]])[0] or []
            distances = vector_results.get("distances", [[]])[0] or []
            return docs, metadatas, distances
        except Exception as e:
            print(f"Vektor arama fallback'e dusuyor: {e}")
            return [], [], []

    def perform_hybrid_search(self, query: str) -> Dict:
        """
        1. Vektor arama yap (ChromaDB)
        2. Graph genisletme yap (Neo4j)
        3. Gerekirse graph ozetleriyle fallback yap
        4. Gemini ile sentezle
        """
        print(f"Hibrit arama basliyor: '{query}'")

        relevant_docs, relevant_metadatas, relevant_distances = self._search_vector_context(query)
        paper_titles = list(dict.fromkeys([m.get("title") for m in relevant_metadatas if m.get("title")]))

        graph_papers = graph_service.get_paper_summaries(limit=8)
        graph_abstract_papers = [paper for paper in graph_papers if paper.get("abstract")]

        if not paper_titles:
            paper_titles = [paper["title"] for paper in graph_papers[:5] if paper.get("title")]

        graph_context = ""
        for title in paper_titles[:5]:
            neighbor_data = graph_service.get_paper_neighbors(title)
            if neighbor_data:
                concepts = ", ".join([c for c in neighbor_data.get("concepts", []) if c]) or "Yok"
                citations = ", ".join([c for c in neighbor_data.get("citations", []) if c]) or "Yok"
                graph_context += (
                    f"\n- Makale: '{title}'\n"
                    f"  Ilgili Kavramlar: {concepts}\n"
                    f"  Atif Yaptigi Eserler: {citations}\n"
                )

        library_context = ""
        for paper in graph_abstract_papers[:6]:
            authors = ", ".join(paper.get("authors", [])[:3]) or "Yazar bilgisi yok"
            library_context += (
                f"\n- Baslik: {paper['title']}\n"
                f"  Yazarlar: {authors}\n"
                f"  Yil: {paper.get('year') or 'Bilinmiyor'}\n"
                f"  Ozet: {paper['abstract']}\n"
            )

        context_text = "\n".join(relevant_docs)

        if not context_text and not library_context and not graph_context:
            return {
                "answer": "Kutuphanede sorguya temel olacak metin veya makale ozeti bulamadim. Once PDF yukleyebilir ya da ArXiv'den makale ekleyebilirsin.",
                "relevant_papers": [],
                "source_chunks_count": 0,
                "sources": [],
            }

        prompt = f"""
        Sen GraphScholar sisteminin akademik asistanisin.
        Kullanici sorusunu asagidaki kaynaklara dayanarak cevapla.
        Eger vektor verisi azsa veya yoksa, kutuphanedeki makale ozetlerinden sentez yap.
        Kullanicinin kutuphanesinde makaleler varsa "veri yok" deme.
        Ozellikle toplu ozet istenirse, ana bulgulari, ortak temalari ve arastirma egilimlerini tek bir duzgun paragrafta derle.

        Soru: {query}

        METIN BAGLAMI (Vektor Veritabanindan):
        {context_text}

        KUTUPHANE OZETLERI (Neo4j Makale Kayitlari):
        {library_context}

        ILISKISEL BAGLAM (Graph Veritabanindan):
        {graph_context}

        Cevabi akademik, net ve dogrudan yaz.
        """

        response = llm_service.client.models.generate_content(
            model=llm_service.model_name,
            contents=prompt,
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

        if not sources:
            for paper in graph_abstract_papers[:5]:
                sources.append({
                    "title": paper.get("title") or "Bilinmeyen Kaynak",
                    "paper_id": paper.get("id"),
                    "year": paper.get("year"),
                    "excerpt": (paper.get("abstract") or "")[:320].strip(),
                    "score": None,
                })

        return {
            "answer": response.text,
            "relevant_papers": paper_titles,
            "source_chunks_count": len(relevant_docs),
            "sources": sources,
        }


search_service = SearchService()
