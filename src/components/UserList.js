import React, { useState } from "react";

export default function UserList({
  users,
  currentUserId,
  onSelectUser,
  selectedUser,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users
    .filter((u) => u._id !== currentUserId)
    .filter((u) => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="user-list">
      <h3>All Users</h3>

      <input
        type="text"
        placeholder="Search by username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      {filteredUsers.length === 0 && <p>No users found.</p>}

      <ul>
        {filteredUsers.map((user) => (
          <li
            key={user._id}
            className={selectedUser?._id === user._id ? "selected" : ""}
            onClick={() => onSelectUser(user)}
            style={{
              cursor: "pointer",
              padding: "8px",
              marginBottom: "5px",
              backgroundColor:
                selectedUser?._id === user._id ? "#e0f7fa" : "#f9f9f9",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <div>
              <strong>{user.username}</strong>{" "}
              <span
                style={{
                  color: user.online ? "green" : "gray",
                  fontSize: "0.85em",
                  marginLeft: "8px",
                }}
              >
                {user.online ? "● Online" : "○ Offline"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
