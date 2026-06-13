import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { ChevronLeft, Play, Pause, Bell, BellOff } from "lucide-react";

import { BASE_OCTAVE, NOTES } from "../../consts/constants";
import {
  createPianoTone,
  createMetronomeTick,
  buildMaps,
  getVisibleNotes,
} from "../../utils/functions";
import Piano from "../../components/Piano";
import NoteQueue from "../../components/NoteQueue";
import MetronomeDots from "../../components/MetronomeDots";
import KeyboardLegend from "../../components/KeyboardLegend";
import { STRINGS } from "../../consts/text-strings";
import { GlassButton } from "../../components/LiquidGlassWrapper";

export default function PianoScreen({
  melody,
  imageMood,
  tempo,
  audioCtxRef,
  onBack,
  img,
}) {
  const [mode, setMode] = useState("autoplay");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [beat, setBeat] = useState(0);
  const [practiceScore, setPracticeScore] = useState({ hit: 0, total: 0 });
  const [octaveOffset, setOctaveOffset] = useState(
    imageMood?.suggestedOctave || BASE_OCTAVE
  );
  const [showLegend, setShowLegend] = useState(false);
  const [metroMuted, setMetroMuted] = useState(false);

  const metroMutedRef = useRef(false);
  const timerRef = useRef(null);
  const stepRef = useRef(-1);
  const beatRef = useRef(0);
  const practiceStepRef = useRef(0);
  const heldKeys = useRef(new Set());

  const visibleNotes = useMemo(() => {
    return getVisibleNotes(octaveOffset, 21);
  }, [octaveOffset]);

  const { keyToNote } = useMemo(() => buildMaps(octaveOffset), [octaveOffset]);

  const safeTempo =
    Number.isFinite(tempo) && tempo > 0 ? tempo : 120;

  const beatMs = (60 / safeTempo) * 1000;
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    metroMutedRef.current = metroMuted;
  }, [metroMuted]);

  // ---------------- BG IMAGE ----------------
  const bgUrl = useMemo(() => {
    if (!img) return null;
    return URL.createObjectURL(img);
  }, [img]);

  useEffect(() => {
    return () => {
      if (bgUrl) URL.revokeObjectURL(bgUrl);
    };
  }, [bgUrl]);

  function stopAll() {
    clearTimeout(timerRef.current);
    setIsRunning(false);
    setCurrentStep(-1);
    stepRef.current = -1;
  }

  const startAutoplay = useCallback(() => {
    if (!melody) return;

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    setIsRunning(true);
    setPracticeScore({ hit: 0, total: 0 });

    stepRef.current = 0;
    beatRef.current = 0;

    setCurrentStep(0);
    setBeat(0);

    function tick() {
      const step = stepRef.current;

      if (step >= melody.length) {
        setIsRunning(false);
        setCurrentStep(-1);
        stepRef.current = -1;
        return;
      }

      const note = melody[step];

      const duration =
        Number.isFinite(note.duration) && note.duration > 0
          ? note.duration
          : 1;

      setCurrentStep(step);

      const freq =
        Number.isFinite(note.freq) && note.freq > 0
          ? note.freq
          : null;

      if (freq) {
        createPianoTone(
          ctx,
          freq,
          (beatMs / 1000) * duration,
          0.5,
          note.mood || imageMood?.mood || "peaceful"
        );
      }

      beatRef.current += 1;
      setBeat(beatRef.current);

      stepRef.current++;

      timerRef.current = setTimeout(
        tick,
        Math.round(beatMs * duration)
      );
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

    function metroTick() {
      if (practiceStepRef.current >= melody.length) {
        setIsRunning(false);
        setCurrentStep(-1);
        return;
      }

      if (!metroMutedRef.current) {
        createMetronomeTick(ctx);
      }

      beatRef.current += 1;
      setBeat(beatRef.current);

      timerRef.current = setTimeout(
        metroTick,
        Math.round(beatMs)
      );
    }

    metroTick();
  }, [melody, tempo, audioCtxRef]);

  const handleNotePressed = useCallback(
    (noteName) => {
      if (mode !== "practice" || !isRunning || !melody) return;

      const step = practiceStepRef.current;
      if (step >= melody.length) return;

      const allowedNotes = visibleNotes.map(n => n.note);

      const correct =
        allowedNotes.includes(noteName) &&
        noteName === melody[step].note;
      setPracticeScore((s) => ({
        hit: s.hit + (correct ? 1 : 0),
        total: s.total + 1,
      }));

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
    [mode, isRunning, melody, visibleNotes]
  );

  const handleStart = useCallback(() => {
    if (isRunning) return stopAll();
    mode === "autoplay" ? startAutoplay() : startPractice();
  }, [isRunning, mode, startAutoplay, startPractice]);

  // ---------------- KEYBOARD ----------------
  useEffect(() => {
    function onKeyDown(e) {
      if (e.repeat) return;

      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const key = e.key.toLowerCase();

      if (key === "arrowup" || key === "+") {
        setOctaveOffset((o) => Math.min(4, o + 1));
        return;
      }

      if (key === "arrowdown" || key === "-") {
        setOctaveOffset((o) => Math.max(2, o - 1));
        return;
      }

      if (key === " ") {
        e.preventDefault();
        handleStart();
        return;
      }

      if (key === "m") {
        setMetroMuted((v) => !v);
        return;
      }

      if (heldKeys.current.has(key)) return;
      heldKeys.current.add(key);

      const noteIdx = keyToNote[key];
      if (noteIdx === undefined) return;

      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const noteData = NOTES[noteIdx];

      if (noteData) {
        createPianoTone(ctx, noteData.freq);
        handleNotePressed(noteData.note);
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
  }, [keyToNote, handleStart, handleNotePressed, audioCtxRef]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const accuracy =
    practiceScore.total > 0
      ? Math.round((practiceScore.hit / practiceScore.total) * 100)
      : null;

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        color: "#e8e0f0",
        fontFamily: "'Georgia', serif",
        backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, padding: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <GlassButton onClick={onBack}>
            <ChevronLeft size={16} />
            {STRINGS.BACK}
          </GlassButton>

          <GlassButton onClick={handleStart}>
            {isRunning ? (
              <>
                <Pause size={16} />
                {STRINGS.STOP}
              </>
            ) : (
              <>
                <Play size={16} />
                {STRINGS.PLAY}
              </>
            )}
          </GlassButton>

          {mode === "autoplay" ? (
            <GlassButton onClick={() => setMode("practice")}>
              {STRINGS.AUTOPLAY}
            </GlassButton>
          ) : (
            <GlassButton onClick={() => setMode("autoplay")}>
              {STRINGS.PRACTICE}
            </GlassButton>
          )}

          <GlassButton onClick={() => setMetroMuted((m) => !m)}>
            {metroMuted ? <BellOff size={16} /> : <Bell size={16} />}
          </GlassButton>

          <GlassButton onClick={() => setShowLegend((v) => !v)}>
            {STRINGS.INFO}
          </GlassButton>

          {accuracy !== null && (
            <div>
              {accuracy}% · {practiceScore.hit}/{practiceScore.total}
            </div>
          )}
        </div>

        <div style={{ marginTop: 10 }}>
          <NoteQueue melody={melody} currentStep={currentStep} mode={mode} />
        </div>

        {isRunning && mode !== "autoplay" && <MetronomeDots beat={beat} />}

        {showLegend && (
          <div
            style={{
              position: "absolute",
              top: 60,
              right: 20,
              background: "rgba(10,10,30,0.95)",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #333",
              zIndex: 50,
            }}
          >
            <KeyboardLegend octaveOffset={octaveOffset} />
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "2%",
          left: 0,
          right: 0,
          zIndex: 3,
          display: "flex",
          justifyContent: "center",
          transformOrigin: "bottom center",
          transform: `scale(${Math.min(1, windowWidth / 1200)})`,
        }}
      >
        <Piano
          melody={melody}
          currentStep={currentStep}
          onNotePressed={handleNotePressed}
          audioCtxRef={audioCtxRef}
          octaveOffset={octaveOffset}
        />
      </div>
    </div>
  );
}