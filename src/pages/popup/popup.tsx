import { createRoot } from "react-dom/client";
import "@pages/popup/popup.css";
import "@assets/styles/tailwind.css";
import { useState, useEffect } from "react";

function updateSegmentStyling(styling: number) {
  chrome.storage.sync.set({ segmentStyling: styling });
}

function App() {
  const [segmentStyling, setSegmentStyling] = useState(0);

  useEffect(() => {
    chrome.storage.sync.get("segmentStyling", (result) => {
      setSegmentStyling(result.segmentStyling || 0);
    });
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-max p-3 text-white m-2 font-sans flex flex-col justify-center items-center gap-4">
      <div
        className="rounded-md p-2"
        style={{
          background: "linear-gradient(90deg, #69b7eb, #b3dbd3, #f4d6db)",
        }}
      >
        <h1 className="text-white font-[Socake] text-2xl">
          Langpal话朋 Subtitles
        </h1>
      </div>
      <div className="flex flex-col gap-2 bg-white p-2 rounded-md text-black w-full">
        <div className="w-full flex justify-start">
          <h2 className="text-base font-[Socake]">Options</h2>
        </div>
        <hr className="w-full border-black border-[0.5px]" />
        <div className="flex flex-col gap-2 items-center">
          <p className="text-base font-[Socake]">
            Segment Styling <br /> (refresh page to apply)
          </p>
          <select
            value={segmentStyling}
            className="text-lg font-[Socake] bg-white text-black p-2 rounded-md border-black border-[1px] w-auto"
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setSegmentStyling(value);
              updateSegmentStyling(value);
            }}
          >
            <option value="0">Default</option>
            <option value="1">Inverted</option>
            <option value="2">Mahjong</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-lg font-[Socake]">For more information visit:</p>
        <a
          className="underline font-[Socake] text-lg bg-white text-black p-2 rounded-md my-1"
          href="https://langpal.com.hk/welcome"
          target="_blank"
          rel="noreferrer"
        >
          langpal.com.hk/welcome
        </a>
      </div>
    </div>
  );
}

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  root.render(<App />);
}

init();
