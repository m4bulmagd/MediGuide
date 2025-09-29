import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Analyzer from "./components/Analyzer";
import MedicationManager from "./components/MedicationManager";

// Tab icons (Heroicons outline)
const AnalyzerIcon = ({ active }) => (
  <svg
    className={`w-6 h-6 mr-2 ${active ? "text-blue-400" : "text-gray-400"}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" />
    <path d="M12 8v4l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MedsIcon = ({ active }) => (
  <svg
    className={`w-6 h-6 mr-2 ${active ? "text-blue-400" : "text-gray-400"}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <rect x="3" y="8" width="18" height="8" rx="4" stroke="currentColor" />
    <path d="M7 8v8M17 8v8" stroke="currentColor" />
  </svg>
);

// Dark mode gradient and glass effect
const bgGradient =
  "bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 min-h-screen";

export default function App() {
  const [activeTab, setActiveTab] = useState("analyzer");

  return (
    <div className={bgGradient + " py-6 px-2 min-h-screen"}>
      <main className="w-full max-w-2xl mx-auto rounded-3xl shadow-2xl overflow-visible bg-white/10 backdrop-blur-xl border border-blue-900/40">
        {/* Animated Tabs */}
        <div className="relative flex border-b border-blue-900/30 bg-black/40 z-10">
          {[
            { key: "analyzer", label: "Analyzer", icon: AnalyzerIcon },
            { key: "medications", label: "Medications", icon: MedsIcon },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 flex items-center justify-center py-4 px-2 sm:px-6 font-bold text-lg transition-colors duration-300 focus:outline-none
                ${
                  activeTab === tab.key
                    ? "text-blue-300"
                    : "text-gray-400 hover:text-blue-400"
                }
              `}
              style={{ letterSpacing: "0.02em" }}
            >
              <tab.icon active={activeTab === tab.key} />
              {tab.label}
              {/* Animated underline */}
              <AnimatePresence>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute left-4 right-4 bottom-0 h-1.5 bg-gradient-to-r from-blue-400 via-blue-700 to-blue-400 rounded-full shadow-lg"
                    initial={{ opacity: 0, scaleX: 0.5 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        {/* Animated Page Content */}
        <div className="relative min-h-[400px] sm:min-h-[600px] px-2 sm:px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full"
            >
              {activeTab === "analyzer" && <Analyzer />}
              {activeTab === "medications" && <MedicationManager />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {/* Soft floating glow effect */}
      <div className="fixed -z-10 top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-900 opacity-30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-700 opacity-20 rounded-full blur-2xl" />
        <div className="absolute top-10 left-10 w-[180px] h-[180px] bg-blue-400 opacity-10 rounded-full blur-2xl" />
      </div>
    </div>
  );
}