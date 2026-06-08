import React, { useRef, useState } from "react";
import UploadScreen from "./layout/UploadScreen";
import PianoScreen from "./layout/PianoScreen";
import { useAudioContext } from "./hooks/useAudioContext";

export default function App() {
  const [melody, setMelody] = useState(null);
  const [imageMood, setImageMood] = useState(null);
  const [tempo, setTempo] = useState(100);
  const { audioCtxRef } = useAudioContext();

  function handleMelodyGenerated(notes, mood) {
    setMelody(notes);
    setImageMood(mood);
    setTempo(mood.suggestedTempo);
  }

  function handleBack() {
    setMelody(null);
    setImageMood(null);
    setTempo(100);
  }

  return (
    <>
      {!melody ? (
        <UploadScreen onMelodyGenerated={handleMelodyGenerated} />
      ) : (
        <PianoScreen
          melody={melody}
          imageMood={imageMood}
          tempo={tempo}
          setTempo={setTempo}
          audioCtxRef={audioCtxRef}
          onBack={handleBack}
        />
      )}
    </>
  );
}
