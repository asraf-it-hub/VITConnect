import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { formatRelativeTime } from "../utils/dateFormatter";
import {
  Search,
  Filter,
  Bookmark,
  MessageSquare,
  Share2,
  Calendar,
  User,
  Star,
  Tag,
  ChevronLeft,
  ChevronRight,
  X,
  PhoneCall,
  CheckCircle,
  Flag,
  ArrowUpDown
} from "lucide-react";

export default function MarketplaceTab({ filters, setFilters, onOpenChat, onOpenReport }) {
  const { listings, savedItems, toggleSaveItem, currentUser, reportItem, users } = useContext(AppContext);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sortBy, setSortBy] = useState("newest"); // price-asc, price-desc, newest, popular
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Read listing details if selected from dashboard
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (filters.selectedProductId) {
      const prod = listings.find(l => l.id === filters.selectedProductId);
      if (prod) {
        setSelectedProduct(prod);
        setActiveImageIndex(0);
      }
    }
  }, [filters.selectedProductId, listings]);

  const closeDetail = () => {
    setSelectedProduct(null);
    setFilters(prev => ({ ...prev, selectedProductId: null }));
  };

  // Categories list
  const categories = ["All", "Books", "Electronics", "Cycles", "Calculators", "Hostel Items", "Project Kits", "Lab Equipment", "Accessories", "Furniture", "Stationery"];

  // Filter listings
  const filteredListings = listings.filter(item => {
    // 1. Search Query
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(term);
      const matchDesc = item.description.toLowerCase().includes(term);
      if (!matchName && !matchDesc) return false;
    }

    // 2. Category
    if (filters.category && filters.category !== "All") {
      if (item.category !== filters.category) return false;
    }

    // 3. Department
    if (filters.department) {
      if (!item.sellerDept.toLowerCase().includes(filters.department.toLowerCase())) return false;
    }

    // 4. Year
    if (filters.year) {
      if (item.sellerYear !== filters.year) return false;
    }

    // 5. Price
    if (filters.minPrice && item.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && item.price > parseFloat(filters.maxPrice)) return false;

    // 6. Condition
    if (filters.condition && filters.condition !== "All") {
      if (item.condition !== filters.condition) return false;
    }

    return true;
  });

  // Sort filtered listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "popular") return b.views - a.views;
    return 1; // Default to newest (order of creation in array)
  });

  // Share Listing
  const handleShare = (e, item) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#marketplace?id=${item.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // WhatsApp Redirect Helper
  const handleWhatsAppRedirect = (item) => {
    const text = `Hi, I saw your listing for "${item.name}" (₹${item.price}) on VITConnect. Is it still available?`;
    const encodedText = encodeURIComponent(text);
    // Open standard WhatsApp URL. Since it is dummy seller, we redirect to a mock number or placeholder
    window.open(`https://wa.me/919876543210?text=${encodedText}`, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
      {/* Search and Filter Controls */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flexGrow: 1, minWidth: "200px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search products..."
            className="form-input"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ paddingLeft: "38px" }}
          />
        </div>

        {/* Category Fast Badges */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", maxWidth: "100%", padding: "4px 0" }} className="no-scrollbar">
          {categories.slice(0, 7).map(cat => (
            <button
              key={cat}
              onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
              style={{
                border: "1px solid var(--border-color)",
                background: (filters.category === cat || (!filters.category && cat === "All")) ? "var(--accent)" : "var(--glass-bg)",
                color: (filters.category === cat || (!filters.category && cat === "All")) ? "#ffffff" : "var(--text-secondary)",
                padding: "8px 14px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "500",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toggle Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-ghost"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px" }}
        >
          <Filter size={16} />
          <span>Filters</span>
        </button>

        {/* Sort Dropdown */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px" }}>
          <ArrowUpDown size={16} style={{ color: "var(--text-secondary)" }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              background: "var(--glass-bg)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-family-sans)",
              fontSize: "0.85rem",
              outline: "none"
            }}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Popularity</option>
          </select>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel"
            style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflow: "hidden" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
              {/* Category */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Category</span>
                <select
                  value={filters.category || "All"}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="form-input"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Department */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Seller Dept</span>
                <select
                  value={filters.department || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="form-input"
                >
                  <option value="">All Departments</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>

              {/* Year */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Seller Year</span>
                <select
                  value={filters.year || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  className="form-input"
                >
                  <option value="">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Price range */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Budget Range</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="number"
                    placeholder="Min"
                    className="form-input"
                    value={filters.minPrice || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  />
                  <span style={{ color: "var(--text-muted)" }}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="form-input"
                    value={filters.maxPrice || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </div>
              </div>

              {/* Condition */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Condition</span>
                <select
                  value={filters.condition || "All"}
                  onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                  className="form-input"
                >
                  <option value="All">All Conditions</option>
                  <option value="New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good Condition">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>

            {/* Reset filters */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setFilters({ category: "", search: "", department: "", year: "", minPrice: "", maxPrice: "", condition: "" })}
                className="btn btn-ghost"
                style={{ border: "none", fontSize: "0.85rem", padding: "6px 12px" }}
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      {sortedListings.length === 0 ? (
        <div className="glass-panel" style={{ padding: "80px 40px", textAlign: "center", color: "var(--text-secondary)" }}>
          <h3>No items match your criteria</h3>
          <p style={{ marginTop: "8px", fontSize: "0.9rem" }}>Try clearing some filters or searching for something else.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {sortedListings.map((item) => (
            <motion.div
              layout
              key={item.id}
              className="glass-panel glass-panel-hover"
              style={{ display: "flex", flexDirection: "column", overflow: "hidden", cursor: "pointer" }}
              onClick={() => {
                setSelectedProduct(item);
                setActiveImageIndex(0);
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
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", flexGrow: 1 }}>
                <div>
                  <h4 style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {item.name}
                  </h4>
                  <span style={{ fontSize: "0.75rem", background: "var(--border-color)", padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginTop: "4px" }}>
                    {item.condition}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    By {item.sellerName}
                    {(() => {
                      const sel = users.find(u => u.id === item.sellerId || u._id === item.sellerId);
                      return sel?.badge ? (
                        <span
                          title={`${sel.badge} (Approved by Admin)`}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: sel.badge === "Verified Student" ? "#10b981" :
                                        sel.badge === "Trusted Seller" ? "#f59e0b" :
                                        sel.badge === "Student Ambassador" ? "#3b82f6" :
                                        "#8b5cf6",
                            display: "inline-block"
                          }}
                        />
                      ) : null;
                    })()}
                  </span>
                  <span>{formatRelativeTime(item.createdAt, item.postedTime)}</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "12px",
                  marginTop: "auto"
                }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                    {item.sellerDept} ({item.sellerYear})
                  </span>
                  
                  {/* Action items */}
                  <div style={{ display: "flex", gap: "10px" }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleShare(e, item)}
                      className="btn btn-ghost"
                      style={{ padding: "6px", border: "none", position: "relative" }}
                      title="Copy Link"
                    >
                      {copiedId === item.id ? <CheckCircle size={16} style={{ color: "var(--accent)" }} /> : <Share2 size={16} />}
                      {copiedId === item.id && (
                        <span style={{
                          position: "absolute",
                          bottom: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "var(--text-primary)",
                          color: "var(--bg-primary)",
                          fontSize: "0.6rem",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          whiteSpace: "nowrap"
                        }}>
                          Copied!
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => toggleSaveItem("listings", item.id)}
                      className="btn btn-ghost"
                      style={{ padding: "6px", border: "none" }}
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
            </motion.div>
          ))}
        </div>
      )}

      {/* Listing Detail Modal / Page Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 15, 30, 0.4)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px"
          }} onClick={closeDetail}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="glass-panel"
              style={{
                width: "100%",
                maxWidth: "760px",
                maxHeight: "90vh",
                background: "var(--glass-bg)",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                position: "relative",
                padding: 0,
                boxShadow: "var(--shadow-lg)"
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeDetail}
                className="btn btn-ghost"
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "16px",
                  padding: "8px",
                  borderRadius: "50%",
                  border: "none",
                  zIndex: 10
                }}
              >
                <X size={20} />
              </button>

              {/* Top Section: Photo Gallery */}
              <div style={{ position: "relative", height: "320px", background: "var(--border-color)", width: "100%" }}>
                <img
                  src={selectedProduct.images[activeImageIndex]}
                  alt={selectedProduct.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                
                {/* Gallery Selectors if more than 1 image */}
                {selectedProduct.images.length > 1 && (
                  <div style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "6px",
                    background: "rgba(0,0,0,0.3)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    backdropFilter: "blur(4px)"
                  }}>
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: activeImageIndex === idx ? "var(--accent)" : "#ffffff",
                          border: "none",
                          cursor: "pointer"
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {/* Tag Category overlay */}
                <span style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "var(--accent)",
                  color: "#ffffff",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "700"
                }}>
                  {selectedProduct.category}
                </span>
              </div>

              {/* Content section */}
              <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Title and Price */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: "800", fontFamily: "var(--font-family-heading)", letterSpacing: "-0.02em" }}>
                      {selectedProduct.name}
                    </h2>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
                      <span style={{ fontSize: "0.8rem", background: "var(--accent-light)", color: "var(--accent)", padding: "3px 8px", borderRadius: "4px", fontWeight: "600" }}>
                        Condition: {selectedProduct.condition}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        Posted {formatRelativeTime(selectedProduct.createdAt, selectedProduct.postedTime)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--accent)" }}>
                      ₹{selectedProduct.price}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Offline transaction</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
                    Product Description
                  </h4>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Seller Profile Container */}
                <div className="glass-panel" style={{
                  padding: "16px",
                  background: "rgba(0,0,0,0.01)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={selectedProduct.sellerPhoto}
                      alt={selectedProduct.sellerName}
                      style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h4 style={{ fontSize: "1rem", fontWeight: "600" }}>{selectedProduct.sellerName}</h4>
                        {(() => {
                          const sel = users.find(u => u.id === selectedProduct.sellerId || u._id === selectedProduct.sellerId);
                          return sel?.badge ? (
                            <span style={{
                              background: sel.badge === "Verified Student" ? "rgba(16, 185, 129, 0.15)" :
                                          sel.badge === "Trusted Seller" ? "rgba(245, 158, 11, 0.15)" :
                                          sel.badge === "Student Ambassador" ? "rgba(59, 130, 246, 0.15)" :
                                          "rgba(139, 92, 246, 0.15)",
                              color: sel.badge === "Verified Student" ? "#10b981" :
                                     sel.badge === "Trusted Seller" ? "#f59e0b" :
                                     sel.badge === "Student Ambassador" ? "#3b82f6" :
                                     "#8b5cf6",
                              fontSize: "0.65rem",
                              fontWeight: "700",
                              padding: "2px 6px",
                              borderRadius: "4px"
                            }}>
                              {sel.badge.toUpperCase()}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <span>{selectedProduct.sellerDept} ({selectedProduct.sellerYear})</span>
                        {(() => {
                          const sel = users.find(u => u.id === selectedProduct.sellerId || u._id === selectedProduct.sellerId);
                          return sel?.badge ? (
                            <span style={{ color: "#10b981", fontWeight: "600" }}>
                              • Approved by Admin
                            </span>
                          ) : null;
                        })()}
                      </p>
                      {/* Seller Trust Rating */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <Star size={12} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                        <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>4.8</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>(Trust Verified)</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => onOpenChat(selectedProduct.sellerId, selectedProduct)}
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                    >
                      <MessageSquare size={16} />
                      <span>Chat in App</span>
                    </button>
                    <button
                      onClick={() => handleWhatsAppRedirect(selectedProduct)}
                      className="btn btn-secondary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem", display: "inline-flex", gap: "6px" }}
                    >
                      <PhoneCall size={16} />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "20px",
                  marginTop: "10px"
                }}>
                  <button
                    onClick={() => toggleSaveItem("listings", selectedProduct.id)}
                    className="btn btn-ghost"
                    style={{
                      borderColor: (savedItems?.listings || []).includes(selectedProduct.id) ? "var(--accent)" : "var(--border-color)",
                      color: (savedItems?.listings || []).includes(selectedProduct.id) ? "var(--accent)" : "var(--text-secondary)",
                      padding: "8px 16px"
                    }}
                  >
                    <Bookmark size={16} fill={(savedItems?.listings || []).includes(selectedProduct.id) ? "var(--accent)" : "none"} />
                    <span>{(savedItems?.listings || []).includes(selectedProduct.id) ? "Saved" : "Save Listing"}</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenReport("listings", selectedProduct.id);
                    }}
                    className="btn btn-ghost"
                    style={{ color: "#ef4444", border: "none", fontSize: "0.85rem" }}
                  >
                    <Flag size={14} />
                    <span>Report Spam</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
