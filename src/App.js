import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

const backendURL = "https://chat-backend-1-hx1g.onrender.com";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  // Load token from localStorage on start
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // Setup socket connection when logged in
  useEffect(() => {
    if (!token) return;

    socketRef.current = io(backendURL, {
      auth: { token },
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      if (err.message === "invalid token") {
        alert("Authentication failed, please login again.");
        logout();
      }
    });

    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Load previous messages from backend
    axios
      .get(`${backendURL}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));

    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  // Register new user
  const handleRegister = async () => {
    try {
      await axios.post(`${backendURL}/register`, { username, password });
      alert("Registration successful! Please login.");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  // Login user
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${backendURL}/login`, {
        username,
        password,
      });
      const token = res.data.token;
      setToken(token);
      localStorage.setItem("token", token);
      setIsLoggedIn(true);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  // Logout user
  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMessages([]);
    setUsername("");
    setPassword("");
  };

  // Send chat message
  const sendMessage = () => {
    if (!message.trim()) return;
    const msgObj = { content: message };
    socketRef.current.emit("chatMessage", msgObj);
    setMessage("");
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
        <h2>Register / Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <button
          onClick={handleRegister}
          style={{ marginRight: 10, padding: "8px 16px" }}
        >
          Register
        </button>
        <button onClick={handleLogin} style={{ padding: "8px 16px" }}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "20px auto",
        padding: 20,
        border: "1px solid #ccc",
      }}
    >
      <h2>Chat Room</h2>
      <button onClick={logout} style={{ marginBottom: 10 }}>
        Logout
      </button>
      <div
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: 10,
          marginBottom: 10,
          backgroundColor: "#fafafa",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <b>{msg.sender}:</b> {msg.content}
            <div style={{ fontSize: 10, color: "#999" }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "80%", padding: 8 }}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button
        onClick={sendMessage}
        style={{ padding: "8px 16px", marginLeft: 10 }}
      >
        Send
      </button>
    </div>
  );
}

export default App;
