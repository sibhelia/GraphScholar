import arxiv
from typing import Optional, Dict

class ArXivService:
    """ArXiv API uzerinden makale bilgilerini sorgulayan servis."""

    def __init__(self):
        self.client = arxiv.Client()

    def search_paper_by_title(self, title: str) -> Optional[Dict]:
        """
        Verilen basliga en yakin makaleyi ArXiv'de arar.
        """
        if not title or len(title) < 10:
            return None

        try:
            # Basliga gore arama yap (en iyi 1 sonucu al)
            search = arxiv.Search(
                query=f'ti:"{title}"',
                max_results=1
            )
            
            results = list(self.client.results(search))
            
            if not results:
                return None
            
            paper = results[0]
            return {
                "arxiv_id": paper.get_short_id(),
                "title": paper.title,
                "summary": paper.summary,
                "url": paper.entry_id,
                "published": paper.published.year
            }
        except Exception as e:
            print(f"ArXiv arama hatasi ({title}): {e}")
            return None

    def search_papers(self, query: str, max_results: int = 5):
        """
        Verilen anahtar kelimeye gore ArXiv'de arama yapar ve liste doner.
        """
        try:
            search = arxiv.Search(
                query=query,
                max_results=max_results,
                sort_by=arxiv.SortCriterion.Relevance
            )
            
            results = []
            for paper in self.client.results(search):
                results.append({
                    "arxiv_id": paper.get_short_id(),
                    "title": paper.title,
                    "summary": paper.summary[:300] + "...", # Ozetin bir kismi
                    "url": paper.entry_id,
                    "published": paper.published.year,
                    "authors": [author.name for author in paper.authors]
                })
            return results
        except Exception as e:
            print(f"ArXiv genel arama hatasi ({query}): {e}")
            return []

# Singleton nesnesi
arxiv_service = ArXivService()
