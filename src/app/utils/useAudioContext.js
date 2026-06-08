import { useRef, useEffect } from "react";

export function useAudioContext() {
  const audioCtxRef = useRef(null);

  // Initialize audio context immediately on hook mount
  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.AudioContext)();
      console.log("Audio context initialized in hook:", audioCtxRef.current);
    }
  }, []);

  // Resume if suspended (for user interaction)
  useEffect(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
      console.log("Audio context resumed");
    }
  }, []);

  return { audioCtxRef };
}
