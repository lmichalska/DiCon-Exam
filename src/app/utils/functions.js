import { NOTES, TEMPO_MIN, TEMPO_MAX, KEY_LAYOUT, WHITE_KEY_W } from "../consts/constants";

// ─────────────────────────────────────────────
// MOOD AUDIO PROFILES
// ─────────────────────────────────────────────
const MOOD_AUDIO = {
  peaceful:   { tempo: 0.85, volume: 0.9, attack: 0.02, detune: 0 },
  nostalgic:  { tempo: 0.9,  volume: 0.95, attack: 0.015, detune: 6 },
  passionate: { tempo: 1.2,  volume: 1.2, attack: 0.005, detune: 0 },
  dreamy:     { tempo: 0.8,  volume: 0.85, attack: 0.03, detune: 10 },
  serene:     { tempo: 0.75, volume: 0.8, attack: 0.02, detune: 0 },
  bittersweet:{ tempo: 0.95, volume: 0.9, attack: 0.02, detune: 4 },
  magical:    { tempo: 1.05, volume: 1.05, attack: 0.01, detune: 2 },
  joyful:     { tempo: 1.25, volume: 1.15, attack: 0.008, detune: 0 }
};

// ─────────────────────────────────────────────
// AUDIO
// ─────────────────────────────────────────────
export function createPianoTone(ctx, freq, duration = 1.0, volume = 0.5, mood = "peaceful") {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  const profile = MOOD_AUDIO[mood] || {};

  const finalVolume = volume * (profile.volume || 1);
  const attack = profile.attack ?? 0.012;
  const detune = profile.detune || 0;

  [[freq, "triangle", 0.6], [freq * 2, "sine", 0.25], [freq * 4, "sine", 0.08]]
    .forEach(([f, type, amp]) => {
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
  let satSum = 0, brightSum = 0, brightVals = [], count = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;

      const r = data[i], g = data[i + 1], b = data[i + 2];

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
    contrast: Math.round(contrast * 100)
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

          const notes = [];

          for (let i = 0; i < numSamples; i++) {
            const x = Math.floor((i / numSamples) * canvas.width);
            const ys = [0.3, 0.5, 0.7].map(f =>
              Math.floor(f * canvas.height)
            );

            let rSum = 0, gSum = 0, bSum = 0;

            ys.forEach(y => {
              const idx = (y * canvas.width + x) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
            });

            const r = Math.round(rSum / 3);
            const g = Math.round(gSum / 3);
            const b = Math.round(bSum / 3);

            const brightness =
              (r * 0.299 + g * 0.587 + b * 0.114) / 255;

            const noteIdx = Math.round(
              brightness * (NOTES.length - 1)
            );

            const note =
              NOTES[Math.max(0, Math.min(NOTES.length - 1, noteIdx))];

            const maxCh = Math.max(r, g, b);
            const minCh = Math.min(r, g, b);
            const sat =
              maxCh === 0 ? 0 : (maxCh - minCh) / maxCh;

            const profile = MOOD_AUDIO?.[mood] || {};

            notes.push({
              ...note,
              duration: (0.25 + sat * 0.65) * (profile.tempo || 1),
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
// KEYBOARD + NOTES (UNCHANGED)
// ─────────────────────────────────────────────
export function blackKeyLeft(noteName, visibleWhiteNotes) {
  const letter = noteName.replace(/[#0-9]/g, "");
  const octave = noteName.match(/[0-9]/)[0];

  const idx = visibleWhiteNotes.findIndex(n => n.note === letter + octave);

  return idx >= 0 ? idx * WHITE_KEY_W + WHITE_KEY_W * 0.65 : 0;
}

export function buildMaps(octaveOffset) {
  const noteToKey = {};
  const keyToNote = {};

  const LETTERS = ["C","D","E","F","G","A","B"];
  const SHARPS = ["C#","D#","","F#","G#","A#",""];

  KEY_LAYOUT.forEach(({ whites, blacks }, o) => {
    const oct = octaveOffset + o;

    LETTERS.forEach((l, i) => {
      const noteName = l + oct;
      const k = whites[i];

      if (k) {
        noteToKey[noteName] = k.toUpperCase();
        const idx = NOTES.findIndex(n => n.note === noteName);
        if (idx >= 0) keyToNote[k] = idx;
      }
    });

    SHARPS.forEach((s, i) => {
      if (!s) return;

      const noteName = s + oct;
      const k = blacks[i];

      if (k) {
        noteToKey[noteName] = k.toUpperCase();
        const idx = NOTES.findIndex(n => n.note === noteName);
        if (idx >= 0) keyToNote[k] = idx;
      }
    });
  });

  return { noteToKey, keyToNote };
}

export function getVisibleNotes(octaveOffset) {
  return NOTES.filter(n => {
    const oct = parseInt(n.note.replace(/[^0-9]/g, ""));
    return oct >= octaveOffset && oct <= octaveOffset + 2;
  });
}