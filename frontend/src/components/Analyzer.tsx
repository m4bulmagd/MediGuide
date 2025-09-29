import { useState, useEffect, useRef } from 'react';
import Webcam from "react-webcam";
import { getMedications } from '../lib/medicationStore';
import type { Medication } from '../lib/medicationStore';

// Define the expected structure of the analysis response from your API
interface AnalysisResult {
  summary: string;
  recommendations: string[];
}

const Analyzer = () => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Load medications from local storage on initial render
  useEffect(() => {
    setMedications(getMedications());
  }, []);

  // Double-tap handler
  const handleDoubleTap = async () => {
    if (webcamRef.current) {
      // @ts-ignore
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);

      if (!image) return;

      setIsProcessing(true);
      setAnalysisResult(null);

      try {
        // Get the API URL from the environment variable
        const apiUrl = import.meta.env.VITE_ANALYZE_API_URL;
        if (!apiUrl) {
          throw new Error("Analyzer API URL is not configured. Make sure VITE_ANALYZE_API_URL is set in your .env file.");
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: image, medications: medications, time: new Date().toLocaleTimeString() }),
        });

        if (!response.ok) {
          throw new Error('Failed to process analysis.');
        }

        const data: AnalysisResult = await response.json();
        setAnalysisResult(data);

      } catch (error) {
        console.error("Error sending image for analysis:", error);
        alert("There was an error analyzing the image. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Touch event handler for double-tap
  const handleTouch = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      handleDoubleTap();
    }
    setLastTap(now);
  };

  return (
    <div className="mt-8 px-2 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto rounded-3xl shadow-2xl bg-gradient-to-br from-blue-950/90 via-blue-900/90 to-gray-900/90 border border-blue-900/40 p-6 sm:p-10 relative">
        {/* Cool instruction box */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-blue-100 font-semibold shadow-lg border border-blue-900/40 text-base">
            <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" />
              <path d="M12 8v4l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Double-tap or double-click to capture image for analysis
          </div>
        </div>

        {/* Camera */}
        <div
          onTouchEnd={handleTouch}
          onDoubleClick={handleDoubleTap}
          className="flex flex-col items-center mt-10"
        >
          <div className="rounded-xl overflow-hidden border-4 border-blue-900/40 shadow-lg bg-black/40">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg w-[320px] h-[240px] sm:w-[400px] sm:h-[300px] object-cover"
            />
          </div>
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Captured"
              className="mt-4 rounded-lg border-2 border-blue-400 shadow"
              width={160}
            />
          )}
        </div>

        {/* Status/Result/Details */}
        <div className="mt-8 space-y-6">
          {isProcessing && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-900/80 to-blue-700/80 border border-blue-600 shadow-lg text-blue-100 font-semibold text-base">
              <svg className="w-6 h-6 animate-spin text-blue-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.2" />
                <path d="M12 2a10 10 0 018.66 5" stroke="currentColor" />
              </svg>
              Analyzing...
            </div>
          )}

          {analysisResult && (
            <div className="px-5 py-4 rounded-2xl bg-gradient-to-br from-blue-900/80 via-blue-950/90 to-gray-900/90 border border-blue-800/60 shadow-lg text-blue-100">
              <h3 className="text-lg font-bold mb-2 text-blue-200">Analysis Result</h3>
              <div className="mb-3">
                <span className="font-semibold text-blue-300">Summary:</span>
                <p className="ml-2">{analysisResult.summary}</p>
              </div>
              <div>
                <span className="font-semibold text-blue-300">Recommendations:</span>
                <ul className="list-disc list-inside ml-4 mt-1">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!isProcessing && !analysisResult && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-900/80 to-blue-700/80 border border-blue-600 shadow-lg text-blue-100 font-semibold text-base">
              <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" />
                <path d="M12 8v4l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Ready for analysis. Capture an image to begin.
            </div>
          )}

          {/* Medications List */}
          <div className="px-5 py-4 rounded-2xl bg-gradient-to-br from-blue-900/70 via-blue-950/80 to-gray-900/80 border border-blue-800/60 shadow text-blue-100">
            <h3 className="text-lg font-bold mb-2 text-blue-200">Your Medications</h3>
            {medications.length > 0 ? (
              <ul className="space-y-1">
                {medications.map(med => (
                  <li key={med.id} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                    <span>{med.name} <span className="text-blue-300">- {med.dosage}</span></span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-blue-300">No medications found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analyzer;