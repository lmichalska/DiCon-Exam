import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import { GlassButton, GlassCard } from "../../../components/LiquidGlassWrapper";

export default function IntroStage({ next }) {
  return (
    <GlassCard>
      <h1 className="title">
        {STRINGS.TITLE}
        <br />
        {STRINGS.SUB_TITLE}
      </h1>

      <p>{STRINGS.DESCRIPTION}</p>
      <GlassButton onClick={next}>{STRINGS.START}</GlassButton>
    </GlassCard>
  );
}
