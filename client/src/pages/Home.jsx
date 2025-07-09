import { useEffect, useState } from "react";
import { getRooms, createRoom, getMessages, socket } from "../services/backend";
import ChatRoom from "../components/ChatRoom";

export default function Home({ user }) {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newRoom, setNewRoom] = useState("");

  const handleCreateRoom = async () => {
    if (!newRoom.trim()) return;
    try {
      const created = await createRoom(newRoom);
      setRooms((prev) => [...prev, created]);
      setNewRoom("");
    } catch (error) {
      console.error("Error creating room:", error.message);
    }
  };

  useEffect(() => {
    fetchRooms();
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (user?.username) {
      socket.emit("user_join", user.username);
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      const roomsData = await getRooms(); // ✅ Correct: already returns data
      setRooms(roomsData);
    } catch (error) {
      console.error("❌ Error fetching rooms:", error.message);
    }
  };

  const handleJoinRoom = async (room) => {
    socket.emit("joinRoom", { username: user.username, roomId: room._id });
    setCurrentRoom(room);
    try {
      const messagesData = await getMessages(room._id); // ✅ Correct
      setMessages(messagesData);
    } catch (error) {
      console.error("❌ Error fetching messages:", error.message);
    }
  };

  return (
    <div className="flex h-screen">
      <aside className="w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-lg mb-2">Rooms</h2>

        {/* Room creation input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="New room name"
            className="w-full p-2 rounded text-black mb-2"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
          />
          <button
            className="w-full bg-green-600 p-2 rounded hover:bg-green-500"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
        </div>

        {/* Room list */}
        <ul>
          {rooms.map((room) => (
            <li key={room._id} className="mb-2">
              <button
                onClick={() => handleJoinRoom(room)}
                className="w-full bg-gray-700 p-2 rounded hover:bg-gray-600"
              >
                {room.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-4">
        {currentRoom ? (
          <ChatRoom
            room={currentRoom}
            messages={messages}
            user={user}
            socket={socket}
          />
        ) : (
          <p>Select a room to join</p>
        )}
      </main>
    </div>
  );
}
