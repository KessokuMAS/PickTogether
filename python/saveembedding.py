import json
import pymysql

# DB 연결
conn = pymysql.connect(
    host="localhost",
    user="pickdbuser",
    password="1234",
    db="pickdb",
    charset="utf8mb4"
)
cursor = conn.cursor()

# JSON 파일 읽기
with open("embeddings.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx, item in enumerate(data, start=1):
    restaurant_id = idx   # 1.jpg → restaurant_id=1 이런 식으로 매핑한다고 가정
    image_url = item["image_url"]
    embedding = json.dumps(item["embedding"])  # list → JSON 문자열

    sql = """
    INSERT INTO restaurant_image_embedding (restaurant_id, image_url, embedding)
    VALUES (%s, %s, %s)
    """
    cursor.execute(sql, (restaurant_id, image_url, embedding))

conn.commit()
cursor.close()
conn.close()
