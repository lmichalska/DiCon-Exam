import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import {
  GlassButton,
  GlassCard,
} from "../../../components/LiquidGlassWrapper";

export default function IntroStage({ next }) {
  return (
    <div className="screen">
      <div className="screen-content">
        <h1 className="hero-title">
          {STRINGS.TITLE}
        </h1>

        <div className="hero-subtitle">
          {STRINGS.SUB_TITLE}
        </div>

        <GlassCard className="hero-card">
          <p className="hero-card-title">
            How nice it would be to experience the past once again
          </p>

          <p className="hero-card-text">
            Upload a picture and let us transform your memory into a melody.
          </p>
        </GlassCard>

        <GlassButton
          className="hero-button"
          onClick={next}
        >
          {STRINGS.START}
        </GlassButton>

        <div className="pagination">
          <span className="pagination-dot active" />
          <span className="pagination-dot" />
          <span className="pagination-dot" />
          <span className="pagination-dot" />
        </div>
      </div>
    </div>
  );
}