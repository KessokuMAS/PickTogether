// src/components/chat/MicInput.jsx
import React, { useEffect, useRef, useState } from "react";
import { FiMic } from "react-icons/fi";

const MicInput = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("이 브라우저는 Web Speech API를 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 인식 결과:", transcript);
      if (onResult) onResult(transcript); // 부모(ChatBot)로 전달
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, [onResult]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("이 브라우저는 음성인식을 지원하지 않습니다.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <button
      onClick={toggleMic}
      className={`ml-2 px-3 py-2 rounded-lg text-sm flex items-center justify-center ${
        isListening
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      <FiMic size={18} />
    </button>
  );
};

export default MicInput;
