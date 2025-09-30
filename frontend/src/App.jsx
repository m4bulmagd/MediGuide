import React, { useState } from "react";
import Analyzer from "./components/Analyzer";
import MedicationManager from "./components/MedicationManager";
import SmoothTab from './components/kokonutui/smooth-tab';

export default function App() {
  // const [activeTab, setActiveTab] = useState<"analyzer" | "medications">("analyzer");
  // const [activeTab, setActiveTab] = useState("analyzer");

  return (
    <main className="max-w-lg rounded-xl overflow-hidden mx-auto">
      {/* <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        <button
          onClick={() => setActiveTab("analyzer")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "analyzer" ? "2px solid #0070f3" : "none",
            background: "none",
            cursor: "pointer",
            fontWeight: activeTab === "analyzer" ? "bold" : "normal"
          }}
        >
          Analyzer
        </button>
        <button
          onClick={() => setActiveTab("medications")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "medications" ? "2px solid #0070f3" : "none",
            background: "none",
            cursor: "pointer",
            fontWeight: activeTab === "medications" ? "bold" : "normal"
          }}
        >
          Medications
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        {activeTab === "analyzer" && <Analyzer />}
        {activeTab === "medications" && <MedicationManager />}
      </div> */}

      <SmoothTab className='h-full'
      items={[
        { id: 'analyzer', title: 'Analyzer', cardContent:(<Analyzer />) },
        { id: 'medications', title: 'Medications', cardContent:(<MedicationManager />) },
      ]} 
      defaultTabId="analyzer" />
    </main>
  );
}