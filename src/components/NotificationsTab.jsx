import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import {
  Bell,
  MessageSquare,
  Bookmark,
  Compass,
  Check,
  AlertCircle,
  Clock,
  Trash2
} from "lucide-react";

export default function NotificationsTab({ setActiveTab }) {
  const { notifications, clearNotifications } = useContext(AppContext);

  const handleNotificationClick = (linkTab) => {
    // Navigate to respective tab
    if (linkTab && linkTab.startsWith("#")) {
      const tabId = linkTab.slice(1);
      setActiveTab(tabId);
      window.location.hash = tabId;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare size={16} style={{ color: "var(--accent)" }} />;
      case "save":
        return <Bookmark size={16} style={{ color: "#ec4899" }} />;
      case "lostfound":
        return <Compass size={16} style={{ color: "#f59e0b" }} />;
      default:
        return <Bell size={16} style={{ color: "#3b82f6" }} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "1.5rem", fontWeight: "700" }}>
            Notifications
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Stay updated with your listing activity and student messages.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={clearNotifications}
            className="btn btn-ghost"
            style={{ fontSize: "0.8rem", padding: "6px 12px", border: "none", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Check size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications list feed */}
      {notifications.length === 0 ? (
        <div className="glass-panel" style={{ padding: "80px 40px", textAlign: "center", color: "var(--text-secondary)" }}>
          <Bell size={36} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
          <h3>No notifications yet</h3>
          <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
            We'll alert you when other students bookmark your products or send you direct messages.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((notif) => (
            <motion.div
              layout
              key={notif.id}
              onClick={() => handleNotificationClick(notif.link)}
              className="glass-panel"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: notif.link ? "pointer" : "default",
                opacity: notif.read ? 0.7 : 1,
                borderLeft: notif.read ? "3px solid transparent" : "3px solid var(--accent)",
                background: notif.read ? "var(--glass-bg)" : "var(--accent-light)",
                transition: "all var(--transition-fast)"
              }}
            >
              <div style={{
                background: "var(--bg-surface-solid)",
                padding: "10px",
                borderRadius: "10px",
                display: "flex",
                boxShadow: "var(--shadow-sm)"
              }}>
                {getNotificationIcon(notif.type)}
              </div>

              <div style={{ flexGrow: 1 }}>
                <p style={{
                  fontSize: "0.95rem",
                  color: "var(--text-primary)",
                  fontWeight: notif.read ? "500" : "600",
                  lineHeight: "1.4"
                }}>
                  {notif.text}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  <Clock size={12} />
                  <span>{notif.time}</span>
                </div>
              </div>

              {!notif.read && (
                <span style={{
                  width: "8px",
                  height: "8px",
                  background: "var(--accent)",
                  borderRadius: "50%",
                  flexShrink: 0
                }} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
