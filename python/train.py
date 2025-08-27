import pymysql
import pandas as pd
import torch
from torch import nn, optim
from sklearn.preprocessing import LabelEncoder
import joblib

def train_model():
    # ✅ DB 연결
    conn = pymysql.connect(
        host="localhost",
        user="pickdbuser",
        password="1234",
        db="pickdb",
        charset="utf8mb4"
    )

    # ✅ DB에서 주문 기록 불러오기
    sql = """
    SELECT member_email, restaurant_id, 1 as label
    FROM funding
    """
    df = pd.read_sql(sql, conn)
    conn.close()

    # ✅ 사용자/아이템 ID를 숫자로 인코딩
    user_enc = LabelEncoder()
    item_enc = LabelEncoder()
    df["user_id"] = user_enc.fit_transform(df["member_email"])
    df["item_id"] = item_enc.fit_transform(df["restaurant_id"])

    num_users = df["user_id"].nunique()
    num_items = df["item_id"].nunique()

    # ✅ Torch Dataset
    users = torch.tensor(df["user_id"].values, dtype=torch.long)
    items = torch.tensor(df["item_id"].values, dtype=torch.long)
    labels = torch.tensor(df["label"].values, dtype=torch.float32)

    class SimpleRec(nn.Module):
        def __init__(self, num_users, num_items, emb_dim=32):
            super().__init__()
            self.user_embed = nn.Embedding(num_users, emb_dim)
            self.item_embed = nn.Embedding(num_items, emb_dim)
            self.fc = nn.Linear(emb_dim*2, 1)

        def forward(self, u, i):
            u_emb = self.user_embed(u)
            i_emb = self.item_embed(i)
            x = torch.cat([u_emb, i_emb], dim=1)
            return torch.sigmoid(self.fc(x))

    model = SimpleRec(num_users, num_items)
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    criterion = nn.BCELoss()

    # ✅ 학습
    for epoch in range(10):
        optimizer.zero_grad()
        preds = model(users, items).squeeze()
        loss = criterion(preds, labels)
        loss.backward()
        optimizer.step()
        print(f"Epoch {epoch+1}, Loss {loss.item():.4f}")

    # ✅ 모델 저장
    torch.save(model.state_dict(), "saved_models/recommender_v2.pth")
    joblib.dump(user_enc, "saved_models/user_enc.pkl")
    joblib.dump(item_enc, "saved_models/item_enc.pkl")

if __name__ == "__main__":
    train_model()
