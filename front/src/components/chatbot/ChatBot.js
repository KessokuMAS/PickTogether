import React, { useState } from "react";
import axios from "axios";
import { FiMessageCircle, FiX } from "react-icons/fi"; // 아이콘 사용

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg"
      >
        {isOpen ? <FiX size={28} /> : <FiMessageCircle size={28} />}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="bg-blue-500 text-white px-4 py-2 font-bold">
            🤖 PickTogether 챗봇
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 p-3 h-96 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`my-2 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[70%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
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
