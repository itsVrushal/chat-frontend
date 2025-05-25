import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import api from "../utils/api";
import io from "socket.io-client";
import UserList from "./UserList";
import MessageList from "./MessageList";

const SOCKET_URL = "https://your-backend-url.com"; // Replace with your backend URL

export default function Chat() {
  const { user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = useRef(null);

  useEffect(() => {
    if (!user) return;

    socket.current = io(SOCKET_URL, {
      auth: { token: user.token },
    });

    socket.current.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.current.on("users", (usersList) => {
      setUsers(usersList);
    });

    socket.current.on("private message", (message) => {
      if (
        selectedUser &&
        (message.sender === selectedUser._id || message.sender === user._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user, selectedUser]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    // Load chat history with selected user
    async function fetchMessages() {
      try {
        const res = await api.get(`/messages/${selectedUser._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    }

    fetchMessages();
  }, [selectedUser]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      to: selectedUser._id,
      text: newMessage.trim(),
    };

    socket.current.emit("private message", messageData);

    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now(),
        text: newMessage.trim(),
        sender: user._id,
        receiver: selectedUser._id,
        createdAt: new Date(),
      },
    ]);
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h2>Welcome, {user.email}</h2>
        <button onClick={logout}>Logout</button>
        <UserList
          users={users}
          currentUserId={user._id}
          onSelectUser={setSelectedUser}
          selectedUser={selectedUser}
        />
      </div>

      <div className="chat-window">
        {selectedUser ? (
          <>
            <h3>Chat with {selectedUser.email}</h3>
            <MessageList messages={messages} currentUserId={user._id} />

            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
