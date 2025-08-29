# 🍽️ PickTogether - 위치기반 & AI 추천 먹거리 공동구매 웹 서비스

**PickTogether**는 자신의 주변위치에 있는 음식점들을 공동구매를 통해 저렴한 가격으로 구매할 수 펀딩 플랫폼입니다.
위치 기반 맛집 추천, 특산품 펀딩, 커뮤니티 기능을 통해 지역의 맛과 문화를 함께 즐길 수 있습니다.

---

## 🏗️ 프로젝트 구조
 
```
PickTogether/
├── front/        # React 프론트엔드
├── backend/      # Spring Boot 백엔드
├── python/       # python 백엔드
└── README.md     # 프로젝트 설명서
```

---

## 📄 관련 자료

* [📹 시연 영상 (추가 필요)]()
* [📑 프로젝트 PDF (추가 필요)]()

---

## 📅 개발 기간

* **2025년 7월 30일 \~ 2025년 8월 29일**

---

## 👥 팀원


<table align="left">
  <tr>
    <td align="center" style="padding: 20px;">
      <img src="https://avatars.githubusercontent.com/chanO4135" width="100px;" alt="chanO4135" /><br>
      <sub><b>chanO4135 (김찬영)</b></sub><br>
      팀장
    </td>
    <td align="center" style="padding: 20px;">
      <img src="https://avatars.githubusercontent.com/inhan99" width="100px;" alt="inhan99" /><br>
      <sub><b>inhan99 (고인한)</b></sub><br>
      팀원
    </td>
    <td align="center" style="padding: 20px;">
      <img src="https://avatars.githubusercontent.com/KessokuMAS" width="100px;" alt="KessokuMAS" /><br>
      <sub><b>KessokuMAS (고윤호)</b></sub><br>
      팀원
    </td>
   <td align="center" style="padding: 20px;">
      <img src="https://avatars.githubusercontent.com/minseo52" width="100px;" alt="bannana-key" /><br>
      <sub><b>bannana-key (서민서)</b></sub><br>
      팀원
    </td>
    <td align="center" style="padding: 20px;">
      <img src="https://avatars.githubusercontent.com/bannana-key" width="100px;" alt="bannana-key" /><br>
      <sub><b>bannana-key (송승찬)</b></sub><br>
      팀원
    </td>
  </tr>
</table>
<br clear="all"/> <!-- ✅ 줄바꿈 강제 -->

---

### 🎨 Frontend

* 메인 & 홈 화면 (지역 특산품, 내 지역 인기펀딩,  한그릇(1인 메뉴), AI 추천,  커뮤니티)
* 음식점 상세페이지(음식점 메뉴, 펀딩 참여)
* 커뮤니티 & 나눔게시판
* 마이페이지 (펀딩 내역(QR코드 발급), 알림, 펀딩 달력)
* 관리자 페이지 (가게 요청 승인/거부, 커뮤니티 관리)
* 공통 컴포넌트 (레이아웃, 주소 검색, 메인 메뉴, 찜)

### ⚙️ Backend

* 회원 관리 (회원가입, 로그인, 회원정보 수정, 회원 탈퇴, 소셜 로그인, JWT 인증)
* 특산품 관리 (조회, 주문, 펀딩 시스템)
* 커뮤니티 관리 (게시글, 댓글, 나눔게시판)
* 펀딩 관리 (펀딩 참여, QR 코드 발급/만료, 캘린더 연동)
* 알림 & 비즈니스 요청 (사업자 등록, 승인/거부 알림)
* 보안 & 설정 (Spring Security, Config, Exception Handling, JWT)

### 🛠 공통 & 인프라

* API 모듈 & HTTP 통신 (Axios, JWT 인증)
* 소셜 로그인 연동 (카카오, 구글, 네이버)
* 내 위치 설정(카카오 map)
* 파일 업로드 & 이미지 관리
* 라우팅 & 상태 관리 (React Router, Context) 

### 💻 UI/UX

* 반응형 디자인 & 모바일 최적화
* UI 컴포넌트 & 스타일링 (Tailwind CSS)

### ✅ 테스트 & 품질

* 코드 리뷰 & 품질 관리
* 버그 수정 & 성능 최적화

---

## 📁 주요 기능

### 🍜 맛집 & 특산품

* 로컬 맛집 검색 및 추천 (GPS 기반 주변 맛집 추천)
* 지역 특산품 정보 제공 및 구매
* 인기 맛집 순위 & 1인 메뉴 추천
* 맛집 상세 정보 (QR 코드 주문 포함)
* 이미지 기반 & 위치 기반 검색
* 특산품 펀딩 및 배송 시스템

### 💳 결제 & 주문

* QR 코드 기반 주문 처리
* 카카오페이, 토스페이, 일반 결제 지원
* 펀딩 마감일 & QR 사용기한 관리

### 💬 커뮤니티

* 맛집 리뷰 및 후기
* 게시판 & 댓글 기능

### 🤖 AI 기능

* AI 기반 맛집 추천
* 리뷰 분석 및 인사이트 제공
* 이미지 인식 기반 맛집 검색

### 🏢 비즈니스 서비스

* 가게 등록 & 메뉴 관리
* 자영업자 요청 및 관리자 승인 시스템
* 가게 위치 관리 (Kakao Map 연동)

### 🙍 회원 관리

* 회원가입 / 로그인 (일반 + 소셜 로그인)
* 마이페이지 (회원 정보 수정&탈퇴, 펀딩 내역, 주문, 알림 관리)
* QR 코드 발급 및 사용 관리
* 알림 시스템 (사업자 요청 승인/거부 등)

---

## 🧭IA

