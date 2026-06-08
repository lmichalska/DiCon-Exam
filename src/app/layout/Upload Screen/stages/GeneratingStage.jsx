import React from "react";
import { STRINGS } from "../../../consts/text-strings";

export default function GeneratingStage() {
  return (
    <div>
      <h1>{STRINGS.WAITING_TEXT}</h1>
      <div className="loader" />
    </div>
  );
}
