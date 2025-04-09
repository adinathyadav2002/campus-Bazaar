import { db } from "../firebase";
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    updateDoc, 
    doc, 
    query, 
    where, 
    getDocs,
    writeBatch 
} from "firebase/firestore";

// Send message function
const sendMessage = async (chatId, senderId, text) => {
    if (!chatId || !senderId || !text) {
        throw new Error("ChatId, senderId, and text are required");
    }

    try {
        // Reference to messages collection
        const messagesRef = collection(db, `chats/${chatId}/messages`);
        
        // Create message document
        const messageData = {
            senderId,
            text,
            timestamp: serverTimestamp(),
            status: 'sent',
            read: false
        };

        // Add message to collection
        const messageDoc = await addDoc(messagesRef, messageData);

        // Update chat metadata
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            lastMessage: text,
            lastMessageTimestamp: serverTimestamp(),
            lastMessageSenderId: senderId
        });

        return messageDoc.id;

    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

// Mark messages as read function
const markMessagesAsRead = async (chatId, userId) => {
    if (!chatId || !userId) {
        throw new Error("ChatId and userId are required");
    }

    try {
        // Get reference to messages collection
        const messagesRef = collection(db, `chats/${chatId}/messages`);
        
        // Create query for unread messages not sent by current user
        const q = query(
            messagesRef,
            where('senderId', '!=', userId),
            where('read', '==', false)
        );

        // Get all unread messages
        const snapshot = await getDocs(q);

        // If no unread messages, return early
        if (snapshot.empty) {
            return;
        }

        // Use batch write to update all messages at once
        const batch = writeBatch(db);
        
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { 
                read: true,
                readAt: serverTimestamp()
            });
        });

        // Commit the batch
        await batch.commit();

        // Update chat metadata
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            lastReadAt: serverTimestamp(),
            lastReadBy: userId
        });

    } catch (error) {
        console.error("Error marking messages as read:", error);
        throw error;
    }
};

// Export both functions as named exports
export default { sendMessage, markMessagesAsRead };