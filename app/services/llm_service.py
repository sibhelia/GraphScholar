import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv

# Ayarlari yukle
load_dotenv()

class PaperMetadata(BaseModel):
    """Makale bilgilerini tutan veri yapisi."""
    title: str = Field(description="Makalenin tam basligi")
    authors: List[str] = Field(description="Yazarlarin isim listesi")
    year: Optional[int] = Field(description="Makalenin yayin yili")
    abstract: str = Field(description="Makalenin kisa ozeti")
    references: List[str] = Field(description="Makalenin kaynakcasinda gecen diger makale basliklari")

class LLMService:
    """Gemini API kullanarak metin analizi yapan servis."""
    
    def __init__(self):
        # Gemini modelini baslat
        api_key = os.getenv("GOOGLE_API_KEY")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.1
        )
        self.parser = JsonOutputParser(pydantic_object=PaperMetadata)

    def extract_metadata(self, text: str) -> dict:
        """
        Makale metninden baslik, yazar ve atif bilgilerini ayiklar.
        """
        prompt_template = """
        Sana bir akademik makalenin metnini verecegim. Lutfen bu metni incele ve 
        asagidaki bilgileri JSON formatinda cikar.
        
        Ozellikle 'references' kısmında makalenin kaynakcasinda atif yapilan 
        diger makalelerin tam basliklarini listelemen cok onemli.
        
        Metin:
        {context}
        
        {format_instructions}
        """
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )
        
        # LangChain LCEL yapisi ile zinciri olustur
        chain = prompt | self.llm | self.parser
        
        try:
            # Makalenin basini ve sonunu birlestirerek analiz et (Verimlilik icin)
            context = text[:10000] + "\n[...ARA KISIM ATLANDI...]\n" + text[-5000:]
            result = chain.invoke({"context": context})
            return result
        except Exception as e:
            print(f"LLM analiz hatasi: {e}")
            return {}

# Singleton nesnesi
llm_service = LLMService()
