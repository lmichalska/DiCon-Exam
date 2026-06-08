import React from "react";

export default function MetronomeDots({ beat }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: beat % 4 === i ? "#c8a8e8" : "#1e1432",
            boxShadow: beat % 4 === i ? "0 0 6px #a87fd4" : "none",
            transition: "background 0.05s",
          }}
        />
      ))}
    </div>
  );
}
