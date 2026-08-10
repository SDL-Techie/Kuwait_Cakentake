import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Settings, BarChart3, ScrollText, Users } from "lucide-react";
import './Loyality.css';
import LoyaltySettings from "./Loyalitysettings";
import LoyaltyReport from "./Loyalityreport";
import LoyaltyLedger from "./Loyalityledger";
import CustomerLoyalty from "./Customerloyality";


type TabKey = "settings" | "report" | "ledger" | "customer";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { key: "settings", label: "Loyalty Settings", icon: Settings },
  { key: "report", label: "Loyalty Report", icon: BarChart3 },
  { key: "ledger", label: "Loyalty Ledger", icon: ScrollText },
  { key: "customer", label: "Customer Details", icon: Users },
];

const Loyalty: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("settings");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "settings":
        return <LoyaltySettings/>;
      case "report":
        return <LoyaltyReport/>;
      case "ledger":
        return <LoyaltyLedger/>;
      case "customer":
        return <CustomerLoyalty/>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="loyalty-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Page Header */}
      <div className="loyalty-header">
        <div className="loyalty-header-icon">
          <Star size={26} strokeWidth={2.2} />
        </div>
        <div className="loyalty-header-text">
          <h1 className="loyalty-title">Loyalty Management</h1>
          <p className="loyalty-subtitle">
            Manage loyalty settings, reports, customer points and transaction history.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="loyalty-tabs" role="tablist" aria-label="Loyalty Management Tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              className={`loyalty-tab ${isActive ? "loyalty-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {isActive && (
                <motion.div
                  layoutId="loyalty-tab-highlight"
                  className="loyalty-tab-highlight"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="loyalty-tab-content">
                <Icon size={17} strokeWidth={2.1} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Card */}
      <div className="loyalty-content-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="loyalty-content-inner"
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Loyalty;