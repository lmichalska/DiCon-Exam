import React, { useState } from "react";
import { imageFileToNotes } from "../../utils/functions";

import GeneratingStage from "./stages/GeneratingStage";
import IntroStage from "./stages/IntroStage";
import MoodStage from "./stages/MoodStage";
import UploadStage from "./stages/UploadStage";
import ProceedStage from "./stages/ProceedStage";
import { Particles } from "../../components/Particles";

export default function UploadScreen({ onMelodyGenerated, setImg }) {
  const [stage, setStage] = useState("intro");

  const [file, setFile] = useState(null);
  const [mood, setMood] = useState("peaceful");
  const [notes, setNotes] = useState(null);

  async function generate(selectedMood = mood) {
    setStage("generating");

    const result = await imageFileToNotes(file, 64, selectedMood);

    setNotes(result.notes);
    setMood(result.mood);

    setTimeout(() => {
      setStage("proceed");
    }, 2000);
  }

  return (
    <div className="screen">
      <Particles />
      {stage === "intro" && (
        <IntroStage next={() => setStage("upload")} />
      )}

      {stage === "upload" && (
        <UploadStage
          file={file}
          onUpload={(img) => {
            setFile(img);
            setImg(img);
            setStage("mood");
          }}
        />
      )}

      {stage === "mood" && (
        <MoodStage
          onSelect={(choice) => {
            setMood(choice);
            generate(choice);
          }}
        />
      )}

      {stage === "generating" && <GeneratingStage />}

      {stage === "proceed" && (
        <ProceedStage
          image={file}
          mood={mood}
          onProceed={() => {
            onMelodyGenerated(notes, mood);
          }}
        />
      )}
    </div>
  );
}