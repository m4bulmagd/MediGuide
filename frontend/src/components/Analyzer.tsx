import { useState, useEffect, useRef } from 'react';
import Webcam from "react-webcam";


const Analyzer = () => {
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [lastTap, setLastTap] = useState<number>(0);

    // Double-tap handler
    const handleDoubleTap = () => {
      if (webcamRef.current) {
        // @ts-ignore
        const image = webcamRef.current.getScreenshot();
        setImageSrc(image);
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
    <div className="mt-12 px-4">

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
                Double-tap or double-click to capture image
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
            


        <div className="bg-gray-400 p-4 border-b-4 border-gray-950">
          <p className="flex items-center gap-3">
            details:
          </p>
        </div>

        <div className="bg-gray-400 p-4">
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg bg-gray-200 rounded-lg p-5 mx-auto">
            <form>
              <div>
                <label className="block text-gray-500 text-[.6rem] uppercase font-bold mb-1">some text</label>
              </div>
            </form>
            <p>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analyzer;