> 실 서비스 구조를 나타내는 **컴포넌트/시퀀스/배포** 다이어그램 이미지를 업로드해 링크를 넣어주세요.

<img width="1182" height="804" alt="Image" src="https://github.com/user-attachments/assets/cc54294e-68aa-4c57-aeee-59598d2a18bf" />```


## 🗂️ 데이터 모델 (ERD)

> 주요 엔티티와 관계를 표시한 **ERD** 이미지를 업로드해 링크를 넣어주세요.

```md
![ERD - 데이터 모델](https://your-erd-image-link.png)
```

---

## 🛠️ 기술 스택

### 🎨 Frontend

* React 19
* Tailwind CSS
* React Router
* Axios
* React Icons, QR Code, Context API

### ⚙️ Backend

* Spring Boot 3.3.13
* Spring Data JPA
* Spring Security
* MariaDB
* JWT
* Gradle, Lombok

### ☁️ 인프라 & API

* AWS (서버 호스팅 및 스토리지)
* Kakao Maps API
* Google Cloud Vision API
* OpenAI API
* Portone API

---

## 🚀 실행 방법

### 📋 사전 준비 (MariaDB)

```sql
CREATE DATABASE picktogetherdb;
CREATE USER 'picktogetherdbuser'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON picktogetherdb.* TO 'picktogetherdbuser'@'localhost';
USE picktogetherdb;
```

### 🔧 서버 실행

#### 백엔드 (Spring Boot)

* VSCode에서 실행:
  `backend/src/main/java/com/backend/PickTogetherApplication.java` 실행
* 터미널:

  ```bash
  ./gradlew bootRun
  ```

#### 프론트엔드 (React)

```bash
cd front
npm install
npm start
```

---

## 🌐 접속 주소

* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:8080](http://localhost:8080)

---

## 🔐 환경 변수

```bash
# Database
DB_URL=jdbc:mariadb://localhost:3306/picktogetherdb
DB_USERNAME=picktogetherdbuser
DB_PASSWORD=1234

# JWT
JWT_SECRET=your_jwt_secret_key

# Portone
PORTONE_API_KEY=your_portone_api_key
PORTONE_API_SECRET=your_portone_api_secret

# Google Cloud Vision
GOOGLE_PROJECT_ID=your_google_project_id
GOOGLE_CREDENTIALS_PATH=path/to/google-vision-key.json

# Kakao
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_MAP_KEY=your_kakao_map_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

---

## 🧰 VS Code 원클릭 실행 세팅 (F5/Tasks)

> 아래 설정을 추가하면 **VS Code에서 바로 실행(한 번에 백엔드+프론트 기동)** 할 수 있습니다.

### 1) `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "backend:bootRun",
      "type": "shell",
      "command": "./gradlew bootRun",
      "options": { "cwd": "${workspaceFolder}/backend" },
      "problemMatcher": []
    },
    {
      "label": "frontend:start",
      "type": "shell",
      "command": "npm start",
      "options": { "cwd": "${workspaceFolder}/front" },
      "problemMatcher": []
    },
    {
      "label": "dev:all",
      "dependsOn": ["backend:bootRun", "frontend:start"],
      "dependsOrder": "parallel"
    }
  ]
}
```

### 2) `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "compounds": [
    {
      "name": "Run Frontend + Backend",
      "configurations": ["Frontend (npm start)", "Backend (Gradle bootRun)"]
    }
  ],
  "configurations": [
    {
      "type": "pwa-node",
      "request": "launch",
      "name": "Frontend (npm start)",
      "cwd": "${workspaceFolder}/front",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"],
      "console": "integratedTerminal"
    },
    {
      "type": "java",
      "name": "Backend (Gradle bootRun)",
      "request": "launch",
      "cwd": "${workspaceFolder}/backend",
      "mainClass": "com.backend.PickTogetherApplication",
      "projectName": "backend"
    }
  ]
}
```

### 3) 추천 확장 프로그램

* **Extension Pack for Java** (ms-vscode.vscode-java-pack)
* **Gradle for Java** (vscjava.vscode-gradle)
* **Debugger for Java** (vscjava.vscode-java-debug)
* **ESLint** (dbaeumer.vscode-eslint)
* **Prettier** (esbenp.prettier-vscode)
* **Markdown All in One** (yzhang.markdown-all-in-one)

> 위 설정을 추가하면 VSCode에서 **`Terminal > Run Task > dev:all`** 또는 **`F5`(컴파운드 선택)** 로 프론트/백엔드를 한 번에 실행할 수 있습니다.

---

## 📡 주요 API 엔드포인트 (예시)

* `GET /api/restaurants/nearby` - 주변 맛집 조회
* `GET /api/restaurants/{id}` - 맛집 상세 정보
* `POST /api/business-requests` - 가게 등록 요청
* `PUT /api/business-requests/admin/review` - 요청 승인/거부
* `GET /api/notifications` - 알림 조회
* `POST /api/funding` - 펀딩 참여

---

## 📝 라이선스

이 프로젝트는 **비공개 프로젝트**입니다.

---

### ✅ VSCode에서 바로 쓰는 방법

1. 프로젝트 루트에 `README.md`로 저장합니다.
2. (선택) `.vscode` 폴더를 만들고 위 `tasks.json`, `launch.json`을 각각 저장합니다.
3. **Markdown 미리보기**: `Ctrl+Shift+V`
4. **원클릭 실행**: `Terminal > Run Task > dev:all` 또는 `F5`(Run Frontend + Backend 선택)

---

> **UML/ERD 이미지** 링크만 채워주시면, 깃허브에서도 바로 렌더링되고 VSCode에서도 미리보기로 확인할 수 있어요! 필요하시면 예시 다이어그램 템플릿도 만들어 드릴게요.
