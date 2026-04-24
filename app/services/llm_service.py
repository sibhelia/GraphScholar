import os
import json
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Ayarlari yukle
load_dotenv()

class LLMService:
    """Google GenAI SDK kullanarak metin analizi yapan servis."""
    
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("UYARI: GOOGLE_API_KEY bulunamadi!")
            self.client = None
            return
        
        self.client = genai.Client(api_key=api_key)
        
        # Dinamik olarak en SON cikan flash modelini bul
        available_models = sorted([m.name.replace("models/", "") for m in self.client.models.list()], reverse=True)
        
        self.model_name = None
        for model in available_models:
            if "flash" in model:
                self.model_name = model
                break
                    
        if not self.model_name:
            self.model_name = "gemini-1.5-flash" # Guvenli liman
            
        print(f"Gemini istemcisi baslatildi. Otomatik Secilen En Yeni Model: {self.model_name}")
            
        print(f"Gemini istemcisi baslatildi. Secilen Model: {self.model_name}")

    def extract_metadata(self, text: str) -> dict:
        """
        Makale metninden baslik, yazar ve atif bilgilerini ayiklar.
        """
        if not text:
            print("HATA: Analiz edilecek metin bos.")
            return {}
        
        if not self.client:
            print("HATA: Gemini istemcisi baslatilamamis.")
            return {}
            
        print(f"Analiz basliyor. Gelen metin boyutu: {len(text)} karakter.")
        
        # Makalenin basini ve sonunu birlestirerek analiz et (token limitini asma)
        context = text[:5000] + "\n[...METIN DEVAM EDIYOR...]\n" + text[-2000:]
        
        prompt = f"""
        Extract the following information from this academic paper text and return it ONLY as a valid JSON object.
        
        REQUIRED JSON FORMAT:
        {{
            "title": "Full title of the paper",
            "authors": ["Author Name 1", "Author Name 2"],
            "year": 2026,
            "abstract": "Brief 2-3 sentence summary",
            "concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"],
            "references": ["Cited Paper Title 1", "Cited Paper Title 2"]
        }}
        
        Return ONLY the JSON. No extra text.
        
        PAPER TEXT:
        {context}
        """
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"Gemini API'ye istek gonderiliyor (Model: {self.model_name}, Deneme: {attempt + 1})...")
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.1
                    )
                )
                
                if not response or not response.text:
                    print("HATA: Gemini'den bos veya gecersiz cevap dondu.")
                    return {}
                    
                raw_response = response.text.strip()
                break # Basarili ise donguden cik
                
            except Exception as e:
                if "503" in str(e) or "overloaded" in str(e).lower():
                    if attempt < max_retries - 1:
                        print(f"Gemini mesgul, 3 saniye sonra tekrar denenecek... ({attempt + 1}/{max_retries})")
                        time.sleep(3)
                        continue
                print(f"HATA - LLM analiz hatasi: {str(e)}")
                return {}
        
        try:
            # JSON'u ayikla (markdown bloklarini temizle)
            if "```json" in raw_response:
                raw_response = raw_response.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_response:
                raw_response = raw_response.split("```")[1].split("```")[0].strip()
            
            print(f"Gemini cevabi alindi. Boyut: {len(raw_response)}")
                
            result = json.loads(raw_response)
            return result
        except Exception as e:
            print(f"HATA - LLM analiz hatasi: {str(e)}")
            if 'raw_response' in locals():
                print(f"Ham cevap: {raw_response[:200]}...")
            return {}
        except json.JSONDecodeError as e:
            print(f"HATA - JSON ayiklama hatasi: {e}")
            return {}
        except Exception as e:
            print(f"HATA - LLM analiz hatasi: {str(e)}")
            return {}

# Singleton nesnesi
llm_service = LLMService()
