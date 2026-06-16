import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  ClipboardList,
  Bookmark,
  Star,
  Calendar,
  Edit,
  LogOut,
  Mail,
  BookOpen,
  Trash2,
  CheckCircle,
  Clock,
  ShieldAlert
} from "lucide-react";
import AuthModal from "./AuthModal";

export default function ProfileTab({ setActiveTab, setMarketplaceFilters }) {
  const {
    currentUser,
    listings,
    requests,
    savedItems,
    toggleSaveItem,
    deleteListing,
    deleteRequest,
    updateProfile,
    logout
  } = useContext(AppContext);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("listings"); // listings, requests, saved

  // Edit fields
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");

  const startEdit = () => {
    setName(currentUser.name);
    setDept(currentUser.department);
    setYear(currentUser.year);
    setBio(currentUser.bio);
    setPhoto(currentUser.photo);
    setIsEditing(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      department: dept,
      year,
      bio,
      photo
    });
    setIsEditing(false);
  };

  // Filter items owned by current user
  const ownListings = currentUser ? listings.filter(l => l.sellerId === currentUser.id) : [];
  const ownRequests = currentUser ? requests.filter(r => r.requesterId === currentUser.id) : [];

  // Filter bookmarked items
  const bookmarkedListings = currentUser ? listings.filter(l => (savedItems?.listings || []).includes(l.id)) : [];
  const bookmarkedRequests = currentUser ? requests.filter(r => (savedItems?.requests || []).includes(r.id)) : [];

  // Guest Onboarding Screen
  if (!currentUser) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px",
        textAlign: "center"
      }}>
        <div className="glass-panel" style={{ padding: "40px 32px", maxWidth: "400px", width: "100%" }}>
          <div style={{
            background: "var(--accent-light)",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            color: "var(--accent)"
          }}>
            <User size={30} />
          </div>
          
          <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "1.4rem", fontWeight: "700" }}>
            Student Identity Required
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "8px", lineHeight: "1.5" }}>
            Login with your student credentials to view your profile, manage listings, save items, and message other students.
          </p>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "24px", borderRadius: "10px" }}
          >
            Sign In / Sign Up
          </button>
        </div>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. Student Identity Header Card */}
      <div className="glass-panel" style={{
        padding: "24px",
        display: "flex",
        alignItems: "flex-start",
        gap: "24px",
        flexWrap: "wrap",
        position: "relative"
      }}>
        {/* Avatar */}
        <img
          src={currentUser.photo}
          alt={currentUser.name}
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid var(--accent-light)"
          }}
        />

        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "1.5rem", fontWeight: "700" }}>
              {currentUser.name}
            </h2>
            {currentUser.isAdmin && (
              <span style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                fontSize: "0.65rem",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "2px"
              }}>
                <ShieldAlert size={10} />
                ADMIN
              </span>
            )}
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            {currentUser.department} • {currentUser.year}
          </p>

          <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginTop: "10px", lineHeight: "1.4" }}>
            {currentUser.bio}
          </p>

          {/* Verification / joined metadata */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "14px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <Star size={14} fill="#f59e0b" style={{ color: "#f59e0b" }} />
              <span style={{ fontWeight: "700" }}>{currentUser.rating}</span>
              <span>({currentUser.reviewsCount} reviews)</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <CheckCircle size={14} style={{ color: "var(--accent)" }} />
              <span>{currentUser.itemsSold} items sold</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <Calendar size={14} />
              <span>Joined {currentUser.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Action Button Header */}
        <div style={{ display: "flex", gap: "8px", alignSelf: "flex-start" }}>
          <button
            onClick={startEdit}
            className="btn btn-ghost"
            style={{ padding: "8px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Edit size={14} />
            <span>Edit Profile</span>
          </button>
          
          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{ padding: "8px", border: "none", color: "#ef4444" }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Profile Edit Overlay Form */}
      <AnimatePresence>
        {isEditing && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 15, 30, 0.4)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px"
          }}>
            <motion.form
              onSubmit={handleSaveProfile}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel"
              style={{
                width: "100%",
                maxWidth: "460px",
                background: "var(--glass-bg)",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Edit Student Profile</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Year</label>
                  <select
                    className="form-input"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Bio</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Profile Photo URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Subsection Switcher Tabs */}
      <div style={{
        display: "flex",
        background: "rgba(0,0,0,0.02)",
        padding: "4px",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        width: "fit-content"
      }}>
        <button
          onClick={() => setActiveSubTab("listings")}
          style={{
            border: "none",
            background: activeSubTab === "listings" ? "var(--bg-surface-solid)" : "transparent",
            color: activeSubTab === "listings" ? "var(--accent)" : "var(--text-secondary)",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: "600",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          My Listings ({ownListings.length})
        </button>

        <button
          onClick={() => setActiveSubTab("requests")}
          style={{
            border: "none",
            background: activeSubTab === "requests" ? "var(--bg-surface-solid)" : "transparent",
            color: activeSubTab === "requests" ? "var(--accent)" : "var(--text-secondary)",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: "600",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          My Requests ({ownRequests.length})
        </button>

        <button
          onClick={() => setActiveSubTab("saved")}
          style={{
            border: "none",
            background: activeSubTab === "saved" ? "var(--bg-surface-solid)" : "transparent",
            color: activeSubTab === "saved" ? "var(--accent)" : "var(--text-secondary)",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: "600",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Saved Items ({bookmarkedListings.length + bookmarkedRequests.length})
        </button>
      </div>

      {/* 3. Sub Tabs Content */}
      <div style={{ minHeight: "200px" }}>
        {/* Listings Subtab */}
        {activeSubTab === "listings" && (
          <div>
            {ownListings.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                You have not listed any items for sale yet.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
                {ownListings.map(item => (
                  <div
                    key={item.id}
                    className="glass-panel"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden"
                    }}
                  >
                    <div className="image-container">
                      <img src={item.images[0]} alt={item.name} />
                      <span style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(10, 15, 30, 0.75)",
                        color: "#ffffff",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "700"
                      }}>
                        ₹{item.price}
                      </span>
                    </div>

                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name}
                      </h4>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.postedTime}</span>
                        <button
                          onClick={() => deleteListing(item.id)}
                          className="btn btn-ghost"
                          style={{ padding: "6px", border: "none", color: "#ef4444" }}
                          title="Delete Listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Subtab */}
        {activeSubTab === "requests" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {ownRequests.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                You have no active item requests on board.
              </div>
            ) : (
              ownRequests.map(req => (
                <div
                  key={req.id}
                  className="glass-panel"
                  style={{
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>Looking For: {req.itemName}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      Offering Budget: <strong style={{ color: "var(--accent)" }}>₹{req.budget}</strong>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => deleteRequest(req.id)}
                    className="btn btn-ghost"
                    style={{ padding: "8px", border: "none", color: "#ef4444" }}
                    title="Delete Request"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Saved Subtab (Wishlist) */}
        {activeSubTab === "saved" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Saved Listings */}
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-secondary)" }}>
                Saved Listings ({bookmarkedListings.length})
              </h3>
              
              {bookmarkedListings.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "10px 0" }}>No saved listings.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
                  {bookmarkedListings.map(item => (
                    <div
                      key={item.id}
                      className="glass-panel"
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
                          color: "#ffffff",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "700"
                        }}>
                          ₹{item.price}
                        </span>
                      </div>

                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.name}
                        </h4>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>By {item.sellerName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveItem("listings", item.id);
                            }}
                            className="btn btn-ghost"
                            style={{ padding: "6px", border: "none" }}
                          >
                            <Trash2 size={16} style={{ color: "#ef4444" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Requests */}
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px", color: "var(--text-secondary)" }}>
                Saved Requests ({bookmarkedRequests.length})
              </h3>
              
              {bookmarkedRequests.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "10px 0" }}>No saved requests.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {bookmarkedRequests.map(req => (
                    <div
                      key={req.id}
                      className="glass-panel"
                      style={{
                        padding: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer"
                      }}
                      onClick={() => setActiveTab("requests")}
                    >
                      <div>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>Looking For: {req.itemName}</h4>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                          Budget: <strong style={{ color: "var(--accent)" }}>₹{req.budget}</strong> • Need by {req.deadline}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveItem("requests", req.id);
                        }}
                        className="btn btn-ghost"
                        style={{ padding: "8px", border: "none" }}
                      >
                        <Trash2 size={16} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
