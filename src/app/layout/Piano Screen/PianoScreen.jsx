import React, { useState, useRef, useCallback, useEffect } from "react";
import { BASE_OCTAVE, TEMPO_MIN, TEMPO_MAX } from "../../consts/constants";
import { createPianoTone, createMetronomeTick, buildMaps } from "../../utils/functions";
import Piano from "../../components/Piano";
import NoteQueue from "../../components/NoteQueue";
import MelodyBar from "../../components/MelodyBar";
import MetronomeDots from "../../components/MetronomeDots";
import KeyboardLegend from "../../components/KeyboardLegend";

export default function PianoScreen({
  melody,
  imageMood,
  tempo,
  setTempo,
  audioCtxRef,
  onBack,
}) {
  console.log(melody,
    imageMood,
    tempo,
    setTempo,
    audioCtxRef,
    onBack)
  const [mode, setMode] = useState("autoplay");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [beat, setBeat] = useState(0);
  const [practiceScore, setPracticeScore] = useState({ hit: 0, total: 0 });
  const [octaveOffset, setOctaveOffset] = useState(imageMood?.suggestedOctave || BASE_OCTAVE);
  const [showLegend, setShowLegend] = useState(true);
  const [metroMuted, setMetroMuted] = useState(false);

  const metroMutedRef = useRef(false);
  const timerRef = useRef(null);
  const stepRef = useRef(-1);
  const beatRef = useRef(0);
  const practiceStepRef = useRef(0);
  const heldKeys = useRef(new Set());

  useEffect(() => {
    metroMutedRef.current = metroMuted;
  }, [metroMuted]);

  function stopAll() {
    clearTimeout(timerRef.current);
    setIsRunning(false);
    setCurrentStep(-1);
    stepRef.current = -1;
  }

  const startAutoplay = useCallback(() => {
    if (!melody) return;
    const ctx = audioCtxRef.current;
    if (!ctx) {
      return;
    }
    setIsRunning(true);
    setPracticeScore({ hit: 0, total: 0 });
    stepRef.current = 0;
    beatRef.current = 0;
    setCurrentStep(0);
    setBeat(0);
    const beatMs = (60 / tempo) * 1000;
    function tick() {
      const step = stepRef.current;
      if (step >= melody.length) {
        setIsRunning(false);
        setCurrentStep(-1);
        stepRef.current = -1;
        return;
      }
      setCurrentStep(step);
      createPianoTone(ctx, melody[step].freq, 0.45);
      beatRef.current += 1;
      setBeat(beatRef.current);
      stepRef.current = step + 1;
      timerRef.current = setTimeout(tick, beatMs);
    }
    tick();
  }, [melody, tempo, audioCtxRef]);

  const startPractice = useCallback(() => {
    if (!melody) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    setIsRunning(true);
    setPracticeScore({ hit: 0, total: 0 });
    practiceStepRef.current = 0;
    beatRef.current = 0;
    setCurrentStep(0);
    setBeat(0);
    const beatMs = (60 / tempo) * 1000;
    function metroTick() {
      if (practiceStepRef.current >= melody.length) {
        setIsRunning(false);
        setCurrentStep(-1);
        return;
      }
      if (!metroMutedRef.current) createMetronomeTick(ctx);
      beatRef.current += 1;
      setBeat(beatRef.current);
      timerRef.current = setTimeout(metroTick, beatMs);
    }
    metroTick();
  }, [melody, tempo, audioCtxRef]);

  const handleNotePressed = useCallback(
    (noteName) => {
      if (mode !== "practice" || !isRunning || !melody) return;
      const step = practiceStepRef.current;
      if (step >= melody.length) return;
      const correct = noteName === melody[step].note;
      setPracticeScore((s) => ({ hit: s.hit + (correct ? 1 : 0), total: s.total + 1 }));
      if (correct) {
        practiceStepRef.current = step + 1;
        const next = step + 1;
        setCurrentStep(next >= melody.length ? -1 : next);
        if (next >= melody.length) {
          clearTimeout(timerRef.current);
          setIsRunning(false);
        }
      }
    },
    [mode, isRunning, melody]
  );

  const handleStart = useCallback(() => {
    if (isRunning) {
      stopAll();
      return;
    }
    mode === "autoplay" ? startAutoplay() : startPractice();
  }, [isRunning, mode, startAutoplay, startPractice]);

  // Keyboard events
  useEffect(() => {
    const { keyToNote } = buildMaps(octaveOffset);

    function onKeyDown(e) {
      if (e.repeat) return;
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const key = e.key.toLowerCase();

      // Octave shift
      if (key === "arrowup" || key === "+") {
        e.preventDefault();
        setOctaveOffset((o) => Math.min(4, o + 1));
        return;
      }
      if (key === "arrowdown" || key === "-") {
        e.preventDefault();
        setOctaveOffset((o) => Math.max(1, o - 1));
        return;
      }

      // Space = play/stop
      if (key === " ") {
        e.preventDefault();
        handleStart();
        return;
      }
      // M = mute/unmute metronome
      if (key === "m") {
        setMetroMuted((v) => !v);
        return;
      }

      if (heldKeys.current.has(key)) return;
      heldKeys.current.add(key);

      const noteIdx = keyToNote[key];
      if (noteIdx === undefined) return;

      const ctx = audioCtxRef.current;
      if (ctx) {
        const NOTES = require("../../consts/constants").NOTES;
        const noteData = NOTES[noteIdx];
        if (noteData) {
          createPianoTone(ctx, noteData.freq);
          handleNotePressed(noteData.note);
        }
      }
    }

    function onKeyUp(e) {
      heldKeys.current.delete(e.key.toLowerCase());
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [octaveOffset, handleStart, handleNotePressed, audioCtxRef]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const progress = melody && currentStep >= 0 ? Math.round((currentStep / melody.length) * 100) : 0;
  const accuracy =
    practiceScore.total > 0 ? Math.round((practiceScore.hit / practiceScore.total) * 100) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "white",
        color: "#e8e0f0",
        fontFamily: "'Georgia', serif",
        padding: "24px 18px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Melody UI */}
        <div style={{ marginBottom: 12 }}>
          <MelodyBar melody={melody} currentStep={currentStep} />
        </div>

        {/* Progress */}
        <div
          style={{
            height: 3,
            background: "#12122a",
            borderRadius: 2,
            marginBottom: 18,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg,#7a4fb0,#c8a8e8)",
              transition: "width 0.1s",
            }}
          />
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          {/* Mode tabs */}
          <div
            style={{
              display: "flex",
              background: "#10102a",
              borderRadius: 8,
              border: "1px solid #2a1a4e",
              overflow: "hidden",
            }}
          >
            {["autoplay", "practice"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  stopAll();
                  setMode(m);
                }}
                style={{
                  padding: "7px 15px",
                  fontSize: 11,
                  background: mode === m ? "#7a4fb0" : "transparent",
                  color: mode === m ? "#fff" : "#6a5a7a",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {m === "autoplay" ? "▶ auto-play" : "♩ practice"}
              </button>
            ))}
          </div>

          {/* Play/Stop */}
          <button
            onClick={handleStart}
            style={{
              background: isRunning ? "rgba(168,127,212,0.1)" : "#7a4fb0",
              color: isRunning ? "#c8a8e8" : "#fff",
              border: isRunning ? "1px solid #5a3a90" : "none",
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: 12,
              cursor: "pointer",
              letterSpacing: "0.07em",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {isRunning ? "■  stop" : mode === "autoplay" ? "▶  play" : "♩  start"}
          </button>

          {isRunning && <MetronomeDots beat={beat} />}

          {/* Mute metronome — only in practice mode */}
          {mode === "practice" && (
            <button
              onClick={() => setMetroMuted((m) => !m)}
              title="M to toggle"
              style={{
                background: metroMuted ? "#1e1432" : "rgba(168,127,212,0.15)",
                border: `1px solid ${metroMuted ? "#2a1a4e" : "#7a4fb0"}`,
                color: metroMuted ? "#3a2a5a" : "#c8a8e8",
                borderRadius: 7,
                padding: "6px 12px",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.06em",
                transition: "all 0.15s",
              }}
            >
              {metroMuted ? "🔇 muted" : "🔔 metro"}
            </button>
          )}

          {/* Tempo */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 120 }}>
            <span style={{ fontSize: 10, color: "#5a4a6a", whiteSpace: "nowrap" }}>bpm</span>
            <input
              type="range"
              min={TEMPO_MIN}
              max={TEMPO_MAX}
              step={1}
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#7a4fb0" }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#a87fd4",
                minWidth: 26,
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {tempo}
            </span>
          </div>

          {/* Back button */}
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: "1px solid #1e1432",
              color: "#4a3a5a",
              borderRadius: 7,
              padding: "6px 12px",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ← back
          </button>

          {mode === "practice" && accuracy !== null && (
            <div
              style={{
                fontSize: 11,
                color: accuracy >= 80 ? "#7ed4a0" : "#d47e7e",
                letterSpacing: "0.06em",
              }}
            >
              {accuracy}% · {practiceScore.hit}/{practiceScore.total}
            </div>
          )}
        </div>

        {/* Note queue */}
        <div
          style={{
            background: "rgb(226, 226, 226)",
            borderRadius: 10,
            padding: "10px 14px",
            border: "1px solid #181830",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "#2e2040",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {mode === "practice" ? "play this next →" : "coming up →"}
          </div>
          <NoteQueue melody={melody} currentStep={currentStep} mode={mode} />
        </div>

        {/* Piano + keyboard legend */}
        <div
          style={{
            background: "rgb(226, 226, 226)",
            borderRadius: 12,
            padding: "14px 12px 10px",
            border: "1px solid #181830",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#2e2040",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {mode === "practice" ? "🎹 press the glowing key" : "🎹 follow along or play freely"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Octave controls */}
              <span style={{ fontSize: 9, color: "#3a2a4e" }}>octave</span>
              <button
                onClick={() => setOctaveOffset((o) => Math.max(1, o - 1))}
                style={{
                  background: "#12122a",
                  border: "1px solid #2a1a4e",
                  color: "#7a6a9a",
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                −
              </button>
              <span
                style={{
                  fontSize: 12,
                  color: "#c8a8e8",
                  minWidth: 16,
                  textAlign: "center",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {octaveOffset}
              </span>
              <button
                onClick={() => setOctaveOffset((o) => Math.min(4, o + 1))}
                style={{
                  background: "#12122a",
                  border: "1px solid #2a1a4e",
                  color: "#7a6a9a",
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
              <button
                onClick={() => setShowLegend((v) => !v)}
                style={{
                  background: "transparent",
                  border: "1px solid #1e1432",
                  color: "#3a2a4e",
                  borderRadius: 5,
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontSize: 9,
                  fontFamily: "inherit",
                  letterSpacing: "0.05em",
                }}
              >
                {showLegend ? "hide keys" : "show keys"}
              </button>
            </div>
          </div>
          <Piano
            melody={melody}
            currentStep={currentStep}
            onNotePressed={handleNotePressed}
            audioCtxRef={audioCtxRef}
            octaveOffset={octaveOffset}
          />
        </div>

        {showLegend && <KeyboardLegend octaveOffset={octaveOffset} />}

      </div>
    </div>
  );
}
