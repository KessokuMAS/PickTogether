import os
import pandas as pd
import pymysql
import plotly.express as px
import torch
import torch.nn as nn
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from fastapi import UploadFile, File
from sentence_transformers import SentenceTransformer, util
from PIL import Image
import json
from prompts import BASE_PROMPT, SEARCH_PROMPT


# FastAPI 앱 생성
app = FastAPI()

#임베딩 모델
clip_model = SentenceTransformer("clip-ViT-B-32")

# OpenAI API 키
os.environ['OPENAI_API_KEY'] = "API_KEY"   

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 연결
def get_connection():
    return pymysql.connect(
        host="localhost",
        user="pickdbuser",
        password="1234",
        db="pickdb",
        charset="utf8mb4"
    )

# 1) 카테고리별 주문 비율 차트
@app.get("/chart/category")
def category_chart(user_email: str):
    conn = get_connection()
    sql = """
    SELECT r.category_name, COUNT(f.id) AS order_count
    FROM funding f
    JOIN restaurant r ON f.restaurant_id = r.id
    WHERE f.member_email = %s
      AND f.status = 'COMPLETED'
    GROUP BY r.category_name
    """
    df = pd.read_sql(sql, conn, params=[user_email])
    conn.close()

    if df.empty:
        return {"message": "카테고리 데이터 없음"}

    # 제일 많이 주문한 카테고리
    top_row = df.loc[df["order_count"].idxmax()]
    summary_text = f"{top_row['category_name']} ({top_row['order_count']}회)를 가장 많이 펀딩했어요!"

    # 파이차트 생성
    fig = px.pie(
        df,
        names="category_name",
        values="order_count",
        title="카테고리별 펀딩 비율",
        hole=0.3
    )
    fig.update_layout(
        height=400, width=600,
        margin=dict(l=20, r=20, t=40, b=40)
    )
    html_chart = fig.to_html(full_html=False)

    return Response(
        content=f"""
        <div style="text-align:center;">
            {html_chart}
            <p style="font-size:18px; font-weight:bold; color:#333;">
                {summary_text}
            </p>
        </div>
        """,
        media_type="text/html"
    )

# 2) 카테고리 기반 추천
@app.get("/recommend/top-restaurants")
def recommend_top_restaurants(user_email: str):
    conn = get_connection()
    sql_top = """
    SELECT r.category_name, COUNT(f.id) AS order_count
    FROM funding f
    JOIN restaurant r ON f.restaurant_id = r.id
    WHERE f.member_email = %s
      AND f.status = 'COMPLETED'
    GROUP BY r.category_name
    ORDER BY order_count DESC
    LIMIT 1
    """
    top_df = pd.read_sql(sql_top, conn, params=[user_email])
    if top_df.empty:
        conn.close()
        return {"message": "추천할 카테고리가 없습니다.", "data": []}
    top_category = top_df.iloc[0]["category_name"]

    # 같은 카테고리 음식점 추천
    sql_rec = """
    SELECT id, name, category_name, road_address_name
    FROM restaurant
    WHERE category_name = %s
    ORDER BY RAND()
    LIMIT 5
    """
    rec_df = pd.read_sql(sql_rec, conn, params=[top_category])
    conn.close()

    return {
        "topCategory": str(top_category),
        "recommended": rec_df.to_dict(orient="records")
    }

