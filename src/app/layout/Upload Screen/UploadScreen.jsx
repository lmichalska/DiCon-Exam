import React, { useState } from "react";
import { imageFileToNotes } from "../../functions/utils";
import GeneratingStage from "./stages/GeneratingStage";
import IntroStage from "./stages/IntroStage";
import MoodStage from "./stages/MoodStage";
import UploadStage from "./stages/UploadStage";
import ProceedStage from "./stages/ProceedStage";

export default function UploadScreen({ onMelodyGenerated }) {
  const [stage, setStage] = useState("intro");

  const [file, setFile] = useState(null);
  const [mood, setMood] = useState(null);
  const [notes, setNotes] = useState(null);

  async function generate() {
    setStage("generating");

    const result = await imageFileToNotes(file, 64);

    setNotes(result.notes);
    setMood(result.mood);

    setTimeout(() => {
      setStage("proceed");
    }, 2000);
  }

  return (
    <div className="screen">
      {stage === "intro" && <IntroStage next={() => setStage("upload")} />}

      {stage === "upload" && (
        <UploadStage
          file={file}
          onUpload={(img) => {
            setFile(img);
            setStage("mood");
          }}
        />
      )}

      {stage === "mood" && (
        <MoodStage
          onSelect={(choice) => {
            setMood(choice);
            generate();
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
