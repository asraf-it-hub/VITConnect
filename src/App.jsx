import React, { useState, useEffect, useContext } from "react";
import { AppProvider, AppContext } from "./context/AppContext";
import Navigation from "./components/Navigation";
import DashboardHome from "./components/DashboardHome";
import MarketplaceTab from "./components/MarketplaceTab";
import RequestsTab from "./components/RequestsTab";
import LostFoundTab from "./components/LostFoundTab";
import ChatWindow from "./components/ChatWindow";
import NotificationsTab from "./components/NotificationsTab";
import ProfileTab from "./components/ProfileTab";
import AdminDashboard from "./components/AdminDashboard";
import CreateListingModal from "./components/CreateListingModal";
import AuthModal from "./components/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, CheckCircle, Flag, X } from "lucide-react";

function AppContent() {
  const { currentUser, reportItem } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("home");
  
  // Modals state
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Form overrides (to open forms directly from dashboard quick actions)
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showLostFoundForm, setShowLostFoundForm] = useState(false);

  // Chat redirect state
  const [redirectChatRecipientId, setRedirectChatRecipientId] = useState(null);

  // Spam reporting state
  const [reportTarget, setReportTarget] = useState({ type: "", id: "" });
  const [reportReason, setReportReason] = useState("Spam");

  // Global marketplace filters
  const [marketplaceFilters, setMarketplaceFilters] = useState({
    category: "",
    search: "",
    department: "",
    year: "",
    minPrice: "",
    maxPrice: "",
    condition: "",
    selectedProductId: null
  });

  // Sync with Hash Router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["home", "marketplace", "requests", "lostfound", "messages", "notifications", "profile", "admin"].includes(hash)) {
        setActiveTab(hash);
      } else {
        setActiveTab("home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Run on mount

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Quick Action triggers from Dashboard
  const handleQuickAction = (actionType) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (actionType === "sell") {
      setIsSellModalOpen(true);
    } else if (actionType === "request") {
      setShowRequestForm(true);
      setActiveTab("requests");
      window.location.hash = "requests";
    } else if (actionType === "lostfound") {
      setShowLostFoundForm(true);
      setActiveTab("lostfound");
      window.location.hash = "lostfound";
    }
  };

  // Open Chat directly from listings/requests
  const handleOpenChat = (recipientId, productContext) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    
    // Trigger chat window loading
    setRedirectChatRecipientId(recipientId);
    setActiveTab("messages");
    window.location.hash = "messages";
  };

  // Open Report Modal
  const handleOpenReport = (type, id) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setReportTarget({ type, id });
    setReportReason("Spam");
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    reportItem(reportTarget.type, reportTarget.id, reportReason);
    setIsReportModalOpen(false);
  };

  // Render view based on active tab
  const renderView = () => {
    switch (activeTab) {
      case "home":
        return (
          <DashboardHome
            setActiveTab={setActiveTab}
            onActionClick={handleQuickAction}
            setMarketplaceFilters={setMarketplaceFilters}
          />
        );
      case "marketplace":
        return (
          <MarketplaceTab
            filters={marketplaceFilters}
            setFilters={setMarketplaceFilters}
            onOpenChat={handleOpenChat}
            onOpenReport={handleOpenReport}
          />
        );
      case "requests":
        return (
          <RequestsTab
            onOpenChat={handleOpenChat}
            showCreateFormInitially={showRequestForm}
            onCloseCreateForm={() => setShowRequestForm(false)}
          />
        );
      case "lostfound":
        return (
          <LostFoundTab
            onOpenChat={handleOpenChat}
            showCreateFormInitially={showLostFoundForm}
            onCloseCreateForm={() => setShowLostFoundForm(false)}
          />
        );
      case "messages":
        return <ChatWindow initialActiveChatId={redirectChatRecipientId} />;
      case "notifications":
        return <NotificationsTab setActiveTab={setActiveTab} />;
      case "profile":
        return (
          <ProfileTab
            setActiveTab={setActiveTab}
            setMarketplaceFilters={setMarketplaceFilters}
          />
        );
      case "admin":
        return currentUser?.isAdmin ? <AdminDashboard /> : <DashboardHome setActiveTab={setActiveTab} onActionClick={handleQuickAction} setMarketplaceFilters={setMarketplaceFilters} />;
      default:
        return <DashboardHome setActiveTab={setActiveTab} onActionClick={handleQuickAction} setMarketplaceFilters={setMarketplaceFilters} />;
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="ambient-glows">
        <div className="glow-bubble glow-bubble-1"></div>
        <div className="glow-bubble glow-bubble-2"></div>
      </div>

      {/* Responsive Navigation Sidebar / Bottom Nav */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container Workspace */}
      <main className="main-content" style={{
        flexGrow: 1,
        padding: "32px 40px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%"
      }}>
        {/* Animated Page Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals Mounting Portal */}
      <AnimatePresence>
        {isSellModalOpen && (
          <CreateListingModal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Report Spam/Abuse Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
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
            <motion.form
              onSubmit={handleReportSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel"
              style={{
                width: "100%",
                maxWidth: "380px",
                background: "var(--glass-bg)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", color: "#ef4444" }}>
                  <Flag size={18} />
                  <span>Report Listing</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="btn btn-ghost"
                  style={{ padding: "4px", borderRadius: "50%", border: "none" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                  Select Report Reason
                </label>
                <select
                  className="form-input"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="Spam">Spam Posting</option>
                  <option value="Fake Listing">Fake Listing / Fake Price</option>
                  <option value="Abuse">Abusive Description</option>
                  <option value="Duplicate">Duplicate Post</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="btn btn-ghost"
                  style={{ fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  style={{ fontSize: "0.85rem" }}
                >
                  Submit Report
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
