import axios from "axios";
import { io } from "socket.io-client";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Create a socket connection
export const socket = io("http://localhost:5000");

// Fetch all rooms
export const getRooms = async () => {
  try {
    const response = await api.get("/rooms");
    return response.data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

// Create a new room
export const createRoom = async (roomName) => {
  try {
    const response = await api.post("/rooms", { name: roomName });
    return response.data;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

// Fetch messages (you already have this)
export const getMessages = async (roomId) => {
  const response = await api.get(`/messages/${roomId}`);
  return response.data;
};

// Register user
export const registerUser = async (username) => {
  try {
    const response = await api.post("/register", { username });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export default api;
