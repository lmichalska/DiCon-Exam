import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import { GlassCard } from "../../../components/LiquidGlassWrapper";

export default function ProceedStage({ image, mood, onProceed }) {
  return (
    <GlassCard>
      <img
        src={URL.createObjectURL(image)}
        style={{
          width: 200,
          borderRadius: 15,
        }}
      />

      <h2>{STRINGS.MEMORY_IS_READY}</h2>
      <button onClick={onProceed}>{STRINGS.PLAY_MELODY}</button>
    </GlassCard>
  );
}
