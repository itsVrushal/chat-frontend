import React, { useEffect, useRef } from "react";

export default function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`message ${
            msg.sender === currentUserId ? "sent" : "received"
          }`}
        >
          <p>{msg.text}</p>
          <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
