import pypdf
from typing import List

class PDFProcessor:
    """PDF dokumanlarini okuyan ve metin parcalarina (chunks) bolen sinif."""
    
    def __init__(self):
        # Ileride buraya chunk_size gibi parametreler eklenebilir
        pass

    def extract_text_from_pdf(self, file_path: str) -> str:
        """
        Verilen dosya yolundaki PDF'in tum sayfalarini okur ve birlestirir.
        """
        text = ""
        try:
            with open(file_path, "rb") as file:
                # PDF okuyucuyu baslat
                reader = pypdf.PdfReader(file)
                # Tum sayfalari gez ve metni al
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
            
            return text
        except Exception as e:
            print(f"PDF okuma hatasi: {e}")
            raise e

    def simple_chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Metni belirlenen uzunluklarda parcalara boler.
        Overlap (ortak kisim) sayesinde parcalar arasindaki anlam butunlugu korunur.
        """
        chunks = []
        if not text:
            return chunks
            
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            # Bir sonraki parca biraz geriden baslar (overlap)
            start += (chunk_size - overlap)
            
        return chunks

# Singleton nesnesi
pdf_processor = PDFProcessor()
