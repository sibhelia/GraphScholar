# PROJECT MEMORY BANK: GRAPHSCHOLAR (RESEARCHMIND)

## 1. PRODUCT CONTEXT
### Problem Statement
Geleneksel RAG (Retrieval-Augmented Generation) sistemleri, dökümanları birbirinden bağımsız metin parçaları (chunks) olarak işler. Bu durum, dökümanlar arasındaki atıf bağlarını, ortak yazar hiyerarşilerini ve kavramsal haritaları yok sayar. Akademik araştırmalarda "X makalesi hangi metodolojiden türetilmiştir?" gibi ilişkisel sorular mevcut vektör tabanlı sistemlerle sağlıklı yanıtlanamaz.

### Solution: Hybrid GraphRAG
GraphScholar, dökümanları hem semantik bir vektör uzayında (ChromaDB) hem de ilişkisel bir bilgi grafiğinde (Neo4j) eşzamanlı olarak modeller. Bu hibrit yaklaşım, LLM'in dökümanlar arası köprüler kurmasını sağlayarak daha derinlemesine ve tutarlı analizler yapmasına olanak tanır.

---

## 2. SYSTEM ARCHITECTURE & PATTERNS
### Tech Stack
- Language: Python 3.10+ (Asynchronous)
- API Framework: FastAPI
- Orchestration: LangChain (LCEL)
- Vector Storage: ChromaDB (Hierarchical metadata storage)
- Graph Storage: Neo4j (Property Graph Model)
- LLM: Gemini 1.5 Pro / Flash (Superior context window and speed)
- Deployment: Docker & Docker Compose

### Technical Patterns
- Entity Linking: Metinden çıkarılan her teknik kavram (örn: Self-Attention) Neo4j üzerinde tekil bir merkezi düğüme (Unique Constraint) bağlanır.
- Two-Hop Retrieval: Sorgu anında sadece ilgili metin parçası değil, o parçanın bağlı olduğu makalenin atıf yaptığı diğer kaynaklar da bağlama dahil edilir.
- Asynchronous Processing: PDF işleme ve embedding oluşturma süreçleri, API performansını etkilememesi için Background Tasks üzerinden yürütülür.

---

## 3. DATA SCHEMA & REQUIREMENTS
### Neo4j Graph Schema
- Nodes:
    - Paper: title, year, arxiv_id, abstract
    - Author: name, affiliation
    - Concept: name, category
    - Institution: name, location
- Relationships:
    - (Author)-[:WROTE]->(Paper)
    - (Paper)-[:CITES]->(Paper)
    - (Paper)-[:INTRODUCES]->(Concept)
    - (Author)-[:AFFILIATED_WITH]->(Institution)

### Functional Requirements
- FR-1: ArXiv API entegrasyonu ile otomatik makale çekme ve duplicate kontrolü.
- FR-2: PDF dökümanlarından kaynakça (References) kısmının regex/NLP ile ayrıştırılıp Neo4j'ye işlenmesi.
- FR-3: LLM'in Cypher (Neo4j sorgu dili) üreterek graf üzerinde gezinmesi.

### Non-Functional Requirements
- NFR-1: Veritabanı ve uygulama katmanlarının Docker network içinde izole edilmesi.
- NFR-2: API yanıtlarında kaynak gösterimi (Citation) zorunluluğu.

---

## 4. ACTIVE CONTEXT & ROADMAP
### Current State
- Mimari tasarım ve veri şeması kesinleşti.
- Teknik dökümantasyon (Memory Bank) tamamlandı.
- Dockerize altyapı parametreleri belirlendi.

### Phase 1: Infrastructure (Next Step)
- Docker Compose dosyasının oluşturulması (FastAPI, Neo4j, ChromaDB servisleri).
- Neo4j üzerinde Unique Constraint ve Index'lerin tanımlanması.

### Phase 2: Ingestion Engine
- PDF Parsing ve Semantic Chunking algoritmalarının implementasyonu.
- Metadata extractor (Yazar, Yıl, Atıf ayıklayıcı) geliştirilmesi.

### Phase 3: Hybrid Search & Synthesis
- Vektör ve Graph sonuçlarını birleştiren RAG zincirinin kurulması.
- Gemini 1.5 Pro / Flash ile "Reasoning" katmanının entegrasyonu.

---

## 5. TECHNICAL DEBT & LOGS
- Debt: Başlangıçta OCR desteği olmayacak; sadece dijital (searchable) PDF'ler işlenecek.
- Log 2026-04-22: Proje anayasası oluşturuldu. Vektör-Graph hibrit yapısı ana strateji olarak belirlendi.