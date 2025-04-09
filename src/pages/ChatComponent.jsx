import { useEffect, useState } from "react";
import  sendMessage from "../services/sendMessageService";
import  markMessagesAsRead  from "../services/sendMessageService";

import { getMessages } from "../services/chatService"
import { auth } from "../firebase";

const ChatComponent = ({ chatId, receiverId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        if (!chatId) return;

        // Set up real-time messages listener
        const unsubscribe = getMessages(chatId, (newMessages) => {
            setMessages(newMessages);
        });

        // Clean up listener on unmount
        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        if (!chatId || !receiverId) return;

        // Mark messages as read when component mounts
        markMessagesAsRead(chatId, receiverId).catch(console.error);
    }, [chatId, receiverId]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        try {
            await sendMessage(chatId, auth.currentUser.uid, receiverId, newMessage);
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            // Handle error (show notification, etc.)
        }
    };

    return (
        <div>
            <h1>Chat Component</h1>
            <div>
                {messages.map((msg) => (
                    <p key={msg.id} style={{ textAlign: msg.senderId === auth.currentUser.uid ? "right" : "left" }}>
                        {msg.text}
                    </p>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default ChatComponent;