import React from "react";
import { STRINGS } from "../../../consts/text-strings";

export default function ProceedStage({ image, mood, onProceed }) {
    console.log(image, mood, onProceed)
  return (
    <div className="card">
      <img
        src={URL.createObjectURL(image)}
        style={{
          width: 200,
          borderRadius: 15,
        }}
      />

      <h2>{STRINGS.MEMORY_IS_READY}</h2>
      <button onClick={onProceed}>{STRINGS.PLAY_MELODY}</button>
    </div>
  );
}