# 3) 식당 TOP 5 차트
@app.get("/chart/restaurant")
def restaurant_chart(user_email: str):
    conn = get_connection()
    sql = """
    SELECT r.name AS restaurant_name, COUNT(f.id) AS order_count
    FROM funding f
    JOIN restaurant r ON f.restaurant_id = r.id
    WHERE f.member_email = %s
      AND f.status = 'COMPLETED'
    GROUP BY r.name
    ORDER BY order_count DESC
    LIMIT 5
    """
    df = pd.read_sql(sql, conn, params=[user_email])
    conn.close()

    if df.empty:
        return {"message": "식당 데이터 없음", "data": []}

    # 제일 많이 주문한 식당
    top_row = df.loc[df["order_count"].idxmax()]
    summary_text = f"{top_row['restaurant_name']} ({top_row['order_count']}회)에서 가장 많이 펀딩했어요!"

    # 바 차트
    fig = px.bar(
        df,
        x="restaurant_name",
        y="order_count",
        text="order_count",
        labels={
            "restaurant_name": "식당 이름",
            "order_count": "주문 수"
        }
    )
    fig.update_traces(textposition="outside", marker_color="skyblue")
    fig.update_layout(
        height=400, width=600,
        margin=dict(l=40, r=40, t=50, b=100),
        yaxis=dict(dtick=1, tickangle=0)
    )
    html_chart = fig.to_html(full_html=False)

    return Response(
        content=f"""
        <div style="text-align:center;">
            {html_chart}
            <p style="font-size:18px; font-weight:bold; color:#333;">
                {summary_text}
            </p>
        </div>
        """,
        media_type="text/html"
    )

# 4) 추천 모델
class SimpleRec(nn.Module):
    def __init__(self, num_users, num_items, embed_dim=32):
        super(SimpleRec, self).__init__()
        self.user_embed = nn.Embedding(num_users, embed_dim)
        self.item_embed = nn.Embedding(num_items, embed_dim)
        self.fc = nn.Linear(embed_dim * 2, 1)

    def forward(self, user, item):
        u = self.user_embed(user)
        i = self.item_embed(item)
        x = torch.cat([u, i], dim=1)
        return torch.sigmoid(self.fc(x))

# 모델 불러오기
conn = get_connection()
df = pd.read_sql("SELECT member_email, restaurant_id FROM funding", conn)
conn.close()

user2idx = {u: idx for idx, u in enumerate(df["member_email"].unique())}
item2idx = {i: idx for idx, i in enumerate(df["restaurant_id"].unique())}

num_users = len(user2idx)
num_items = len(item2idx)

model = SimpleRec(num_users, num_items)
model.load_state_dict(torch.load("saved_models/recommender_v2.pth", map_location="cpu"))
model.eval()

# 추천 API
@app.get("/recommend/deep")
def recommend_restaurants(user_email: str):
    if user_email not in user2idx:
        return {"message": "알 수 없는 유저"}

    user_id = torch.tensor([user2idx[user_email]])
    scores = []
    for item, idx in item2idx.items():
        item_id = torch.tensor([idx])
        with torch.no_grad():
            score = model(user_id, item_id).item()
        scores.append((item, score))

    top_items = sorted(scores, key=lambda x: x[1], reverse=True)[:10]
    top_ids = [t[0] for t in top_items]

    conn = get_connection()
    placeholders = ",".join(["%s"] * len(top_ids))
    sql = f"""
    SELECT r.id, r.name, r.category_name,
           r.funding_amount, r.funding_goal_amount,
           r.funding_start_date, r.funding_end_date,
           ri.image_url
    FROM restaurant r
    LEFT JOIN restaurant_image ri ON r.id = ri.restaurant_id
    WHERE r.id IN ({placeholders})
      AND ri.is_main = TRUE
    """
    rec_df = pd.read_sql(sql, conn, params=top_ids)
    conn.close()

    return {
        "user": user_email,
        "recommended": rec_df.to_dict(orient="records")
    }

# 5) 챗봇 API
class ChatRequest(BaseModel):
    message: str

from fastapi import FastAPI
from pydantic import BaseModel
from langchain.schema import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from prompts import BASE_PROMPT, SEARCH_PROMPT   # ✅ 프롬프트 임포트


