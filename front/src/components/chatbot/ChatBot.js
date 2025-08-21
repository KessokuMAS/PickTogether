import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi"; // 아이콘 사용

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "안녕하세요! 무엇을 도와드릴까요?",
      quickReplies: [
        "내 펀딩 내역",
        "추천 상품",
        "가게 요청",
        "내 위치 설정",
        "내 정보 수정",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 퀵리플라이 버튼 클릭 처리
  const handleQuickReply = (reply) => {
    const newMessage = { sender: "user", text: reply };
    setMessages((prev) => [...prev, newMessage]);
    sendMessageFromQuickReply(reply);
  };

  const sendMessageFromQuickReply = async (message) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/chat", { message });
      const botMessage = { sender: "bot", text: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ 서버와 연결할 수 없습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 일반 입력 전송 처리
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        message: input,
      });
      const botMessage = { sender: "bot", text: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ 서버와 연결할 수 없습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg overflow-hidden w-16 h-16 flex items-center justify-center animate-bounce"
      >
        {isOpen ? (
          <FiX className="w-8 h-8 text-white" />
        ) : (
          <img
            src="/chatboticon.png"
            alt="chatbot"
            className="w-full h-full object-contain"
          />
        )}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[500px] h-[500px] bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="bg-blue-500 text-white px-4 py-2 font-bold flex items-center gap-2">
            <img
              src="/chatbot.png"
              alt="chatbot"
              className="w-10 h-10 object-contain"
            />
            <span className="text-lg">PickTogether 챗봇</span>
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
                {/* 봇일 때 아이콘 */}
                {msg.sender === "bot" && (
                  <img
                    src="/chatboticon.png"
                    alt="bot"
                    className="w-10 h-10 rounded-full mr-2 self-end"
                  />
                )}

                {/* 말풍선 */}
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[70%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {msg.text}

                  {/* 🔹 Quick Replies 버튼 */}
                  {msg.quickReplies && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickReply(reply)}
                          className="px-3 py-1 bg-white border border-blue-400 text-blue-500 text-sm rounded-full hover:bg-blue-50"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 로딩 중 표시 */}
            {loading && (
              <div className="text-center text-gray-500 text-sm">
                ...답변 작성중
              </div>
            )}
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
