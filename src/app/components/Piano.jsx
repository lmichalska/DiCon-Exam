import React, { useState, useCallback } from "react";
import { NOTES, BASE_OCTAVE, WHITE_KEY_W } from "../consts/constants";
import { buildMaps, getVisibleNotes, blackKeyLeft, createPianoTone } from "../utils/functions";
import PianoKey from "./PianoKey";

export default function Piano({ melody, currentStep, onNotePressed, audioCtxRef, octaveOffset }) {
  const [pressedNotes, setPressedNotes] = useState(new Set());
  const nextNote =
    melody && currentStep >= 0 && currentStep < melody.length ? melody[currentStep] : null;
  const { noteToKey } = buildMaps(octaveOffset);
  const visibleNotes = getVisibleNotes(octaveOffset);
  const visibleWhite = visibleNotes.filter((n) => n.white);
  const visibleBlack = visibleNotes.filter((n) => !n.white);

  const playNote = useCallback(
    (noteData) => {
      const ctx = audioCtxRef.current;
      if (ctx) {
        if (ctx.state === "suspended") ctx.resume();
        createPianoTone(ctx, noteData.freq);
      }
      setPressedNotes((prev) => new Set([...prev, noteData.note]));
      setTimeout(
        () =>
          setPressedNotes((prev) => {
            const n = new Set(prev);
            n.delete(noteData.note);
            return n;
          }),
        300
      );
      onNotePressed?.(noteData.note);
    },
    [audioCtxRef, onNotePressed]
  );

  return (
    <div style={{ paddingBottom: 12 }}>
      <style>{`
        @keyframes pulseWhite { from { box-shadow: 0 4px 12px rgba(168,127,212,0.5); } to { box-shadow: 0 5px 24px rgba(168,127,212,0.9); } }
        @keyframes pulseBlack { from { box-shadow: 0 3px 10px rgba(168,127,212,0.5); } to { box-shadow: 0 4px 20px rgba(168,127,212,1.0); } }
      `}</style>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          gap: 1,
          height: 162,
          width: visibleWhite.length * WHITE_KEY_W + 16,
          maxWidth: "100%",
          background: "gray",
          borderRadius: 6,
          padding: "14px 8px 0",
          boxSizing: "border-box",
        }}
      >
        {visibleWhite.map((n) => (
          <PianoKey
            key={n.note}
            noteData={n}
            isNext={!!(nextNote && nextNote.note === n.note)}
            isActive={pressedNotes.has(n.note)}
            keyLabel={noteToKey[n.note]}
            onPlay={playNote}
          />
        ))}
        {visibleBlack.map((n) => (
          <div key={n.note} style={{ position: "absolute", top: 14, left: blackKeyLeft(n.note, visibleWhite) }}>
            <PianoKey
              noteData={n}
              isNext={!!(nextNote && nextNote.note === n.note)}
              isActive={pressedNotes.has(n.note)}
              keyLabel={noteToKey[n.note]}
              onPlay={playNote}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
