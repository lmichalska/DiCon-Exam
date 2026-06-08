import React from "react";
import { NOTES } from "../consts/constants";

export default function MelodyBar({ melody, currentStep }) {
  if (!melody) return null;
  return (
    <div style={{ display: "flex", gap: 1.5, height: 48, alignItems: "flex-end" }}>
      {melody.map((note, i) => {
        const h = Math.max(
          12,
          ((NOTES.findIndex((n) => n.note === note.note) || 0) / (NOTES.length - 1)) * 100
        );
        const isPast = i < currentStep;
        const isNow = i === currentStep;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              background: isNow ? "#e8d5f5" : isPast ? "rgba(122,79,176,0.25)" : note.color,
              borderRadius: "2px 2px 0 0",
              opacity: isPast ? 0.28 : isNow ? 1 : 0.72,
              boxShadow: isNow ? "0 0 8px #c8a8e8" : "none",
              transition: "opacity 0.08s, background 0.08s",
              border: !isPast ? "1px solid #c8a8e8" : "none",
            }}
          />
        );
      })}
    </div>
  );
}
