# video.json reference

`src/video.json` drives everything. Types live in `src/types.ts`.

## Top level
```jsonc
{
  "fps": 30,
  "wordsPerSecond": 2.7,            // auto scene length when there is no voiceover timing
  "brand": {
    "cardTitle": "YOUR PROFILE",    // header of the prop card (≤ 2 words, first space becomes a line break)
    "cardBadge": "in",              // 1–3 chars in the card corner and app sidebar
    "cardName": "Passionate Team Player |",
    "cardSubtitle": "Open to New Opportunities",
    "cardSections": ["About", "Experience", "Skills"],
    "cardButtons": ["Connect", "Message"]  // optional
  },
  "theme": {                        // optional, any subset
    "character": "#de7350", "paper": "#c9694c", "paperText": "#fbefe2",
    "banner": "#efe4cf", "accent": "#2f6fe0", "wood": "#6b3b22",
    "wall": "#1f2a63", "curtain": "#5b1820"
  },
  "characters": [                   // optional cast (cycled); hats: none|frosting|cap|crown|headset|beanie
    { "hat": "frosting", "accessory": "glasses" }   // accessory: none|glasses|tie|bowtie|mustache; "color" optional
  ],
  "voiceover": "voiceover.mp3",     // optional, file in public/
  "music": "music.mp3", "musicVolume": 0.12,       // optional
  "captions": [ { "word": "I", "start": 0.12, "end": 0.3 } ],   // written by scripts/word_timings.py
  "scenes": [ ... ]
}
```

## Every scene
| field | meaning |
|---|---|
| `type` | one of the eight below |
| `title` | taped banner text, 2–5 words (auto-shrinks, keep ≤ 30 chars) |
| `text` | voiceover line → captions + auto duration |
| `duration` | seconds, optional override (ignored when `captions` exist) |
| `counter` | `{ "label": "Opinions", "value": "auto" }` or a literal like `"$0"`, `"×5"`, `"10x"` |
| `backdrop` | `curtain` \| `wall` \| `dark` (each type has a sensible default) |

`"value": "auto"` counts what the scene reveals: signs (`lineup`), highlights (`card`), rows (`list`).

## Scene types
| type | shows | extra fields |
|---|---|---|
| `hero` | up to 5 characters drop in behind a desk; product card on the desk; optional command typing | `count` (1–5), `command` e.g. `"/linkedin-roast"` |
| `lineup` | characters behind numbered game-show booths; protest signs pop up one by one | `count` (1–6), `signs` (≤ count, 1–2 words each), `booths` (false hides them) |
| `card` | document close-up on an easel; lines fade in; keywords get a highlighter sweep | `heading`, `lines` (≤ 7, ~25 chars each), `highlights` (substrings of lines) |
| `spotlight` | one character alone under a purple spotlight, slow push-in | — |
| `list` | app window; rows slide in; cursor clicks the first row's button | `panelTitle`, `items` [{`name`,`subtitle`}] (≤ 4), `buttonLabel` |
| `before-after` | product card gets a stamp + scorch, then a pencil rewrites it, ✓ checks, AFTER plate, confetti | `stamp`, `afterLabel`, `rewrite` (false = stamp only) |
| `gift` | blue gift box shakes, lid pops, confetti; finished card on the desk | `count` (characters), use `counter` for the price |
| `cta` | big character + comment box typing the keyword, Post button, confetti | `commentWord` |

## Adapting the prop to other niches
Change only `brand` — the card is generic:
- Website audit: `cardTitle "YOUR WEBSITE"`, `cardBadge "www"`, sections `["Hero","Pricing","FAQ"]`
- Resume: `"YOUR RESUME"`, `"CV"`, `["Summary","Experience","Education"]`
- Online store: `"YOUR STORE"`, `"$"`, `["Products","Reviews","Checkout"]`
- YouTube channel: `"YOUR CHANNEL"`, `"▶"`, `["Titles","Thumbnails","About"]`

## Adding a new scene type
1. Write a component in `src/scenes/Scenes.tsx` taking `{ scene: TimedScene }` (frames are local to the scene; `scene.frames` is its length).
2. Register it in `SCENES` in `src/Promo.tsx` and add the name to `SceneType` in `src/types.ts`.
3. Animate only with `useCurrentFrame()` + `interpolate`/`spring` (CSS transitions don't render).
   Reuse `Character`, `Block`, `Backdrop`, `Desk`, `ProductCard`, `Sign`, `Confetti`, `Cursor`.
4. Leave the band y 1440–1620 free — captions live there; banner/counter occupy y 100–400.
