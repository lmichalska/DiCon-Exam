import React from "react";

export default function NoteQueue({ melody, currentStep, mode }) {
  if (!melody) return null;
  const slice = melody.slice(Math.max(0, currentStep), Math.max(0, currentStep) + 10);
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", height: 56, overflow: "hidden" }}>
      { slice.map((note, i) => {
          const isNext = i === 0;
          return (
            <div
              key={currentStep + i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                opacity: Math.max(0.15, 1 - i * 0.09),
                transform: `scale(${isNext ? 1.18 : Math.max(0.7, 1 - i * 0.04)})`,
                transformOrigin: "bottom center",
                transition: "all 0.12s",
              }}
            >
              <div
                style={{
                  width: isNext ? 30 : 22,
                  height: isNext ? 30 : 22,
                  borderRadius: "50%",
                  background: note.color,
                  border: isNext ? "2px solid #e8d5f5" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: isNext ? `0 0 14px ${note.color}` : "none",
                  transition: "all 0.12s",
                }}
              />
              <span
                style={{
                  fontSize: isNext ? 10 : 8,
                  color: isNext ? "#e8d5f5" : "#4a3a6a",
                  fontFamily: "monospace",
                  fontWeight: isNext ? 700 : 400,
                }}
              >
                {note.note}
              </span>
            </div>
          );
        })
      }
    </div>
  );
}
