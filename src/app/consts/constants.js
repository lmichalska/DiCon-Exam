export const NOTES = [
  { note: "C2", freq: 65.41, white: true }, { note: "C#2", freq: 69.30, white: false },
  { note: "D2", freq: 73.42, white: true }, { note: "D#2", freq: 77.78, white: false },
  { note: "E2", freq: 82.41, white: true }, { note: "F2", freq: 87.31, white: true },
  { note: "F#2", freq: 92.50, white: false }, { note: "G2", freq: 98.00, white: true },
  { note: "G#2", freq: 103.83, white: false }, { note: "A2", freq: 110.00, white: true },
  { note: "A#2", freq: 116.54, white: false }, { note: "B2", freq: 123.47, white: true },
  { note: "C3", freq: 130.81, white: true }, { note: "C#3", freq: 138.59, white: false },
  { note: "D3", freq: 146.83, white: true }, { note: "D#3", freq: 155.56, white: false },
  { note: "E3", freq: 164.81, white: true }, { note: "F3", freq: 174.61, white: true },
  { note: "F#3", freq: 185.00, white: false }, { note: "G3", freq: 196.00, white: true },
  { note: "G#3", freq: 207.65, white: false }, { note: "A3", freq: 220.00, white: true },
  { note: "A#3", freq: 233.08, white: false }, { note: "B3", freq: 246.94, white: true },
  { note: "C4", freq: 261.63, white: true }, { note: "C#4", freq: 277.18, white: false },
  { note: "D4", freq: 293.66, white: true }, { note: "D#4", freq: 311.13, white: false },
  { note: "E4", freq: 329.63, white: true }, { note: "F4", freq: 349.23, white: true },
  { note: "F#4", freq: 369.99, white: false }, { note: "G4", freq: 392.00, white: true },
  { note: "G#4", freq: 415.30, white: false }, { note: "A4", freq: 440.00, white: true },
  { note: "A#4", freq: 466.16, white: false }, { note: "B4", freq: 493.88, white: true },
  { note: "C5", freq: 523.25, white: true }, { note: "C#5", freq: 554.37, white: false },
  { note: "D5", freq: 587.33, white: true }, { note: "D#5", freq: 622.25, white: false },
  { note: "E5", freq: 659.25, white: true }, { note: "F5", freq: 698.46, white: true },
  { note: "F#5", freq: 739.99, white: false }, { note: "G5", freq: 783.99, white: true },
  { note: "G#5", freq: 830.61, white: false }, { note: "A5", freq: 880.00, white: true },
  { note: "A#5", freq: 932.33, white: false }, { note: "B5", freq: 987.77, white: true },
  { note: "C6", freq: 1046.50, white: true }, { note: "C#6", freq: 1108.73, white: false },
  { note: "D6", freq: 1174.66, white: true }, { note: "D#6", freq: 1244.51, white: false },
  { note: "E6", freq: 1318.51, white: true }, { note: "F6", freq: 1396.91, white: true },
  { note: "F#6", freq: 1479.98, white: false }, { note: "G6", freq: 1567.98, white: true },
  { note: "G#6", freq: 1661.22, white: false }, { note: "A6", freq: 1760.00, white: true },
  { note: "A#6", freq: 1864.66, white: false }, { note: "B6", freq: 1975.53, white: true }
];

export const KEY_LAYOUT = [
  { whites: ["a","s","d","f","g","h","j"], blacks: ["w","e","","t","y","u",""] },
  { whites: ["k","l","v","b","n","m","q"], blacks: ["o","p","","1","2","3",""] },
  { whites: ["4","5","6","7","8","9","0"], blacks: ["r","i","","z","x","c",""] }
];

export const BASE_OCTAVE = 3;
export const WHITE_KEY_W = 38;
export const TEMPO_MIN = 95;
export const TEMPO_MAX = 150;

export const MOODS = [
  "peaceful", "nostalgic", "passionate", "dreamy",
  "serene", "bittersweet", "magical", "joyful"
];

export const stages = ["intro", "upload", "mood", "generating", "proceed"];
