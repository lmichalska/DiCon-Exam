import { NOTES, TEMPO_MIN, TEMPO_MAX, KEY_LAYOUT, WHITE_KEY_W } from "../consts/constants";

// ─── Audio ────────────────────────────────────────────────────────────────────
export function createPianoTone(ctx, freq, duration = 1.0, volume = 0.5) {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  [[freq, "triangle", 0.6], [freq * 2, "sine", 0.25], [freq * 4, "sine", 0.08]].forEach(
    ([f, type, amp]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      g.gain.value = amp;
      osc.connect(g);
      g.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    }
  );
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(volume * 0.4, now + 0.25);
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

// ─── Image → melody ───────────────────────────────────────────────────────────
// Analyse full image pixel grid (sampled every 8px) for mood metrics
export function analyseImageMood(data, width, height) {
  const step = 8;
  let satSum = 0,
    brightSum = 0,
    brightVals = [],
    count = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = data[idx],
        g = data[idx + 1],
        b = data[idx + 2];
      const maxCh = Math.max(r, g, b),
        minCh = Math.min(r, g, b);
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
  // Contrast = std-dev of brightness
  const variance = brightVals.reduce((acc, v) => acc + (v - avgBright) ** 2, 0) / count;
  const contrast = Math.sqrt(variance);
  // Energy = weighted combo: vivid+contrasty = fast, muted+dark = slow
  const energy = avgSat * 0.55 + contrast * 0.45;
  const suggestedTempo = Math.round(TEMPO_MIN + energy * (TEMPO_MAX - TEMPO_MIN));
  // Octave: bright+energetic → higher (4), dark+muted → lower (2)
  const octaveRaw = avgBright * 0.6 + energy * 0.4; // 0..1
  const suggestedOctave = Math.round(2 + octaveRaw * 2); // 2, 3, or 4

  return {
    suggestedTempo: Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, suggestedTempo)),
    suggestedOctave: Math.max(2, Math.min(4, suggestedOctave)),
    avgSat: Math.round(avgSat * 100),
    avgBright: Math.round(avgBright * 100),
    contrast: Math.round(contrast * 100),
  };
}

export function imageFileToNotes(file, numSamples = 64) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx2d = canvas.getContext("2d", { willReadFrequently: true });
          ctx2d.drawImage(img, 0, 0);
          const { data } = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
          const mood = analyseImageMood(data, canvas.width, canvas.height);
          const notes = [];
          for (let i = 0; i < numSamples; i++) {
            const x = Math.floor((i / numSamples) * canvas.width);
            const ys = [0.3, 0.5, 0.7].map((f) => Math.floor(f * canvas.height));
            let rSum = 0,
              gSum = 0,
              bSum = 0;
            ys.forEach((y) => {
              const idx = (y * canvas.width + x) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
            });
            const r = Math.round(rSum / 3),
              g = Math.round(gSum / 3),
              b = Math.round(bSum / 3);
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            const noteIdx = Math.round(brightness * (NOTES.length - 1));
            const note = NOTES[Math.max(0, Math.min(NOTES.length - 1, noteIdx))];
            const maxCh = Math.max(r, g, b),
              minCh = Math.min(r, g, b);
            const sat = maxCh === 0 ? 0 : (maxCh - minCh) / maxCh;
            notes.push({ ...note, duration: 0.25 + sat * 0.65, color: `rgb(${r},${g},${b})` });
          }
          resolve({ notes, mood });
        } catch (e) {
          reject(new Error("Canvas read failed: " + e.message));
        }
      };
      img.onerror = () => reject(new Error("Image decode failed"));
      if (typeof evt.target.result === "string") {
        img.src = evt.target.result;
        }
    };
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}

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
    LETTERS.forEach((letter, i) => {
      const noteName = letter + oct;
      const k = whites[i];
      if (k) {
        noteToKey[noteName] = k.toUpperCase();
        const idx = NOTES.findIndex((n) => n.note === noteName);
        if (idx >= 0) keyToNote[k] = idx;
      }
    });
    SHARPS.forEach((sharp, i) => {
      if (!sharp) return;
      const noteName = sharp + oct;
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

export function getVisibleNotes(octaveOffset) {
  return NOTES.filter((n) => {
    const oct = parseInt(n.note.replace(/[^0-9]/g, ""));
    return oct >= octaveOffset && oct <= octaveOffset + 2;
  });
}
