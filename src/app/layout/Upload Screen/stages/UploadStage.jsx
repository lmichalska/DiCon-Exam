import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import { GlassCard } from "../../../components/LiquidGlassWrapper";

export default function UploadStage({ file, onUpload }) {
  function change(e) {
    const img = e.target.files[0];

    if (img) {
      onUpload(img);
    }
  }

  return (
    <GlassCard>
      <h2>{STRINGS.UPLOAD_SCREEN_TEXT}</h2>

      <input type="file" accept="image/*" onChange={change} />
    </GlassCard>
  );
}
