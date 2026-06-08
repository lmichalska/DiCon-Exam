import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import { MOODS } from "../../../consts/constants";

export default function MoodStage({ onSelect }) {
  return (
    <>
      <h1>{STRINGS.DESCRIBE_FEELING}</h1>

      <div>
        {MOODS.map((m) => (
          <button key={m} onClick={() => onSelect(m)}>
            {m}
          </button>
        ))}
      </div>
    </>
  );
}
