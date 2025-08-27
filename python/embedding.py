import os
import json
from PIL import Image
from sentence_transformers import SentenceTransformer

# CLIP 모델 로드
model = SentenceTransformer("clip-ViT-B-32")

embeddings = []
folder = "./images"

# 파일명 정렬 (예: 1.jpg ~ 45.jpg 순서대로)
files = sorted(
    [f for f in os.listdir(folder) if f.lower().endswith((".jpg", ".jpeg", ".png", ".JPG"))],
    key=lambda x: int(os.path.splitext(x)[0])  # '1.jpg' → 1
)

for file in files:
    path = os.path.join(folder, file)
    img = Image.open(path)

    vec = model.encode(img, convert_to_numpy=True).tolist()  # numpy → list
    embeddings.append({
        "image_url": file,  # DB에 넣을 때 파일명만 저장
        "embedding": vec
    })

# JSON으로 저장 (DB insert 준비용)
with open("embeddings.json", "w", encoding="utf-8") as f:
    json.dump(embeddings, f, ensure_ascii=False)
