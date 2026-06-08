import React, { useCallback } from "react";
import { NOTES, WHITE_KEY_W } from "../consts/constants";

export default function PianoKey({ noteData, isNext, isActive, keyLabel, onPlay }) {
  const handleDown = useCallback(() => onPlay(noteData), [noteData, onPlay]);

  if (noteData.white) {
    return (
      <button
        onMouseDown={handleDown}
        onTouchStart={(e) => {
          e.preventDefault();
          handleDown();
        }}
        style={{
          position: "relative",
          width: WHITE_KEY_W - 1,
          height: 140,
          background: isActive ? "#cba8f0" : isNext ? "#b48de0" : "#eeebe6",
          border: "1px solid #4a4a4a",
          borderBottom: isNext ? "3px solid #9b7fd4" : "2px solid #2a2a2a",
          borderRadius: "0 0 6px 6px",
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.06s",
          boxShadow: isActive
            ? "inset 0 3px 9px rgba(0,0,0,0.4)"
            : isNext
            ? "0 5px 18px rgba(168,127,212,0.75)"
            : "inset 0 -4px 5px rgba(0,0,0,0.1), 1px 2px 5px rgba(0,0,0,0.22)",
          outline: "none",
          zIndex: 1,
          animation: isNext ? "pulseWhite 0.8s ease-in-out infinite alternate" : "none",
        }}
        aria-label={noteData.note}
      >
        {isNext && (
          <div
            style={{
              position: "absolute",
              bottom: 18,
              left: "50%",
              transform: "translateX(-50%)",
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#9b7fd4",
            }}
          />
        )}
        {keyLabel && (
          <span
            style={{
              position: "absolute",
              bottom: 5,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 8,
              color: isNext ? "#7a3faa" : "#999",
              fontFamily: "monospace",
              pointerEvents: "none",
              userSelect: "none",
              fontWeight: isNext ? 800 : 500,
            }}
          >
            {keyLabel}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onMouseDown={handleDown}
      onTouchStart={(e) => {
        e.preventDefault();
        handleDown();
      }}
      style={{
        position: "absolute",
        width: 21,
        height: 84,
        background: isActive ? "#a06fd8" : isNext ? "#7a3fb8" : "#181818",
        border: "1px solid #000",
        borderBottom: isNext ? "3px solid #c8a8e8" : "2px solid #000",
        borderRadius: "0 0 4px 4px",
        cursor: "pointer",
        zIndex: 2,
        transition: "background 0.06s",
        boxShadow: isActive
          ? "inset 0 2px 7px rgba(0,0,0,0.55)"
          : isNext
          ? "0 4px 18px rgba(168,127,212,0.8)"
          : "1px 4px 6px rgba(0,0,0,0.65)",
        outline: "none",
        animation: isNext ? "pulseBlack 0.8s ease-in-out infinite alternate" : "none",
      }}
      aria-label={noteData.note}
    >
      {keyLabel && (
        <span
          style={{
            position: "absolute",
            bottom: 5,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 7,
            color: isNext ? "#e0c8f8" : "#555",
            fontFamily: "monospace",
            pointerEvents: "none",
            userSelect: "none",
            fontWeight: isNext ? 800 : 500,
          }}
        >
          {keyLabel}
        </span>
      )}
    </button>
  );
}
