import React from "react";
import { KEY_LAYOUT } from "../consts/constants";

export default function KeyboardLegend({ octaveOffset }) {
  const Kbd = ({ k }) => (
    <div
      style={{
        width: k ? 24 : 24,
        height: 22,
        borderRadius: 4,
        background: k ? "#1a1030" : "transparent",
        border: k ? "1px solid #3a2a5e" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        color: k ? "#b09ac8" : "transparent",
        fontFamily: "monospace",
        fontWeight: 700,
      }}
    >
      {k || " "}
    </div>
  );
  const rows = KEY_LAYOUT.map(({ whites, blacks }, o) => ({
    oct: octaveOffset + o,
    blacks: blacks.map((k) => k.toUpperCase()),
    whites: whites.map((k) => k.toUpperCase()),
  }));
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "rgb(226, 226, 226)",
        borderRadius: 8,
        border: "1px solid #1a1a30",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: "#3a2a4e",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        keyboard mapping · octave {octaveOffset}–{octaveOffset + 2} · ↑↓ arrows to shift
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {rows.map(({ oct, whites, blacks }) => (
          <div key={oct} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 9, color: "#4a3a6a", marginBottom: 2 }}>oct {oct}</div>
            <div style={{ display: "flex", gap: 3 }}>
              {blacks.map((k, i) => (
                <Kbd key={i} k={k} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {whites.map((k, i) => (
                <Kbd key={i} k={k} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 9,
          color: "#2a1a3e",
          marginTop: 10,
          lineHeight: 1.8,
        }}
      >
        space = play/stop · M = mute metronome · ↑↓ = octave shift
      </div>
    </div>
  );
}
