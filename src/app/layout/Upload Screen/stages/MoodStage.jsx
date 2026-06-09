import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import { MOODS } from "../../../consts/constants";
import { GlassButton, GlassCard } from "../../../components/LiquidGlassWrapper";

export default function MoodStage({ onSelect }) {
  return (
    <GlassCard className="max-w-[400px]">
      <h1>{STRINGS.DESCRIBE_FEELING}</h1>

      <div className="flex gap-[1rem] flex-wrap">
        {MOODS.map((m) => (
      <GlassButton key={m} onClick={() => onSelect(m)}>{m}</GlassButton>
        ))}
      </div>
    </ GlassCard>
  );
}
