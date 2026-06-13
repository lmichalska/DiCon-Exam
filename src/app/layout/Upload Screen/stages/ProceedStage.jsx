import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import { GlassButton, GlassCard } from "../../../components/LiquidGlassWrapper";


export default function ProceedStage({ image, mood, onProceed }) {
  return (
    <>
      <img
        src={URL.createObjectURL(image)}
        style={{
          width: 200,
          borderRadius: "100%",
        }}
      />

      <h2>{STRINGS.MEMORY_IS_READY}</h2>
      <GlassButton onClick={onProceed}>{STRINGS.PLAY_MELODY}</GlassButton>
      
    </>
  );
}
