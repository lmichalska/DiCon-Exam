import {
  NOTES,
  TEMPO_MIN,
  TEMPO_MAX,
  KEY_LAYOUT,
  WHITE_KEY_W,
  MOOD_AUDIO,
} from "../consts/constants";

// ─────────────────────────────────────────────
// AUDIO
// ─────────────────────────────────────────────
export function createPianoTone(
  ctx,
  freq,
  duration = 1.0,
  volume = 0.5,
  mood = "peaceful"
) {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  const profile = MOOD_AUDIO[mood] || {};

  const finalVolume = volume * (profile.volume || 1);
  const attack = profile.attack ?? 0.012;
  const detune = profile.detune || 0;

  [
    [freq, "triangle", 0.6],
    [freq * 2, "sine", 0.25],
    [freq * 4, "sine", 0.08],
  ].forEach(([f, type, amp]) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = type;
    osc.frequency.value = f;
    if (detune) osc.detune.value = detune;

    osc.connect(g);
    g.connect(gain);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  });

  const now = ctx.currentTime;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(finalVolume, now + attack);
  gain.gain.exponentialRampToValueAtTime(finalVolume * 0.4, now + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
}

export function createMetronomeTick(ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.value = 1200;

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.035);
}

// ─────────────────────────────────────────────
// IMAGE → SOUND
// ─────────────────────────────────────────────
export function analyseImageMood(data, width, height) {
  const step = 8;
  let satSum = 0,
    brightSum = 0,
    brightVals = [],
    count = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;

      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];

      const maxCh = Math.max(r, g, b);
      const minCh = Math.min(r, g, b);

      const sat = maxCh === 0 ? 0 : (maxCh - minCh) / maxCh;
      const bright = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      satSum += sat;
      brightSum += bright;
      brightVals.push(bright);
      count++;
    }
  }

  const avgSat = satSum / count;
  const avgBright = brightSum / count;

  const variance =
    brightVals.reduce((a, v) => a + (v - avgBright) ** 2, 0) / count;

  const contrast = Math.sqrt(variance);

  const energy = avgSat * 0.55 + contrast * 0.45;

  const suggestedTempo = Math.round(
    TEMPO_MIN + energy * (TEMPO_MAX - TEMPO_MIN)
  );

  const octaveRaw = avgBright * 0.6 + energy * 0.4;
  const suggestedOctave = Math.round(2 + octaveRaw * 2);

  return {
    suggestedTempo: Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, suggestedTempo)),
    suggestedOctave: Math.max(2, Math.min(4, suggestedOctave)),
    avgSat: Math.round(avgSat * 100),
    avgBright: Math.round(avgBright * 100),
    contrast: Math.round(contrast * 100),
  };
}

export function imageFileToNotes(file, numSamples = 64, mood = "peaceful") {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    let timeout;

    const reader = new FileReader();

    const fail = (msg) => {
      clearTimeout(timeout);
      reject(new Error(msg));
    };

    timeout = setTimeout(() => {
      fail("Image processing timed out");
    }, 15000); // prevents infinite stuck state

    reader.onload = (evt) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx2d = canvas.getContext("2d", { willReadFrequently: true });
          ctx2d.drawImage(img, 0, 0);

          const { data } = ctx2d.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

          const moodData = analyseImageMood(data, canvas.width, canvas.height);

          // Restrict melody generation to the same 21-white-key window
          // that will be shown on screen for this mood's suggested octave.
          const scaleNotes = getVisibleNotes(moodData.suggestedOctave, 21);

          const notes = [];

          for (let i = 0; i < numSamples; i++) {
            const x = Math.floor((i / numSamples) * canvas.width);
            const ys = [0.3, 0.5, 0.7].map((f) =>
              Math.floor(f * canvas.height)
            );

            let rSum = 0,
              gSum = 0,
              bSum = 0;

            ys.forEach((y) => {
              const idx = (y * canvas.width + x) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
            });

            const r = Math.round(rSum / 3);
            const g = Math.round(gSum / 3);
            const b = Math.round(bSum / 3);

            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

            const noteIdx = Math.round(brightness * (scaleNotes.length - 1));
            const note = scaleNotes[
              Math.max(0, Math.min(scaleNotes.length - 1, noteIdx))
            ];

            if (!note || !Number.isFinite(note.freq)) {
              continue;
            }

            const maxCh = Math.max(r, g, b);
            const minCh = Math.min(r, g, b);
            const sat = maxCh === 0 ? 0 : (maxCh - minCh) / maxCh;

            const profile = MOOD_AUDIO?.[mood] || {};

            notes.push({
              ...note,
              duration:
                (0.5 + Math.round(sat * 2) * 0.5) *
                (profile.tempo || 1),
              mood,
              color: `rgb(${r},${g},${b})`
            });
          }

          clearTimeout(timeout);
          resolve({ notes, mood, moodData });
        } catch (e) {
          fail("Canvas processing failed: " + e.message);
        }
      };

      img.onerror = () => fail("Image decode failed");

      if (!evt?.target?.result) {
        fail("FileReader returned empty result");
        return;
      }

      if (typeof evt.target.result === "string") {
        img.src = evt.target.result;
      }
    };

    reader.onerror = () => fail("FileReader failed");

    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────
// KEYBOARD + NOTES
// ─────────────────────────────────────────────
export function blackKeyLeft(noteName, visibleWhiteNotes) {
  const letter = noteName.replace(/[#0-9]/g, "");
  const octave = noteName.match(/[0-9]/)[0];

  const idx = visibleWhiteNotes.findIndex((n) => n.note === letter + octave);

  return idx >= 0 ? idx * WHITE_KEY_W + WHITE_KEY_W * 0.65 : 0;
}

export function buildMaps(octaveOffset) {
  const noteToKey = {};
  const keyToNote = {};

  const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const SHARPS = ["C#", "D#", "", "F#", "G#", "A#", ""];

  KEY_LAYOUT.forEach(({ whites, blacks }, o) => {
    const oct = octaveOffset + o;

    LETTERS.forEach((l, i) => {
      const noteName = l + oct;
      const k = whites[i];

      if (k) {
        noteToKey[noteName] = k.toUpperCase();
        const idx = NOTES.findIndex((n) => n.note === noteName);
        if (idx >= 0) keyToNote[k] = idx;
      }
    });

    SHARPS.forEach((s, i) => {
      if (!s) return;

      const noteName = s + oct;
      const k = blacks[i];

      if (k) {
        noteToKey[noteName] = k.toUpperCase();
        const idx = NOTES.findIndex((n) => n.note === noteName);
        if (idx >= 0) keyToNote[k] = idx;
      }
    });
  });

  return { noteToKey, keyToNote };
}

export function getVisibleNotes(octaveOffset, maxWhiteKeys = 21) {
  const startIndex = NOTES.findIndex((n) => n.note === `C${octaveOffset}`);
  const safeStart = Math.max(0, startIndex);

  const result = [];
  let whiteCount = 0;

  for (let i = safeStart; i < NOTES.length; i++) {
    const n = NOTES[i];

    if (n.white) {
      if (whiteCount >= maxWhiteKeys) break;
      whiteCount++;
    }

    result.push(n);
  }

  return result;
}