import React from "react";
import Logo from "./Logo";
import "./styles/typing-animation.css";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start mb-4">
      <div className="flex-shrink-0 mr-4">
        <Logo size="sm" />
      </div>
      <div className="bg-zinc-900 rounded-lg p-4 relative shadow-md chat-bubble bot-bubble border border-zinc-800">
        <div className="typing-animation flex space-x-2">
          <span className="w-3 h-3 bg-white rounded-full" style={{ "--dot-index": 0 } as React.CSSProperties}></span>
          <span className="w-3 h-3 bg-white rounded-full" style={{ "--dot-index": 1 } as React.CSSProperties}></span>
          <span className="w-3 h-3 bg-white rounded-full" style={{ "--dot-index": 2 } as React.CSSProperties}></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
