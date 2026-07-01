import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { formatRelativeTime } from "../utils/dateFormatter";
import {
  Search,
  PlusCircle,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Tag,
  Book,
  Laptop,
  Bike,
  Home as HostelIcon,
  Calculator,
  ExternalLink,
  MessageSquare,
  Bookmark,
  ClipboardList,
  CheckCircle
} from "lucide-react";

export default function DashboardHome({ setActiveTab, onActionClick, setMarketplaceFilters }) {
  const { currentUser, listings, requests, lostFound, toggleSaveItem, savedItems } = useContext(AppContext);
  const [greeting, setGreeting] = useState("Hello");
  const [searchQuery, setSearchQuery] = useState("");

  // Determine greeting based on time of day
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting("Good morning");
    else if (hrs < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Filter lists to show recent highlights
  const activeListings = listings.filter(item => !item.status || item.status === "Available" || (item.status === "Reserved" && item.reservedUntil && new Date(item.reservedUntil) > new Date()));
  const recentListings = activeListings.slice(0, 4);
  const recentRequests = requests.slice(0, 3);
  const recentLostFound = lostFound.filter(item => !item.resolved).slice(0, 3);
  const recommendedItems = activeListings.slice().reverse().slice(0, 4);
  const soldListings = listings.filter(item => item.status === "Sold");

  const categories = [
    { name: "Books", icon: Book, color: "#3b82f6" },
    { name: "Electronics", icon: Laptop, color: "#10b981" },
    { name: "Cycles", icon: Bike, color: "#8b5cf6" },
    { name: "Calculators", icon: Calculator, color: "#f59e0b" },
    { name: "Hostel Items", icon: HostelIcon, color: "#ec4899" }
  ];

  const handleCategoryClick = (categoryName) => {
    setMarketplaceFilters(prev => ({ ...prev, category: categoryName }));
    setActiveTab("marketplace");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setMarketplaceFilters(prev => ({ ...prev, search: searchQuery }));
    setActiveTab("marketplace");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "40px" }}
    >
      {/* 1. Welcome Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-family-heading)", fontSize: "2.2rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
            {greeting}, <span style={{ color: "var(--accent)" }}>{currentUser ? currentUser.name.split(" ")[0] : "Student"}</span>!
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "0.95rem" }}>
            Welcome to the official VIT-AP student marketplace and community ecosystem.
          </p>
        </div>
        
        {/* Quick Actions Panel */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => onActionClick("sell")} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Sell Item</span>
          </button>
          <button onClick={() => onActionClick("request")} className="btn btn-secondary">
            <HelpCircle size={16} />
            <span>Need Item</span>
          </button>
        </div>
      </div>

      {/* 2. Global Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ position: "relative", width: "100%" }}>
        <input
          type="text"
          placeholder="Search for books, calculators, hostels, lost keys, cycles..."
          className="form-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "16px 20px 16px 52px",
            fontSize: "1.05rem",
            borderRadius: "16px",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--shadow-md)"
          }}
        />
        <Search size={22} style={{
          position: "absolute",
          left: "18px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          pointerEvents: "none"
        }} />
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "8px 18px",
            borderRadius: "10px",
            fontSize: "0.9rem"
          }}
        >
          Search
        </button>
      </form>

      {/* 3. Quick Actions Cards Grid (Visually standalone boxes) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px"
      }}>
        <div
          onClick={() => onActionClick("sell")}
          className="glass-panel glass-panel-hover"
          style={{ padding: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px" }}
        >
          <div style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--accent)", padding: "12px", borderRadius: "12px" }}>
            <PlusCircle size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "600" }}>Sell/Rent Item</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>List books, cycles & more</p>
          </div>
        </div>

        <div
          onClick={() => onActionClick("request")}
          className="glass-panel glass-panel-hover"
          style={{ padding: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px" }}
        >
          <div style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", padding: "12px", borderRadius: "12px" }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "600" }}>Create Request</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>Request items you need</p>
          </div>
        </div>

        <div
          onClick={() => onActionClick("lostfound")}
          className="glass-panel glass-panel-hover"
          style={{ padding: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px" }}
        >
          <div style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "12px", borderRadius: "12px" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "600" }}>Report Found</h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>Post wallets, keys & IDs</p>
          </div>
        </div>
      </div>

      {/* 4. Trending Categories */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <TrendingUp size={18} style={{ color: "var(--accent)" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Trending Categories</h3>
        </div>
        <div style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          paddingBottom: "8px"
        }} className="no-scrollbar">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => handleCategoryClick(cat.name)}
                className="glass-panel"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 20px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  border: "1px solid var(--border-color)",
                  whiteSpace: "nowrap",
                  background: "var(--glass-bg)",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  transition: "all var(--transition-fast)"
                }}
              >
                <div style={{
                  background: `${cat.color}15`,
                  color: cat.color,
                  padding: "6px",
                  borderRadius: "8px",
                  display: "flex"
                }}>
                  <Icon size={16} />
                </div>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Listings Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Recent Listings</h3>
          <button
            onClick={() => {
              setMarketplaceFilters(prev => ({ ...prev, category: "", search: "" }));
              setActiveTab("marketplace");
            }}
            className="btn btn-ghost"
            style={{ padding: "4px 8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px", border: "none" }}
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </button>
        </div>
        
        {recentListings.length === 0 ? (
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            No listings available yet. Be the first to post!
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px"
          }}>
            {recentListings.map((item) => (
              <div
                key={item.id}
                className="glass-panel glass-panel-hover"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setMarketplaceFilters(prev => ({ ...prev, selectedProductId: item.id }));
                  setActiveTab("marketplace");
                }}
              >
                <div className="image-container">
                  <img src={item.images[0]} alt={item.name} />
                  <span style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(10, 15, 30, 0.75)",
                    backdropFilter: "blur(4px)",
                    color: "#ffffff",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: "700"
                  }}>
                    ₹{item.price}
                  </span>
                  <span className="category-badge" style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(16, 185, 129, 0.2)"
                  }}>
                    {item.category}
                  </span>
                </div>
                <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                  <h4 style={{
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {item.name}
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span>By {item.sellerName.split(" ")[0]}</span>
                    <span>{formatRelativeTime(item.createdAt, item.postedTime)}</span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "10px",
                    marginTop: "4px"
                  }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {item.sellerDept} ({item.sellerYear})
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveItem("listings", item.id);
                      }}
                      style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex" }}
                    >
                      <Bookmark
                        size={16}
                        fill={(savedItems?.listings || []).includes(item.id) ? "var(--accent)" : "none"}
                        style={{ color: (savedItems?.listings || []).includes(item.id) ? "var(--accent)" : "var(--text-secondary)" }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Recent Requests Board & Lost & Found */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px"
      }}>
        {/* Recent Requests Section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Active Requests</h3>
            <button
              onClick={() => setActiveTab("requests")}
              className="btn btn-ghost"
              style={{ padding: "4px 8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px", border: "none" }}
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentRequests.map(req => (
              <div
                key={req.id}
                className="glass-panel"
                style={{
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  cursor: "pointer"
                }}
                onClick={() => setActiveTab("requests")}
              >
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Looking For: {req.itemName}</span>
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Requested by {req.requesterName} ({req.requesterDept}, {req.requesterYear})
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    Need before: <span style={{ color: "#ef4444", fontWeight: "500" }}>{req.deadline}</span>
                  </p>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent)" }}>
                    ₹{req.budget}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{formatRelativeTime(req.createdAt, req.postedTime)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lost & Found Highlights */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Lost & Found Reports</h3>
            <button
              onClick={() => setActiveTab("lostfound")}
              className="btn btn-ghost"
              style={{ padding: "4px 8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px", border: "none" }}
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentLostFound.map(item => (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: "14px 16px",
                  borderLeft: item.type === "Lost" ? "4px solid #f59e0b" : "4px solid var(--accent)",
                  cursor: "pointer"
                }}
                onClick={() => setActiveTab("lostfound")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.65rem",
                      fontWeight: "700",
                      background: item.type === "Lost" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: item.type === "Lost" ? "#f59e0b" : "var(--accent)",
                      marginBottom: "6px"
                    }}>
                      {item.type.toUpperCase()}
                    </span>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>{item.name}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      📍 {item.location}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatRelativeTime(item.createdAt, item.postedTime)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Recommended Items (Grid list) */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <Tag size={18} style={{ color: "var(--accent)" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Recommended for You</h3>
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px"
        }}>
          {recommendedItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel glass-panel-hover"
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                cursor: "pointer"
              }}
              onClick={() => {
                setMarketplaceFilters(prev => ({ ...prev, selectedProductId: item.id }));
                setActiveTab("marketplace");
              }}
            >
              <div className="image-container">
                <img src={item.images[0]} alt={item.name} />
                <span style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(10, 15, 30, 0.75)",
                  backdropFilter: "blur(4px)",
                  color: "#ffffff",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: "700"
                }}>
                  ₹{item.price}
                </span>
              </div>
              <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                <h4 style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {item.name}
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  <span>By {item.sellerName.split(" ")[0]}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {item.sellerDept}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Showcase of items sold through VITConnect */}
      {soldListings.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <span style={{ display: "inline-flex", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", padding: "6px", borderRadius: "8px" }}>
              <CheckCircle size={16} />
            </span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Sold via VITConnect</h3>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px"
          }}>
            {soldListings.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  opacity: 0.85
                }}
              >
                <div className="image-container" style={{ filter: "grayscale(30%)" }}>
                  <img src={item.images[0]} alt={item.name} />
                  <span style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(239, 68, 68, 0.85)",
                    backdropFilter: "blur(4px)",
                    color: "#ffffff",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: "700"
                  }}>
                    Sold (₹{item.price})
                  </span>
                </div>
                <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                  <h4 style={{
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textDecoration: "line-through",
                    color: "var(--text-secondary)"
                  }}>
                    {item.name}
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span>Seller: {item.sellerName}</span>
                    <span style={{ color: "#10b981", fontWeight: "600" }}>Verified Purchase ✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
