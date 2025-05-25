import React from "react";

export default function UserList({
  users,
  currentUserId,
  onSelectUser,
  selectedUser,
}) {
  return (
    <div className="user-list">
      <h3>Users</h3>
      {users.length === 0 && <p>No users online</p>}
      <ul>
        {users
          .filter((u) => u._id !== currentUserId)
          .map((user) => (
            <li
              key={user._id}
              className={selectedUser?._id === user._id ? "selected" : ""}
              onClick={() => onSelectUser(user)}
            >
              {user.email}
            </li>
          ))}
      </ul>
    </div>
  );
}
