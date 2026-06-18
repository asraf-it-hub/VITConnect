import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { formatRelativeTime } from "../utils/dateFormatter";
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
    logout,
    profileEditTriggered,
    setProfileEditTriggered
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
  const [mobile, setMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = () => {
    setName(currentUser.name);
    setDept(currentUser.department);
    setYear(currentUser.year);
    setBio(currentUser.bio);
    setPhoto(currentUser.photo);
    setMobile(currentUser.mobile || "");
    setIsEditing(true);
  };

  useEffect(() => {
    if (profileEditTriggered && currentUser) {
      startEdit();
      setProfileEditTriggered(false);
    }
  }, [profileEditTriggered, currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError("");
    setIsSubmitting(true);
    const result = await updateProfile({
      name,
      department: dept,
      year,
      bio,
      photo,
      mobile
    });
    setIsSubmitting(false);
    if (result && !result.success) {
      setEditError(result.error || "Failed to update profile.");
    } else {
      setIsEditing(false);
    }
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
            {currentUser.badge && (
               <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                 <span style={{
                   background: currentUser.badge === "Verified Student" ? "rgba(16, 185, 129, 0.15)" :
                               currentUser.badge === "Trusted Seller" ? "rgba(245, 158, 11, 0.15)" :
                               currentUser.badge === "Student Ambassador" ? "rgba(59, 130, 246, 0.15)" :
                               "rgba(139, 92, 246, 0.15)",
                   color: currentUser.badge === "Verified Student" ? "#10b981" :
                          currentUser.badge === "Trusted Seller" ? "#f59e0b" :
                          currentUser.badge === "Student Ambassador" ? "#3b82f6" :
                          "#8b5cf6",
                   fontSize: "0.65rem",
                   fontWeight: "700",
                   padding: "2px 6px",
                   borderRadius: "4px",
                   display: "inline-flex",
                   alignItems: "center"
                 }}>
                   {currentUser.badge.toUpperCase()}
                 </span>
                 <span style={{
                   fontSize: "0.7rem",
                   color: "#10b981",
                   fontWeight: "600",
                   display: "inline-flex",
                   alignItems: "center",
                   gap: "2px"
                 }}>
                   (✓ Approved by Admin)
                 </span>
               </div>
             )}
          </div>

          {(currentUser.department || currentUser.year) ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              {currentUser.department}{currentUser.department && currentUser.year ? " • " : ""}{currentUser.year}
            </p>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px", fontStyle: "italic" }}>
              Department & Year not specified
            </p>
          )}

          <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginTop: "10px", lineHeight: "1.4" }}>
            {currentUser.bio || "No bio added yet."}
          </p>

          {/* Verification / joined metadata */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "14px", flexWrap: "wrap" }}>
            {currentUser.reviewsCount > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <Star size={14} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                <span style={{ fontWeight: "700" }}>{currentUser.rating}</span>
                <span>({currentUser.reviewsCount} reviews)</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <Star size={14} style={{ color: "var(--text-muted)" }} />
                <span>No reviews yet</span>
              </div>
            )}

            {currentUser.itemsSold > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <CheckCircle size={14} style={{ color: "var(--accent)" }} />
                <span>{currentUser.itemsSold} items sold</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <CheckCircle size={14} style={{ color: "var(--text-muted)" }} />
                <span>No items sold yet</span>
              </div>
            )}

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

              {editError && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  border: "1px solid rgba(239, 68, 68, 0.15)"
                }}>
                  {editError}
                </div>
              )}

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
                    style={{
                      background: "var(--bg-surface-solid)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      padding: "8px 12px",
                      borderRadius: "8px"
                    }}
                  >
                    <option value="" style={{ color: "var(--text-primary)", background: "var(--bg-surface-solid)" }}>Select Year</option>
                    <option value="1st Year" style={{ color: "var(--text-primary)", background: "var(--bg-surface-solid)" }}>1st Year</option>
                    <option value="2nd Year" style={{ color: "var(--text-primary)", background: "var(--bg-surface-solid)" }}>2nd Year</option>
                    <option value="3rd Year" style={{ color: "var(--text-primary)", background: "var(--bg-surface-solid)" }}>3rd Year</option>
                    <option value="4th Year" style={{ color: "var(--text-primary)", background: "var(--bg-surface-solid)" }}>4th Year</option>
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
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Mobile Number (10 digits for WhatsApp)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>

               <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                 <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Profile Photo</label>
                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                   <img
                     src={photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                     alt="Preview"
                     style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }}
                   />
                   <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handlePhotoUpload}
                       style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
                     />
                     <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Supports JPG, PNG (Max 2MB)</span>
                   </div>
                 </div>
               </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ opacity: isSubmitting ? 0.7 : 1 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
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
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{formatRelativeTime(item.createdAt, item.postedTime)}</span>
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
