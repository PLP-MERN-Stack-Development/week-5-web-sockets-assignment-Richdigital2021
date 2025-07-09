import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/backend";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const user = await registerUser(username);
      setUser(user);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md w-96">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          className="w-full p-2 border rounded mb-4"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Join Chat
        </button>
      </div>
    </div>
  );
}
