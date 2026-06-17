import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

export default function ProfilePromptModal({ isOpen, onClose }) {
  const { setProfileEditTriggered } = useContext(AppContext);

  if (!isOpen) return null;

  const handleGoToProfile = () => {
    // Trigger the profile edit mode on the Profile tab
    setProfileEditTriggered(true);
    // Navigate to profile tab
    window.location.hash = "profile";
    onClose();
  };

  return (
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
      zIndex: 1000,
      padding: "20px"
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--glass-bg)",
          padding: "28px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{
            position: "absolute",
            right: "16px",
            top: "16px",
            padding: "6px",
            borderRadius: "50%",
            border: "none"
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent)" }}>
          <AlertCircle size={24} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Complete Your Profile</h3>
        </div>

        <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: "1.5" }}>
          Kindly please fill your profile details (department, graduation year, and mobile number) to build trust for users who will be buying/selling.
        </p>
        
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          Providing a valid mobile number enables other students to connect with you via WhatsApp instantly when a deal is requested.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleGoToProfile}
            className="btn btn-primary"
          >
            Go to Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
}
