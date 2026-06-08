import React from "react";
import { STRINGS } from "../../../consts/text-strings";

const moods = ["peaceful", "nostalgic", "happy", "dreamy"];

export default function MoodStage({ onSelect }) {
  return (
    <>
      <h1>{STRINGS.DESCRIBE_FEELING}</h1>

      <div>
        {moods.map((m) => (
          <button key={m} onClick={() => onSelect(m)}>
            {m}
          </button>
        ))}
      </div>
    </>
  );
}
