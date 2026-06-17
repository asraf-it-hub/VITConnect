import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageSquare,
  Bookmark,
  Calendar,
  AlertCircle,
  PlusCircle,
  X,
  Plus,
  Send,
  Trash2
} from "lucide-react";

export default function RequestsTab({ onOpenChat, showCreateFormInitially = false, onCloseCreateForm }) {
  const { requests, addRequest, deleteRequest, currentUser, savedItems, toggleSaveItem } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(showCreateFormInitially);

  // New Request Form State
  const [itemName, setItemName] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("This Week");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync prop state
  React.useEffect(() => {
    if (showCreateFormInitially) {
      setShowCreateForm(true);
    }
  }, [showCreateFormInitially]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("Please log in first to create a request");
      return;
    }
    if (!itemName.trim()) {
      setError("Item name is required");
      return;
    }
    if (!budget || parseFloat(budget) <= 0) {
      setError("Please specify a valid budget");
      return;
    }

    setIsSubmitting(true);
    const result = await addRequest({
      itemName,
      budget: parseFloat(budget),
      deadline,
      description
    });
    setIsSubmitting(false);

    if (result && !result.success) {
      setError(result.error || "Failed to publish request.");
    } else {
      // Reset Form
      setItemName("");
      setBudget("");
      setDeadline("This Week");
      setDescription("");
      setShowCreateForm(false);
      if (onCloseCreateForm) onCloseCreateForm();
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      const matchName = req.itemName.toLowerCase().includes(term);
      const matchDesc = req.description.toLowerCase().includes(term);
      if (!matchName && !matchDesc) return false;
    }
    if (maxBudget && req.budget > parseFloat(maxBudget)) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header and Create Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "1.5rem", fontWeight: "700" }}>
            Requests Board
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Find out what other VIT-AP students are looking to buy.
          </p>
        </div>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
            style={{ borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={18} />
            <span>Post Request</span>
          </button>
        )}
      </div>

      {/* Create Request Glassmorphic Form Card */}
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
                <span>What are you looking for?</span>
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

            <form onSubmit={handleCreateRequest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {/* Item Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    Item Name Needed *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering Mathematics 2 Textbook"
                    className="form-input"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>

                {/* Budget */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    Your Budget (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 300"
                    className="form-input"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>

                {/* Deadline */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    Required Before
                  </label>
                  <select
                    className="form-input"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  >
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="Next Week">Next Week</option>
                    <option value="End of Month">End of Month</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                  Description / Specifications
                </label>
                <textarea
                  placeholder="Mention standard edition, author names, specific conditions, or preferred hostels to trade."
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
                  style={{ padding: "10px 24px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px", opacity: isSubmitting ? 0.7 : 1 }}
                  disabled={isSubmitting}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? "Publishing..." : "Publish Request"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flexGrow: 1, minWidth: "200px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search requests..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "38px" }}
          />
        </div>

        {/* Budget Limit Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--glass-bg)", border: "1px solid var(--border-color)", padding: "4px 14px", borderRadius: "10px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Max Budget:</span>
          <input
            type="number"
            placeholder="Any"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            style={{
              width: "70px",
              border: "none",
              background: "transparent",
              color: "var(--text-primary)",
              fontFamily: "var(--font-family-sans)",
              fontWeight: "600",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Requests Listings */}
      {filteredRequests.length === 0 ? (
        <div className="glass-panel" style={{ padding: "60px 40px", textAlign: "center", color: "var(--text-secondary)" }}>
          <AlertCircle size={32} style={{ color: "var(--text-muted)", marginBottom: "10px" }} />
          <h3>No active requests found</h3>
          <p style={{ marginTop: "6px", fontSize: "0.9rem" }}>Try adjusting your search query or budget filters.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredRequests.map((req) => (
            <motion.div
              layout
              key={req.id}
              className="glass-panel"
              style={{
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "24px",
                flexWrap: "wrap",
                borderLeft: "4px solid var(--accent)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "240px" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                    Looking For: {req.itemName}
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Posted by **{req.requesterName}** ({req.requesterDept}, {req.requesterYear})
                  </p>
                </div>

                {req.description && (
                  <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: "1.5", marginTop: "4px" }}>
                    {req.description}
                  </p>
                )}

                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                    <span>Need before: <strong style={{ color: "#ef4444" }}>{req.deadline}</strong></span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{req.postedTime}</span>
                </div>
              </div>

              {/* Budget and Actions */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: "100%",
                minHeight: "80px",
                gap: "12px",
                alignSelf: "stretch"
              }}>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Offering Budget</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent)" }}>
                    ₹{req.budget}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {/* Delete Button (If created by current user) */}
                  {currentUser && currentUser.id === req.requesterId && (
                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="btn btn-ghost"
                      style={{ padding: "8px", border: "none", color: "#ef4444" }}
                      title="Delete Request"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => toggleSaveItem("requests", req.id)}
                    className="btn btn-ghost"
                    style={{ padding: "8px", border: "none" }}
                    title="Save Request"
                  >
                    <Bookmark
                      size={16}
                      fill={(savedItems?.requests || []).includes(req.id) ? "var(--accent)" : "none"}
                      style={{ color: (savedItems?.requests || []).includes(req.id) ? "var(--accent)" : "var(--text-secondary)" }}
                    />
                  </button>

                  {/* Disable chat with self */}
                  {(!currentUser || currentUser.id !== req.requesterId) && (
                    <button
                      onClick={() => onOpenChat(req.requesterId, { id: req.id, name: `Request: ${req.itemName}`, price: req.budget, isRequest: true })}
                      className="btn btn-primary"
                      style={{ padding: "8px 14px", fontSize: "0.85rem" }}
                    >
                      <MessageSquare size={16} />
                      <span>Fulfill</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
