import React from "react";

interface User {
  id: number;
  name: string;
  running: boolean;
}

const UsersList: React.FC<{ users: User[] }> = ({ users }) => {
  return (
    <div className="users-list">
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <strong>{user.name}</strong> (ID: {user.id}) -{" "}
            {user.running ? "Running" : "Not Running"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
