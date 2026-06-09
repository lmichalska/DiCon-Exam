import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import { GlassCard } from "../../../components/LiquidGlassWrapper";

export default function GeneratingStage() {
  return (
    <GlassCard>
      <h1>{STRINGS.WAITING_TEXT}</h1>
      <div className="loader" />
    </GlassCard>
  );
}