class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat_with_ai(req: ChatRequest):
    try:
        llm = ChatOpenAI(model="gpt-4o-mini")

        # 찜 목록에서 성공 가능성 높은 식당 찾기
        if "찜 목록에서 성공 가능성 높은 거" in req.message or "성공 가능성 높은 거" in req.message:
            return get_high_success_restaurants()
        
        # DB 결과 예시 (나중에 search_products 같은 함수로 대체)
        db_context = "나도 몰라 !!!!!!!!!!!!!!!!!!!"

        messages = [
            SystemMessage(content=BASE_PROMPT),
            HumanMessage(content=SEARCH_PROMPT.format(
                user_input=req.message,
                db_results=db_context
            ))
        ]

        response = llm.invoke(messages)
        return {"response": response.content}
    except Exception as e:
        return {"error": str(e)}

# 찜 목록에서 성공 가능성이 높은 식당 찾기
def get_high_success_restaurants():
    conn = get_connection()
    
    # 찜 목록 가져오기 (wishlist 테이블이 있다고 가정)
    sql = """
    SELECT r.id, r.name, r.category_name, r.funding_goal_amount,
           r.funding_start_date, r.funding_end_date, ri.image_url, r.place_url,
           r.funding_amount + COALESCE(SUM(f.total_amount), 0) AS total_funding_amount
    FROM restaurant r
    LEFT JOIN restaurant_image ri ON r.id = ri.restaurant_id AND ri.is_main = TRUE
    LEFT JOIN funding f ON r.id = f.restaurant_id AND f.status = 'COMPLETED'
    WHERE r.id IN (
        SELECT restaurant_id FROM wishlist
    )
    GROUP BY r.id, r.name, r.category_name, r.funding_goal_amount,
             r.funding_start_date, r.funding_end_date, ri.image_url, r.place_url, r.funding_amount
    """
    
    try:
        df = pd.read_sql(sql, conn)
        conn.close()
        
        if df.empty:
            return {"response": "찜한 식당이 없습니다."}
        
        # 디버깅을 위한 로그 출력
        print("=== 디버깅 정보 ===")
        print("데이터프레임 내용:")
        print(df[['name', 'total_funding_amount', 'funding_goal_amount']])
        print("==================")
        
        # 신동궁감자탕뼈숯불구이의 펀딩 내역 직접 확인
        debug_conn = get_connection()
        debug_sql = """
        SELECT f.id, f.total_amount, f.status, f.created_at
        FROM funding f
        JOIN restaurant r ON f.restaurant_id = r.id
        WHERE r.name LIKE '%신동궁감자탕뼈숯불구이%'
        ORDER BY f.created_at DESC
        """
        debug_df = pd.read_sql(debug_sql, debug_conn)
        print("=== 신동궁감자탕뼈숯불구이 펀딩 내역 ===")
        print(debug_df)
        print("========================================")
        debug_conn.close()
        
        # 성공 가능성 계산 (간단한 공식)
        df['success_rate'] = (df['total_funding_amount'] / df['funding_goal_amount'] * 100).round(1)
        
        # 성공률 높은 순으로 정렬
        df_sorted = df.sort_values('success_rate', ascending=False)
        
        # 상위 3개 추천
        top_restaurants = df_sorted.head(3)

        
        # 각 식당마다 텍스트와 버튼을 함께 구성
        restaurant_items = []
        
        for idx, row in top_restaurants.iterrows():
            success_rate = round(row['success_rate'])  # 소숫점 반올림
            current_amount = int(row['total_funding_amount'])
            goal_amount = int(row['funding_goal_amount'])
            
            restaurant_items.append({
                "text": f"{row['name']}\n   현재: {current_amount:,}원 / 목표: {goal_amount:,}원\n   펀딩률: {success_rate}%",
                "button": {
                    "label": f"{row['name']} 상세보기",
                    "url": f"http://localhost:3000/restaurant/{row['id']}"
                }
            })
        
        return {
            "response": "🎯 찜 목록에서 성공 가능성이 높은 식당 TOP 3 입니다",
            "restaurant_items": restaurant_items
        }
        
    except Exception as e:
        conn.close()
        return {"response": f"찜 목록을 불러오는 중 오류가 발생했습니다: {str(e)}"}



