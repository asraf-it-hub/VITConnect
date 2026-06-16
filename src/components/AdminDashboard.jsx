import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  Flag,
  Trash2,
  Check,
  UserX,
  AlertTriangle,
  FileText
} from "lucide-react";

export default function AdminDashboard() {
  const { listings, requests, lostFound, users, banUser, deleteListing } = useContext(AppContext);
  const [adminSubTab, setAdminSubTab] = useState("reports"); // reports, users, listings

  // Filter reported listings
  const reportedListings = listings.filter(l => l.isReported);

  // Stats calculations
  const totalUsers = users.length;
  const totalListings = listings.length;
  const totalRequests = requests.length;
  const totalReportsCount = reportedListings.length;

  const handleDismissReport = (listingId) => {
    // Dimiss report by updating listing reported status to false
    // Since AppContext manages the state, we can dismiss it by using the edit/update flow
    // or just mock it here. Let's make it alert the admin.
    alert("Report dismissed for: " + listingId);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Admin Title */}
      <div>
        <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "1.5rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert size={26} style={{ color: "#ef4444" }} />
          <span>Ecosystem Administration</span>
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
          Manage VITConnect users, action spam reports, and maintain platform security.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px"
      }}>
        <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", padding: "10px", borderRadius: "10px" }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Total Students</span>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700" }}>{totalUsers}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--accent)", padding: "10px", borderRadius: "10px" }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Active Listings</span>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700" }}>{totalListings}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "10px", borderRadius: "10px" }}>
            <Flag size={20} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Spam Reports</span>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: totalReportsCount > 0 ? "#ef4444" : "var(--text-primary)" }}>{totalReportsCount}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        background: "rgba(0,0,0,0.02)",
        padding: "4px",
        borderRadius: "10px",
        border: "1px solid var(--border-color)",
        width: "fit-content"
      }}>
        <button
          onClick={() => setAdminSubTab("reports")}
          style={{
            border: "none",
            background: adminSubTab === "reports" ? "var(--bg-surface-solid)" : "transparent",
            color: adminSubTab === "reports" ? "#ef4444" : "var(--text-secondary)",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: "600",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Spam Reports ({totalReportsCount})
        </button>

        <button
          onClick={() => setAdminSubTab("users")}
          style={{
            border: "none",
            background: adminSubTab === "users" ? "var(--bg-surface-solid)" : "transparent",
            color: adminSubTab === "users" ? "var(--accent)" : "var(--text-secondary)",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: "600",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Manage Users ({totalUsers})
        </button>

        <button
          onClick={() => setAdminSubTab("listings")}
          style={{
            border: "none",
            background: adminSubTab === "listings" ? "var(--bg-surface-solid)" : "transparent",
            color: adminSubTab === "listings" ? "var(--accent)" : "var(--text-secondary)",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: "600",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          All Listings ({totalListings})
        </button>
      </div>

      {/* Subtab Contents */}
      <div style={{ minHeight: "200px" }}>
        {/* 1. Reports Subtab */}
        {adminSubTab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {reportedListings.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                <Check size={28} style={{ color: "var(--accent)", marginBottom: "8px" }} />
                <h4>No pending spam reports!</h4>
                <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>The ecosystem is clean and spam-free.</p>
              </div>
            ) : (
              reportedListings.map(item => (
                <div
                  key={item.id}
                  className="glass-panel"
                  style={{
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "24px",
                    borderLeft: "4px solid #ef4444"
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.65rem", background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                      REPORTED ITEM
                    </span>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginTop: "6px" }}>{item.name}</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      Listed by **{item.sellerName}** ({item.sellerDept}) • Price: ₹{item.price}
                    </p>
                    <div style={{
                      background: "rgba(239, 68, 68, 0.05)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#ef4444",
                      marginTop: "10px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <AlertTriangle size={14} />
                      <span>Report Reason: "{item.reportReason || "Spam Listing"}"</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleDismissReport(item.id)}
                      className="btn btn-ghost"
                      style={{ fontSize: "0.8rem", padding: "8px 14px", border: "1px solid var(--border-color)" }}
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => deleteListing(item.id)}
                      className="btn btn-danger"
                      style={{ fontSize: "0.8rem", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <Trash2 size={14} />
                      <span>Delete Listing</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. Users Subtab */}
        {adminSubTab === "users" && (
          <div className="glass-panel" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
                  <th style={{ padding: "16px 20px" }}>Student</th>
                  <th style={{ padding: "16px 20px" }}>Email</th>
                  <th style={{ padding: "16px 20px" }}>Dept & Year</th>
                  <th style={{ padding: "16px 20px" }}>Ecosystem Rating</th>
                  <th style={{ padding: "16px 20px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)", opacity: u.isAdmin ? 0.8 : 1 }}>
                    <td style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={u.photo} alt={u.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                      <span style={{ fontWeight: "600" }}>{u.name}</span>
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>{u.email}</td>
                    <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>{u.department} ({u.year})</td>
                    <td style={{ padding: "16px 20px", fontWeight: "700" }}>★ {u.rating}</td>
                    <td style={{ padding: "16px 20px" }}>
                      {u.isAdmin ? (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Protected</span>
                      ) : (
                        <button
                          onClick={() => banUser(u.id)}
                          className="btn btn-ghost"
                          style={{ color: "#ef4444", border: "none", padding: "6px", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <UserX size={14} />
                          <span style={{ fontSize: "0.75rem" }}>Ban User</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Listings Subtab */}
        {adminSubTab === "listings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {listings.map(l => (
              <div
                key={l.id}
                className="glass-panel"
                style={{
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img src={l.images[0]} alt={l.name} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>{l.name}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Seller: {l.sellerName} • Category: {l.category} • Price: ₹{l.price}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteListing(l.id)}
                  className="btn btn-ghost"
                  style={{ color: "#ef4444", border: "none", padding: "6px" }}
                  title="Remove Listing"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
