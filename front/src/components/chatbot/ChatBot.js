import React, { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { chatbotApi } from "../../api/chatBotApi"; // ✅ axios 인스턴스 불러오기
import MicInput from "../chatbot/MicInput"; // ✅ 새 컴포넌트 불러오기

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "안녕하세요! 무엇을 도와드릴까요?",
      quickReplies: [
        { label: "내 펀딩 내역", action: "showFundingButton" },
        { label: "추천 상품", action: "askRecommend" },
        { label: "가게 요청", action: "sendShopRequest" },
        { label: "내 위치 설정", action: "setLocation" },
        { label: "내 정보 수정", action: "editProfile" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // URL을 감지해서 링크로 변환하는 함수
  const convertUrlsToLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+|localhost:[0-9]+\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const messagesEndRef = useRef(null);

  // ✅ 새 메시지 올 때마다 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ✅ 메시지 전송
  const sendMessageToServer = async (message) => {
    setLoading(true);
    try {
      const res = await chatbotApi.post("/chat", { message });

      // 식당 아이템 정보가 있는지 확인
      const botMessage = {
        sender: "bot",
        text: res.data.response,
        restaurant_items: res.data.restaurant_items || null,
        buttons: res.data.buttons || null,
      };

      setMessages((prev) => [
        ...prev,
        { sender: "user", text: message },
        botMessage,
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ 서버와 연결할 수 없습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    sendMessageToServer(input);
    setInput("");
  };
  const handleVoiceResult = (text) => {
    setInput(text); // 입력창에 표시
    sendMessageToServer(text); // 바로 전송
  };
  // 🔹 퀵리플라이 버튼 처리
  const handleQuickReply = (reply) => {
    // 유저 메시지 표시
    setMessages((prev) => [...prev, { sender: "user", text: reply.label }]);

    // 액션 분기
    if (reply.action === "showFundingButton") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "여기서 내 펀딩 내역을 확인할 수 있어요!",
          customComponent: (
            <a
              href="/mypage" // ✅ 원하는 페이지 라우팅 경로
              className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
            >
              내 펀딩 내역 보기
            </a>
          ),
        },
      ]);
    } else if (reply.action === "askRecommend") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "주문내역을 기반으로한 AI 추천 페이지 입니다! ",
          customComponent: (
            <a
              href="/ai-recommend"
              className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
            >
              AI 추천페이지로 이동{" "}
            </a>
          ),
        },
      ]);
    } else if (reply.action === "sendShopRequest") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "가게 등록 요청은 자영업자로 등록된 회원만 가능합니다 ! ",
          customComponent: (
            <a
              href="/member/register"
              className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
            >
              회원가입
            </a>
          ),
        },
      ]);
    } else if (reply.action === "setLocation") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "내 위치를 설정하려면 아래 버튼을 클릭하세요!",
          customComponent: (
            <a
              href="/location"
              className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
            >
              위치 설정하러 가기
            </a>
          ),
        },
      ]);
    } else if (reply.action === "editProfile") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "회원정보를 수정하려면 아래 버튼을 클릭하세요!",
          customComponent: (
            <a
              href="/mypage/edit"
              className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
            >
              내 정보 수정하기{" "}
            </a>
          ),
        },
      ]);
    }
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 bg-blue-100 hover:bg-blue-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center z-50 ${
          !isOpen ? "animate-bounce" : ""
        }`}
      >
        {isOpen ? (
          <FiX className="w-8 h-8 text-white" />
        ) : (
          <img
            src="/chatboticon (2).png"
            alt="chatbot"
            className="w-full h-full object-contain "
          />
        )}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[500px] h-[600px] bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden z-50">
          {/* 헤더 */}
          <div className="bg-blue-500 text-white px-4 py-2 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/chatbot.png"
                alt="chatbot"
                className="w-10 h-10 object-contain"
              />
              <span className="text-lg">PickTogether 챗봇</span>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`my-2 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* 봇 아이콘 */}
                {msg.sender === "bot" && (
                  <img
                    src="/chatboticon.png"
                    alt="bot"
                    className="w-10 h-10 rounded-full mr-2 self-end"
                  />
                )}

                {/* 말풍선 */}
                <div className="flex flex-col max-w-[70%]">
                  <div
                    className={`px-3 py-2 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <div style={{ whiteSpace: "pre-line" }}>
                      {msg.sender === "bot"
                        ? convertUrlsToLinks(msg.text)
                        : msg.text}
                    </div>

                    {/* 커스텀 컴포넌트 (버튼 등) */}
                    {msg.customComponent && (
                      <div className="mt-2">{msg.customComponent}</div>
                    )}

                    {/* 식당 아이템들 (텍스트 + 버튼) */}
                    {msg.restaurant_items && (
                      <div className="mt-3 space-y-3">
                        {msg.restaurant_items.map((item, i) => (
                          <div
                            key={i}
                            className="border-l-4 border-blue-200 pl-3"
                          >
                            <div
                              style={{ whiteSpace: "pre-line" }}
                              className="text-sm mb-2"
                            >
                              {item.text}
                            </div>
                            <a
                              href={item.button.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                            >
                              {item.button.label}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 기존 버튼들 */}
                    {msg.buttons && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.buttons.map((button, i) => (
                          <a
                            key={i}
                            href={button.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            {button.label}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Quick Replies */}
                    {msg.quickReplies && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.quickReplies.map((reply, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickReply(reply)}
                            className="px-3 py-1 bg-white border border-blue-400 text-blue-500 text-sm rounded-full hover:bg-blue-50"
                          >
                            {reply.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* 시간 */}
                  <span className="text-[10px] text-gray-400 mt-1 self-end">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* 로딩 */}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <img
                  src="/chatboticon.png"
                  alt="bot"
                  className="w-6 h-6 rounded-full"
                />
                <span className="animate-pulse">입력중...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력창 */}
          <div className="flex border-t p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* 🎤 음성 입력 */}
            <MicInput onResult={handleVoiceResult} />

            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
