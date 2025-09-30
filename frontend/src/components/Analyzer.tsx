import { useState, useEffect, useRef } from 'react';
import Webcam from "react-webcam";
import { getMedications } from '../lib/medicationStore';
import type { Medication } from '../lib/medicationStore';
import ShimmerText from './kokonutui/shimmer-text';
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

    // Speak the analysis result when it's available
    useEffect(() => {
      if (analysisResult) {
        const textToSpeak = `
          Analysis Summary: ${analysisResult.summary}. 
          Recommendations: ${analysisResult.recommendations.join(", ")}
        `;
        speakText(textToSpeak);
      }
    }, [analysisResult]);

    const speakText = async (text: string) => {
      try {
        const apiUrl = import.meta.env.VITE_SPEAKER_API_URL;
        if (!apiUrl) {
          throw new Error("Speaker API URL is not configured. Make sure VITE_SPEAKER_API_URL is set in your .env file.");
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch audio.');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();

      } catch (error) {
        console.error("Error speaking text:", error);
        alert("There was an error with the text-to-speech service.");
      }
    };


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
      <div className="max-w-lg rounded-xl overflow-hidden mx-auto">

            {/* camera */}
            <div
              onTouchEnd={handleTouch}
              onDoubleClick={handleDoubleTap}
              className="flex flex-col items-center"
            >
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-lg"

              />
              <p className="text-xs mt-2 text-gray-600">
                Double-tap or double-click to capture image for analysis
              </p>
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Captured"
                  className="mt-2 rounded-lg border border-blue-300"
                  width={160}
                />
              )}
            </div>
            
        {isProcessing && (
            <div className="bg-gray-400 p-4 border-b-4 border-gray-950">
                <div className="flex items-center gap-3">
                  <ShimmerText text="Analyzing..." className="font-mono text-sm" />
                </div>
            </div>
        )}

        {analysisResult && (
          <div className="bg-gray-400 p-4">
            <div className="bg-gray-200 rounded-lg p-5 mx-auto">
              <h3 className="text-lg font-bold mb-2">Analysis Result</h3>
              <p className="font-semibold">Summary:</p>
              <p className="mb-4">{analysisResult.summary}</p>
              <p className="font-semibold">Recommendations:</p>
              <ul className="list-disc list-inside">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!isProcessing && !analysisResult && (
            <div className="bg-gray-400 p-4 border-b-4 border-gray-950">
              <p className="flex items-center gap-3">
                details:
              </p>
            </div>
        )}

        <div className="bg-gray-400 p-4">
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg bg-gray-200 rounded-lg p-5 mx-auto">
            <div>
                <h3 className="text-lg font-bold mb-2">Your Medications</h3>
                {medications.length > 0 ? (
                    <ul>
                        {medications.map(med => (
                            <li key={med.id}>{med.name} - {med.dosage}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No medications found.</p>
                )}
            </div>
          </div>
        </div>
      </div>
  )
}

export default Analyzer;