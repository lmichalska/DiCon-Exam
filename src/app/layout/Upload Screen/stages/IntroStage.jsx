import React from "react";

export default function IntroStage({ next }) {
  return (
    <>
      <h1 className="title">
        Your memory,
        <br />
        your melody
      </h1>

      <p>Let's turn a moment into sound.</p>

      <button onClick={next}>Begin</button>
    </>
  );
}
