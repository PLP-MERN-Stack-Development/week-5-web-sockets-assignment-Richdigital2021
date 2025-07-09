import { useEffect, useRef, useState } from "react";

export default function ChatRoom({ room, messages, user, socket }) {
  const [chat, setChat] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [allMessages, setAllMessages] = useState(messages); // store updated messages
  const msgRef = useRef(null);

  // Typing indicators and message updates
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setAllMessages((prev) => [...prev, msg]);
    });

    socket.on("notify_message", (data) => {
      if (data.sender !== user.username) {
        alert(`📩 New message from ${data.sender}: ${data.content}`);
      }
    });

    socket.on("typing_users", (usersTyping) => {
      const othersTyping = usersTyping.filter((name) => name !== user.username);
      setTypingUser(othersTyping[0] || "");
    });

    return () => {
      socket.off("receive_message");
      socket.off("notify_message");
      socket.off("typing_users");
    };
  }, [socket, user.username]);

  // Typing notification
  const handleTyping = () => {
    socket.emit("typing", true);
    setTimeout(() => socket.emit("typing", false), 1000);
  };

  // Send message
  const handleSend = () => {
    if (!chat.trim()) return;
    socket.emit("send_message", {
      content: chat,
      roomId: room._id,
      sender: user.username,
    });
    setChat("");
  };

  return (
    <div>
      <h2 className="text-2xl mb-2">{room.name}</h2>

      <div
        className="h-64 overflow-y-auto border mb-2 bg-gray-50 p-2"
        ref={msgRef}
      >
        {allMessages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.sender}:</strong> {msg.content}
          </p>
        ))}
      </div>

      <div className="mb-2 text-sm text-gray-600">
        {typingUser && <em>{typingUser} is typing...</em>}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-500 text-white px-4 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
