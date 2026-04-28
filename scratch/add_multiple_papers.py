import requests
import json
import time

url = "http://localhost:8080/add-from-arxiv"
papers = [
    "Language Models are Few-Shot Learners",
    "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    "Generative Adversarial Nets"
]
headers = {"Content-Type": "application/json"}

for paper in papers:
    print(f"Ekleniyor: {paper}...")
    try:
        response = requests.post(url, data=json.dumps({"title": paper}), headers=headers)
        print(f"Sonuç: {response.json().get('status')}")
        time.sleep(1) # API limitlerine takilmamak icin
    except Exception as e:
        print(f"Hata ({paper}): {e}")
