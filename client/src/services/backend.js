import axios from "axios";
import { io } from "socket.io-client";

// Axios base API setup
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Socket connection
export const socket = io("http://localhost:5000");

// ====================
// 🧠 ROOM APIs
// ====================

// Get all rooms
export const getRooms = async () => {
  try {
    const response = await api.get("/rooms");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching rooms:", error.message);
    throw error;
  }
};

// Create a new room
export const createRoom = async (roomName) => {
  try {
    const response = await api.post("/rooms", { name: roomName });
    return response.data;
  } catch (error) {
    console.error("❌ Error creating room:", error.message);
    throw error;
  }
};

// ====================
// 💬 MESSAGE APIs
// ====================

// Get messages for a room
export const getMessages = async (roomId) => {
  try {
    const response = await api.get(`/messages/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching messages:", error.message);
    throw error;
  }
};

// ====================
// 👤 AUTH APIs
// ====================

// Register a new user
export const registerUser = async (username) => {
  try {
    const response = await api.post("/register", { username });
    return response.data;
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    throw error;
  }
};

// Login user
export const loginUser = async (username) => {
  try {
    const response = await api.post("/login", { username });
    return response.data;
  } catch (error) {
    console.error("❌ Error logging in user:", error.message);
    throw error;
  }
};

export default api;