@app.get("/search")
def search(query: str):
    conn = get_connection()
    df = pd.read_sql("SELECT restaurant_id, description FROM restaurant_description", conn)
    conn.close()

    # TF-IDF 검색
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df["description"])
    query_vec = vectorizer.transform([query])

    cos_sim = cosine_similarity(query_vec, tfidf_matrix).flatten()
    df["score"] = cos_sim

    # 상위 5개 매칭
    top_matches = df.sort_values("score", ascending=False).head(5)
    top_ids = top_matches["restaurant_id"].tolist()

    if not top_ids:
        return {"query": query, "related_keywords": [], "results": []}

    # 음식점 상세정보 + 메인 이미지 가져오기
    conn = get_connection()
    placeholders = ",".join(["%s"] * len(top_ids))
    sql = f"""
    SELECT r.id, r.name, r.category_name,
           r.funding_amount, r.funding_goal_amount,
           r.funding_start_date, r.funding_end_date,
           ri.image_url
    FROM restaurant r
    LEFT JOIN restaurant_image ri ON r.id = ri.restaurant_id
    WHERE r.id IN ({placeholders})
      AND ri.is_main = TRUE
    """
    rec_df = pd.read_sql(sql, conn, params=top_ids)
    conn.close()

    # OpenAI 연관검색어 요청
    llm = ChatOpenAI(model="gpt-4o-mini")
    prompt = f"""
    사용자가 '{query}'를 검색했어.
    사람들이 이 단어를 검색할 때 같이 자주 찾는 연관 검색어를 5개 추천해줘.
    답변은 리스트 형태로, 불필요한 설명은 빼고 단어만 줘.
    """
    response = llm.invoke(prompt)
    related_keywords = response.content.strip().split("\n")

    return {
        "query": query,
        "related_keywords": related_keywords,
        "results": rec_df.to_dict(orient="records")
    }

@app.post("/search/image")
async def search_by_image(file: UploadFile = File(...)):
    image = Image.open(file.file)
    query_vec = clip_model.encode(image, convert_to_numpy=True)  # float32

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT restaurant_id, image_url, embedding FROM restaurant_image_embedding")
    rows = cursor.fetchall()
    conn.close()

    # 유사도 계산
    results = []
    for row in rows:
        restaurant_id = row[0]
        image_url = row[1]
        emb = np.array(json.loads(row[2]), dtype=np.float32)  # ✅ dtype 맞추기
        score = util.cos_sim(query_vec, emb).item()
        results.append({
            "restaurant_id": restaurant_id,
            "image_url": image_url,
            "score": score
        })

    # 상위 5개
    top_results = sorted(results, key=lambda x: x["score"], reverse=True)[:5]
    top_ids = [r["restaurant_id"] for r in top_results]

    if not top_ids:
        return {"results": []}

    # ✅ 음식점 상세정보 가져오기 (search랑 동일)
    conn = get_connection()
    placeholders = ",".join(["%s"] * len(top_ids))
    sql = f"""
    SELECT r.id, r.name, r.category_name,
           r.funding_amount, r.funding_goal_amount,
           r.funding_start_date, r.funding_end_date,
           ri.image_url
    FROM restaurant r
    LEFT JOIN restaurant_image ri ON r.id = ri.restaurant_id
    WHERE r.id IN ({placeholders})
      AND ri.is_main = TRUE
    """
    rec_df = pd.read_sql(sql, conn, params=top_ids)
    conn.close()

    # ✅ 스코어 매칭해서 결과 병합
    score_map = {r["restaurant_id"]: r["score"] for r in top_results}
    rec_df["score"] = rec_df["id"].map(score_map)

    # ✅ 스코어 높은 순으로 정렬
    rec_df = rec_df.sort_values("score", ascending=False)

    return {
        "results": rec_df.to_dict(orient="records")
    }
