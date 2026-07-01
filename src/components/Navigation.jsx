import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import {
  Home,
  ShoppingBag,
  ClipboardList,
  Compass,
  MessageSquare,
  Bell,
  User,
  Shield,
  Sun,
  Moon,
  LogOut
} from "lucide-react";

export default function Navigation({ activeTab, setActiveTab }) {
  const { currentUser, conversations, notifications, logout, orders } = useContext(AppContext);
  const [isDark, setIsDark] = useState(() => document.body.classList.contains("dark"));

  // Toggle Theme
  const toggleTheme = () => {
    const body = document.body;
    if (body.classList.contains("dark")) {
      body.classList.remove("dark");
      setIsDark(false);
      localStorage.setItem("vitconnect_theme", "light");
    } else {
      body.classList.add("dark");
      setIsDark(true);
      localStorage.setItem("vitconnect_theme", "dark");
    }
  };

  // Sync theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("vitconnect_theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (storedTheme === "dark" || (!storedTheme && systemPrefersDark)) {
      document.body.classList.add("dark");
      setIsDark(true);
    } else {
      document.body.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // Calculate unread counts
  const unreadMessagesCount = conversations.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const pendingSalesCount = orders ? orders.filter(o => o.sellerId === currentUser?.id && o.status === "Pending Payment Verification").length : 0;

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "requests", label: "Requests", icon: ClipboardList },
    { id: "lostfound", label: "Lost & Found", icon: Compass },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: unreadMessagesCount },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadNotifCount },
    { id: "profile", label: "Profile", icon: User, badge: pendingSalesCount }
  ];

  // If user is Admin, add Admin dashboard option
  if (currentUser?.isAdmin) {
    navItems.push({ id: "admin", label: "Admin", icon: Shield });
  }

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId === "home" ? "" : tabId;
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="desktop-sidebar glass-panel" style={{
        width: "260px",
        height: "calc(100vh - 32px)",
        position: "sticky",
        top: "16px",
        margin: "16px 0 16px 16px",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        zIndex: 50
      }}>
        {/* Brand / Logo */}
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            gap: "12px", 
            marginBottom: "32px", 
            padding: "8px 0",
            userSelect: "none",
            textAlign: "center"
          }}
        >
          <img 
            onClick={() => handleNavClick("home")}
            src="/FinalLogo.png" 
            alt="VITConnect Logo" 
            style={{ 
              height: "80px", 
              width: "80px", 
              borderRadius: "16px", 
              objectFit: "cover", 
              boxShadow: "var(--shadow-sm)",
              cursor: "pointer",
              transition: "transform var(--transition-fast), opacity var(--transition-fast)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.opacity = 0.9;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.opacity = 1;
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              fontFamily: "var(--font-family-heading)",
              fontSize: "1.4rem",
              fontWeight: "800",
              color: "var(--accent)",
              letterSpacing: "-0.03em",
              lineHeight: "1.2"
            }}>
              VITConnect
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500", marginTop: "2px" }}>
              Buy. Sell. Connect.
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flexGrow: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="btn"
                style={{
                  justifyContent: "flex-start",
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: isActive ? "var(--accent-light)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  border: "none",
                  fontWeight: isActive ? "600" : "500",
                  transition: "all var(--transition-fast)",
                  position: "relative"
                }}
              >
                <Icon size={20} style={{ minWidth: "20px" }} />
                <span>{item.label}</span>
                
                {item.badge > 0 && (
                  <span style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: item.id === "messages" ? "var(--accent)" :
                                item.id === "profile" ? "#f59e0b" : "#ef4444",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    height: "18px",
                    minWidth: "18px",
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 5px"
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Area with Theme Toggle and Profile context */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          borderTop: "1px solid var(--border-color)",
          paddingTop: "16px",
          marginTop: "16px"
        }}>
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "flex-start", border: "none", padding: "10px 14px" }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* User profile short card / login triggers */}
          {currentUser ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 8px"
            }}>
              <img
                src={currentUser.photo}
                alt={currentUser.name}
                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", flexGrow: 1 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentUser.department}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn btn-ghost"
                title="Logout"
                style={{ padding: "8px", border: "none", color: "#ef4444" }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab("profile")}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav-bar">
        {navItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                fontSize: "0.65rem",
                fontWeight: isActive ? "600" : "500",
                gap: "4px",
                position: "relative",
                width: "55px",
                height: "100%"
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: "0.65rem" }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  position: "absolute",
                  top: "4px",
                  right: "6px",
                  background: item.id === "messages" ? "var(--accent)" : "#ef4444",
                  color: "#ffffff",
                  fontSize: "0.6rem",
                  fontWeight: "700",
                  height: "15px",
                  minWidth: "15px",
                  borderRadius: "7.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px"
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
        {/* Profile Button on Mobile Nav */}
        <button
          onClick={() => handleNavClick("profile")}
          style={{
            background: "transparent",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: activeTab === "profile" ? "var(--accent)" : "var(--text-secondary)",
            fontSize: "0.65rem",
            fontWeight: activeTab === "profile" ? "600" : "500",
            gap: "4px",
            width: "55px",
            height: "100%"
          }}
        >
          {currentUser ? (
            <div style={{ position: "relative" }}>
              <img
                src={currentUser.photo}
                alt="Profile"
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: activeTab === "profile" ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                  objectFit: "cover"
                }}
              />
              {pendingSalesCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#f59e0b",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%"
                }} />
              )}
            </div>
          ) : (
            <User size={20} />
          )}
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
}
