import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import { MOODS } from "../../../consts/constants";
import { GlassButton, GlassCard } from "../../../components/LiquidGlassWrapper";


export default function MoodStage({ onSelect }) {
  return (
    <>
      <h1 style={{maxWidth: "600px", textAlign: "center"}}>{STRINGS.DESCRIBE_FEELING}</h1>
    <GlassCard className="mood-card">

      <div className="mood-list">
        {MOODS.map((m) => (
      <GlassButton key={m} onClick={() => onSelect(m)}>{m}</GlassButton>
        ))}
      </div>
    </ GlassCard>
    <GlassButton className="hero-button" onClick={onSelect}>
              {STRINGS.CONTINUE}
            </GlassButton>
    
    </>
  );
}
