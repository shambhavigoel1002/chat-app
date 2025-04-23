// app/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./styles/Home.module.css"; // Make sure to update the CSS import path

// Define message type
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState(
    `User_${Math.floor(Math.random() * 1000)}`
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to fetch messages from API
  const fetchMessages = async () => {
    try {
      const response = await axios.get("/api/messages");
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Function to send a new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim()) {
      setIsLoading(true);
      try {
        const response = await axios.post("/api/messages", {
          text: newMessage,
          sender: username,
        });

        if (Array.isArray(response.data)) {
          setMessages((prevMessages) => [...prevMessages, ...response.data]);
        } else {
          setMessages((prevMessages) => [...prevMessages, response.data]);
          fetchMessages();
        }

        // Clear input
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Langchain-powered Chat</h1>

        <div className={styles.chatBox}>
          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                Ask a question to start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${
                    msg.sender === "AI"
                      ? styles.aiMessage
                      : msg.sender === username
                      ? styles.outgoing
                      : styles.incoming
                  }`}
                >
                  <span className={styles.sender}>{msg.sender}</span>
                  <p>{msg.text}</p>
                  <span className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
            {isLoading && (
              <div className={styles.loadingIndicator}>
                <p>AI is thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className={styles.messageForm}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask a question..."
              className={styles.messageInput}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
