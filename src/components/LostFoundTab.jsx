import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Compass,
  Calendar,
  MapPin,
  MessageSquare,
  CheckCircle,
  Plus,
  X,
  AlertCircle,
  PlusCircle,
  Clock
} from "lucide-react";

export default function LostFoundTab({ onOpenChat, showCreateFormInitially = false, onCloseCreateForm }) {
  const { lostFound, addLostFound, resolveLostFound, currentUser } = useContext(AppContext);
  const [activeFilter, setActiveFilter] = useState("All"); // All, Lost, Found
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(showCreateFormInitially);

  // New Post Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("Lost");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync prop state
  React.useEffect(() => {
    if (showCreateFormInitially) {
      setShowCreateForm(true);
    }
  }, [showCreateFormInitially]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("Please log in first to report an item");
      return;
    }
    if (!name.trim()) {
      setError("Item name is required");
      return;
    }
    if (!location.trim()) {
      setError("Location is required");
      return;
    }
    if (!date) {
      setError("Please select the date");
      return;
    }

    setIsSubmitting(true);
    const result = await addLostFound({
      name,
      type,
      location,
      date,
      description
    });
    setIsSubmitting(false);

    if (result && !result.success) {
      setError(result.error || "Failed to publish report.");
    } else {
      // Reset Form
      setName("");
      setType("Lost");
      setLocation("");
      setDate("");
      setDescription("");
      setShowCreateForm(false);
      if (onCloseCreateForm) onCloseCreateForm();
    }
  };

  // Filter posts
  const filteredPosts = lostFound.filter(post => {
    // 1. Status Filter (Resolved/Unresolved)
    // We only display unresolved posts on the public board
    if (post.resolved) return false;

    // 2. Tab Filter
    if (activeFilter !== "All" && post.type !== activeFilter) return false;

    // 3. Search Query
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      const matchName = post.name.toLowerCase().includes(term);
      const matchDesc = post.description.toLowerCase().includes(term);
      const matchLoc = post.location.toLowerCase().includes(term);
      if (!matchName && !matchDesc && !matchLoc) return false;
    }

    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header and Action Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "1.5rem", fontWeight: "700" }}>
            Lost & Found Board
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Help each other find lost items on the VIT-AP Campus.
          </p>
        </div>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
            style={{ borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={18} />
            <span>Report Item</span>
          </button>
        )}
      </div>

      {/* Glassmorphic Report Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="glass-panel"
            style={{ padding: "24px", overflow: "hidden", border: "1px solid var(--accent)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <PlusCircle size={20} style={{ color: "var(--accent)" }} />
                <span>Report Lost / Found Item</span>
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  if (onCloseCreateForm) onCloseCreateForm();
                }}
                className="btn btn-ghost"
                style={{ padding: "4px", borderRadius: "50%", border: "none" }}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "16px",
                border: "1px solid rgba(239, 68, 68, 0.15)"
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePost} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {/* Item Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Boat Charging Case"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Report Type */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    Report Status *
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setType("Lost")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "10px",
                        background: type === "Lost" ? "rgba(245, 158, 11, 0.15)" : "transparent",
                        color: type === "Lost" ? "#f59e0b" : "var(--text-secondary)",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      LOST
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("Found")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "10px",
                        background: type === "Found" ? "rgba(16, 185, 129, 0.15)" : "transparent",
                        color: type === "Found" ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      FOUND
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    Location (On Campus) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SJT Block 3rd floor"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {/* Date */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    Date Lost/Found *
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                  Item Description / Details
                </label>
                <textarea
                  placeholder="Mention color, brand, distinct scratches, key chains, lock codes, contents (for bags/wallets) or contact info."
                  className="form-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: "10px 24px", borderRadius: "10px", opacity: isSubmitting ? 0.7 : 1 }}
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Publishing..." : "Publish Report"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs and Search Filters */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
        {/* Toggle Categories Tabs */}
        <div style={{
          display: "flex",
          background: "rgba(0,0,0,0.02)",
          padding: "4px",
          borderRadius: "10px",
          border: "1px solid var(--border-color)",
          width: "fit-content"
        }}>
          {["All", "Lost", "Found"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              style={{
                border: "none",
                background: activeFilter === tab ? "var(--bg-surface-solid)" : "transparent",
                color: activeFilter === tab
                  ? (tab === "Lost" ? "#f59e0b" : (tab === "Found" ? "var(--accent)" : "var(--text-primary)"))
                  : "var(--text-secondary)",
                padding: "8px 16px",
                fontSize: "0.85rem",
                fontWeight: "600",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all var(--transition-fast)"
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", flexGrow: 1, maxWidth: "400px", minWidth: "200px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search lost & found..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "38px" }}
          />
        </div>
      </div>

      {/* Board Post Listings */}
      {filteredPosts.length === 0 ? (
        <div className="glass-panel" style={{ padding: "60px 40px", textAlign: "center", color: "var(--text-secondary)" }}>
          <Compass size={32} style={{ color: "var(--text-muted)", marginBottom: "10px" }} />
          <h3>No active lost/found claims on board</h3>
          <p style={{ marginTop: "6px", fontSize: "0.9rem" }}>Try searching for a different keyword or location.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredPosts.map((post) => {
            const isLost = post.type === "Lost";
            const accentColor = isLost ? "#f59e0b" : "var(--accent)";
            return (
              <motion.div
                layout
                key={post.id}
                className="glass-panel"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  borderLeft: `4px solid ${accentColor}`,
                  position: "relative"
                }}
              >
                {/* Header Tag / Date */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: "800",
                    background: isLost ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                    color: accentColor,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    letterSpacing: "0.05em"
                  }}>
                    {post.type.toUpperCase()}
                  </span>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <Calendar size={12} />
                    <span>{post.date}</span>
                  </div>
                </div>

                {/* Name & Location */}
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{post.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <MapPin size={14} style={{ color: accentColor }} />
                    <span>{post.location}</span>
                  </div>
                </div>

                {/* Description */}
                {post.description && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: "1.5" }}>
                    {post.description}
                  </p>
                )}

                {/* Footer and contact hook */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "12px",
                  marginTop: "auto"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <Clock size={12} />
                    <span>Posted by {post.studentName.split(" ")[0]}</span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {/* Mark Resolved (Only if owned by current user) */}
                    {currentUser && currentUser.id === post.studentId && (
                      <button
                        onClick={() => resolveLostFound(post.id)}
                        className="btn btn-ghost"
                        style={{
                          padding: "6px 10px",
                          borderColor: "var(--accent)",
                          color: "var(--accent)",
                          fontSize: "0.75rem"
                        }}
                        title="Mark Resolved"
                      >
                        <CheckCircle size={14} />
                        <span>Resolved</span>
                      </button>
                    )}

                    {/* Chat with Owner (If not current user) */}
                    {(!currentUser || currentUser.id !== post.studentId) && (
                      <button
                        onClick={() => onOpenChat(post.studentId, { id: post.id, name: `Lost/Found: ${post.name}`, price: post.type, isLostFound: true })}
                        className="btn btn-primary"
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                      >
                        <MessageSquare size={14} />
                        <span>Contact</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
