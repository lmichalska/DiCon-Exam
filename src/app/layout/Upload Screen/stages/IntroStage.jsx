import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import { GlassButton, GlassCard } from "../../../components/LiquidGlassWrapper";

export default function IntroStage({ next }) {
  return (
    <div className="column-gap">
      <h1 className="title">
        {STRINGS.TITLE}
        <br />
        {STRINGS.SUB_TITLE}
      </h1>
      <GlassCard>
        <p>{STRINGS.LEAD_TEXT}</p>

        <p>{STRINGS.DESCRIPTION}</p>
      </GlassCard>

      <GlassButton onClick={next}>{STRINGS.START}</GlassButton>
    </div>
  );
}
