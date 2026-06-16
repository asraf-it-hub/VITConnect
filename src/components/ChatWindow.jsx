import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Image,
  Check,
  CheckCheck,
  ArrowLeft,
  MessageSquare,
  ShoppingBag,
  ExternalLink,
  PhoneCall,
  User,
  Paperclip
} from "lucide-react";

export default function ChatWindow({ initialActiveChatId }) {
  const { conversations, currentUser, sendMessage, markChatAsRead, users } = useContext(AppContext);
  const [activeChatId, setActiveChatId] = useState(initialActiveChatId || null);
  const [typedMessage, setTypedMessage] = useState("");
  const [imageUpload, setImageUpload] = useState(null);
  const messagesEndRef = useRef(null);

  // Sync prop changes
  useEffect(() => {
    if (initialActiveChatId) {
      setActiveChatId(initialActiveChatId);
    }
  }, [initialActiveChatId]);

  // Mark active chat as read
  useEffect(() => {
    if (activeChatId) {
      markChatAsRead(activeChatId);
    }
  }, [activeChatId, conversations]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeChatId]);

  const activeChat = conversations.find(chat => chat.recipientId === activeChatId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() && !imageUpload) return;
    if (!currentUser) return;

    let textToSend = typedMessage.trim();
    if (imageUpload) {
      textToSend += ` 🖼️ [Image Sent: ${imageUpload.name}]`;
    }

    sendMessage(activeChatId, textToSend, activeChat?.productContext);
    setTypedMessage("");
    setImageUpload(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUpload({
        name: file.name,
        url: URL.createObjectURL(file)
      });
    }
  };

  const getRecipientPhoto = (recipientId) => {
    const user = users.find(u => u.id === recipientId);
    return user?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
  };

  return (
    <div className="glass-panel" style={{
      display: "flex",
      height: "calc(100vh - 120px)",
      minHeight: "450px",
      overflow: "hidden",
      padding: 0
    }}>
      {/* 1. Chats List Sidebar */}
      <div style={{
        width: activeChatId ? "35%" : "100%",
        display: !activeChatId ? "flex" : "none",
        flexDirection: "column",
        borderRight: "1px solid var(--border-color)",
        background: "var(--glass-bg)",
        height: "100%"
      }} className="chat-list-responsive-container">
        <style>{`
          @media (min-width: 769px) {
            .chat-list-responsive-container {
              width: 320px !important;
              display: flex !important;
            }
            .chat-view-responsive-container {
              display: flex !important;
            }
          }
        `}</style>
        
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Conversations</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Discuss transaction details & pick-ups
          </p>
        </div>

        <div style={{ flexGrow: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              No active chats. Inquire about listings or requests to start chatting!
            </div>
          ) : (
            conversations.map((chat) => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              const isUnread = chat.unreadCount > 0;
              const isSelected = activeChatId === chat.recipientId;

              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.recipientId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 20px",
                    cursor: "pointer",
                    background: isSelected ? "var(--accent-light)" : "transparent",
                    borderBottom: "1px solid var(--border-color)",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <img
                    src={getRecipientPhoto(chat.recipientId)}
                    alt={chat.recipientName}
                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div style={{ flexGrow: 1, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: isUnread ? "700" : "600", color: "var(--text-primary)" }}>
                        {chat.recipientName}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {lastMsg ? lastMsg.time.split(", ")[1] || lastMsg.time : ""}
                      </span>
                    </div>
                    <p style={{
                      fontSize: "0.8rem",
                      color: isUnread ? "var(--text-primary)" : "var(--text-secondary)",
                      fontWeight: isUnread ? "600" : "400",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {lastMsg ? lastMsg.text : "No messages yet"}
                    </p>
                  </div>
                  {isUnread && (
                    <span style={{
                      background: "var(--accent)",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%"
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Main Chat Workspace */}
      <div style={{
        flexGrow: 1,
        display: activeChatId ? "flex" : "none",
        flexDirection: "column",
        background: "rgba(0,0,0,0.01)",
        height: "100%"
      }} className="chat-view-responsive-container">
        
        {activeChat ? (
          <>
            {/* Header: Seller profile context & back button */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-color)",
              background: "var(--glass-bg)",
              backdropFilter: "blur(8px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={() => setActiveChatId(null)}
                  className="btn btn-ghost"
                  style={{
                    padding: "6px",
                    border: "none",
                    borderRadius: "50%",
                    display: "flex"
                  }}
                  className="chat-back-button-responsive"
                >
                  <ArrowLeft size={20} />
                </button>
                <style>{`
                  @media (min-width: 769px) {
                    .chat-back-button-responsive {
                      display: none !important;
                    }
                  }
                `}</style>

                <img
                  src={getRecipientPhoto(activeChat.recipientId)}
                  alt={activeChat.recipientName}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>{activeChat.recipientName}</h4>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                    {activeChat.recipientDept} • {activeChat.recipientYear}
                  </p>
                </div>
              </div>

              {/* Quick WhatsApp Link redirection */}
              <button
                onClick={() => window.open(`https://wa.me/919876543210`, "_blank")}
                className="btn btn-ghost"
                style={{ padding: "6px 12px", border: "none", display: "flex", gap: "6px", fontSize: "0.8rem" }}
              >
                <PhoneCall size={14} style={{ color: "var(--accent)" }} />
                <span>Call WhatsApp</span>
              </button>
            </div>

            {/* Product Context Header (Sticks below primary chat header) */}
            {activeChat.productContext && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 20px",
                background: "var(--accent-light)",
                borderBottom: "1px solid var(--border-color)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {activeChat.productContext.image && (
                    <img
                      src={activeChat.productContext.image}
                      alt={activeChat.productContext.name}
                      style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }}
                    />
                  )}
                  <div>
                    <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)" }}>
                      {activeChat.productContext.name}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: "700", marginLeft: "8px" }}>
                      ₹{activeChat.productContext.price}
                    </span>
                  </div>
                </div>
                
                <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "500", display: "flex", alignItems: "center", gap: "2px" }}>
                  <ShoppingBag size={12} />
                  Context Item
                </span>
              </div>
            )}

            {/* Scrollable messages history container */}
            <div style={{
              flexGrow: 1,
              padding: "20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              {activeChat.messages.map((msg, index) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={index}
                    style={{
                      alignSelf: isMine ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <div style={{
                      background: isMine ? "var(--accent)" : "var(--glass-bg)",
                      color: isMine ? "#ffffff" : "var(--text-primary)",
                      padding: "10px 16px",
                      borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      boxShadow: "var(--shadow-sm)",
                      border: isMine ? "none" : "1px solid var(--glass-border)",
                      fontSize: "0.95rem",
                      lineHeight: "1.45",
                      wordBreak: "break-word"
                    }}>
                      {msg.text}
                    </div>
                    
                    {/* Timestamp & read receipt ticks */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.65rem",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                      justifyContent: isMine ? "flex-end" : "flex-start"
                    }}>
                      <span>{msg.time.split(", ")[1] || msg.time}</span>
                      {isMine && (
                        msg.read ? <CheckCheck size={12} style={{ color: "var(--accent)" }} /> : <Check size={12} />
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Simulated attachment image bar */}
            {imageUpload && (
              <div style={{
                padding: "8px 20px",
                background: "rgba(0,0,0,0.02)",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Paperclip size={14} />
                  Attachment: {imageUpload.name}
                </span>
                <button
                  onClick={() => setImageUpload(null)}
                  className="btn btn-ghost"
                  style={{ padding: "4px", border: "none", color: "#ef4444" }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Chat Input form panel */}
            <form onSubmit={handleSendMessage} style={{
              padding: "16px 20px",
              background: "var(--glass-bg)",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              {/* Image Input Trigger */}
              <label style={{ cursor: "pointer", display: "flex", color: "var(--text-secondary)" }}>
                <Image size={22} style={{ transition: "color var(--transition-fast)" }} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>

              <input
                type="text"
                placeholder="Type a message to discuss meet-ups..."
                className="form-input"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                style={{
                  borderRadius: "20px",
                  padding: "10px 18px",
                  background: "rgba(0,0,0,0.01)"
                }}
              />

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  padding: 0,
                  flexShrink: 0
                }}
                disabled={!typedMessage.trim() && !imageUpload}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            color: "var(--text-muted)",
            padding: "40px",
            textAlign: "center"
          }}>
            <MessageSquare size={44} style={{ marginBottom: "16px", color: "var(--border-color)" }} />
            <h3>Select a Conversation</h3>
            <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              Pick a chat from the sidebar to coordinate trades and transaction meetings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
