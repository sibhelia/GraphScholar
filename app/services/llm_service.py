import os
import json
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
        
        # Dinamik olarak uygun modeli bul
        self.model_name = None
        for m in self.client.models.list():
            if "flash" in m.name:
                self.model_name = m.name.replace("models/", "")
                break
                    
        if not self.model_name:
            self.model_name = "gemini-2.5-flash" # Varsayilan
            
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
        context = text[:8000] + "\n[...ARA KISIM ATLANDI...]\n" + text[-4000:]
        
        prompt = f"""
        Sana bir akademik makalenin metnini verecegim. Lutfen bu metni incele ve 
        asagidaki bilgileri SADECE JSON formatinda dondur. Baska hicbir aciklama ekleme.
        
        Istenen JSON formati:
        {{
            "title": "Makalenin tam basligi",
            "authors": ["Yazar 1", "Yazar 2"],
            "year": 2024,
            "abstract": "Makalenin kisa ozeti (2-3 cumle)",
            "references": ["Atif yapilan makale basligi 1", "Atif yapilan makale basligi 2"]
        }}
        
        Makale metni:
        {context}
        
        SADECE gecerli JSON dondur, baska bir sey yazma:
        """
        
        try:
            print("Gemini API'ye istek gonderiliyor...")
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json"
                )
            )
            raw_response = response.text.strip()
            print(f"Gemini'den ham cevap alindi (ilk 200 karakter): {raw_response[:200]}")
            
            result = json.loads(raw_response)
            print("JSON basariyla ayiklandi.")
            return result
        except json.JSONDecodeError as e:
            print(f"HATA - JSON ayiklama hatasi: {e}")
            return {}
        except Exception as e:
            print(f"HATA - LLM analiz hatasi: {str(e)}")
            return {}

# Singleton nesnesi
llm_service = LLMService()
