import React from "react";
import { STRINGS } from "../../../consts/text-strings";

export default function IntroStage({ next }) {
  return (
    <>
      <h1 className="title">
        {STRINGS.TITLE}
        <br />
        {STRINGS.SUB_TITLE}
      </h1>

      <p>{STRINGS.DESCRIPTION}</p>
      <button onClick={next}>{STRINGS.START}</button>
    </>
  );
}
