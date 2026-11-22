// Shape of src/video.json — the only file you normally edit to make a new video.

export type HatKind = "none" | "frosting" | "cap" | "crown" | "headset" | "beanie";
export type AccessoryKind = "none" | "glasses" | "tie" | "bowtie" | "mustache";

export type CharacterSpec = {
  color?: string; // body color, defaults to theme.character
  hat?: HatKind;
  accessory?: AccessoryKind;
};

export type ListItem = { name: string; subtitle?: string };

export type SceneType =
  | "hero" // crew of characters behind a desk, product card in front, optional terminal command typing
  | "lineup" // N characters in numbered booths, signs pop up above them one by one
  | "card" // close-up of a document: heading + lines, keywords get highlighted
  | "spotlight" // one character alone on a stage under a spotlight
  | "list" // app-style panel; rows slide in, a cursor clicks the button
  | "before-after" // product card gets stamped, then rewritten with checks + AFTER plate
  | "gift" // gift box pops open with confetti, price badge
  | "cta" // character + comment box typing the keyword, Post button, confetti
  | "board" // chalkboard with big letters/symbols in rows; strike-throughs, highlights, arrows, stamp
  | "timeline"; // vertical history timeline on paper; entries reveal one by one

export type BoardRow = {
  glyphs: string[]; // big symbols/words, e.g. ["a","b","x"] or ["syai'","xei","x"]
  label?: string; // small note after the row, e.g. "= dicari"
  struck?: number[]; // indices crossed out (after the row has appeared)
  highlight?: number[]; // indices that glow/grow at the end
  arrows?: boolean; // draw → between glyphs
};

export type TimelineEntry = { year: string; title: string; note?: string };

export type Scene = {
  type: SceneType;
  /** Short ALL-CAPS headline shown on the taped paper banner (2–5 words). */
  title: string;
  /** What the voiceover says during this scene. Drives captions + auto duration. */
  text: string;
  /** Seconds. Omit to auto-size from the number of words in `text`. */
  duration?: number;
  /** Badge under the banner. value "auto" counts what the scene reveals (signs, highlights, rows). */
  counter?: { label?: string; value: string };
  backdrop?: "curtain" | "wall" | "dark";

  // hero
  command?: string;
  // hero / lineup / gift / cta
  count?: number;
  // lineup
  signs?: string[];
  booths?: boolean;
  // card
  heading?: string;
  lines?: string[];
  highlights?: string[];
  // list
  panelTitle?: string;
  items?: ListItem[];
  buttonLabel?: string;
  // before-after
  stamp?: string;
  afterLabel?: string;
  /** false = only stamp/roast the card (no pencil rewrite + AFTER plate). Default true. */
  rewrite?: boolean;
  // cta
  commentWord?: string;
  // board
  rows?: BoardRow[];
  // timeline
  entries?: TimelineEntry[];
  /** timeline: entries before this index are already visible when the scene starts (continuing a timeline). */
  revealFrom?: number;
  // stamp also applies to `board` (slams in at ~65%)
};

export type Brand = {
  /** Header of the product card, e.g. "YOUR PROFILE", "YOUR WEBSITE". */
  cardTitle: string;
  /** Short tag in the card's corner, e.g. "in", "AI", "$". */
  cardBadge: string;
  /** Name line on the card, e.g. "Passionate Team Player |". */
  cardName: string;
  cardSubtitle?: string;
  /** Section labels on the card. */
  cardSections?: string[];
  /** Two pill buttons under the name, default ["Connect", "Message"]. */
  cardButtons?: [string, string];
};

export type Theme = {
  character: string; // main clay color
  paper: string; // caption scrap color
  paperText: string;
  banner: string; // title banner paper
  accent: string; // badges, buttons, card header
  wood: string;
  wall: string;
  curtain: string;
  floor: [string, string]; // stage floor gradient top -> bottom
  ink: string; // dark text on light surfaces
  highlight: string; // keyword marker in `card` scenes
  positive: string; // counter numbers, checks
  negative: string; // counter multipliers like ×5
  signs: string[]; // protest sign colors in `lineup`
  gift: string;
  ribbon: string;
  confetti: string[];
};

/** "mono" = grayscale palette (default); "warm" = original terracotta/red/navy look. */
export type PaletteName = "mono" | "warm";

export type CaptionWord = { word: string; start: number; end: number };

export type VideoSpec = {
  fps?: number;
  /** Base palette; `theme` overrides individual tokens on top of it. Default "mono". */
  palette?: PaletteName;
  /** Words per second for auto durations when no voiceover timings exist. */
  wordsPerSecond?: number;
  brand: Brand;
  theme?: Partial<Theme>;
  characters?: CharacterSpec[];
  /** File in public/, e.g. "voiceover.mp3". */
  voiceover?: string;
  music?: string;
  musicVolume?: number;
  /** Word-level timings (seconds, absolute) — from scripts/word_timings.py. Overrides scene durations. */
  captions?: CaptionWord[];
  scenes: Scene[];
};
