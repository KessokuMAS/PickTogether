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

# FastAPI 앱 생성
app = FastAPI()

# OpenAI API 키
os.environ['OPENAI_API_KEY'] = '[your_api_key]' 


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

@app.post("/chat")
def chat_with_ai(req: ChatRequest):
    try:
        llm = ChatOpenAI(model="gpt-4o-mini")
        response = llm.invoke(req.message)
        return {"response": response.content}
    except Exception as e:
        return {"error": str(e)}

