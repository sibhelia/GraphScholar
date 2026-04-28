import requests
import json

url = "http://localhost:8080/add-from-arxiv"
data = {"title": "Attention Is All You Need"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(response.json())
except Exception as e:
    print(f"Hata: {e}")
