# Design tokens (DTCG)

The token files are the source of truth for design decisions. They are exported from Figma variables.

| File | Status |
| --- | --- |
| `primitives/default.tokens.json` | Real Figma export (primitives collection, single mode). Keep it byte-for-byte as exported. |
| `colorTheme/{light demo,dark demo,themis config}.tokens.json` | Real Figma export (colour theme collection). End users pick a theme; these are the demo and config-UI modes. |
| `radius/{none,small,medium,large}.tokens.json` | Real Figma export (radius collection). Sets how rounded corners are across the system. |
| `borderWidth/{none,small,medium,large}.tokens.json` | Real Figma export (border width collection). Sets how heavy strokes are across the system. |
| `system/default.tokens.json` | Real Figma export (system collection, single mode). Fixed colours for disabled and placeholder states that users can't theme. |
| `fontTheme/{demo,inkling,themis}.tokens.json` | Real Figma export (font theme collection). Heading and body font families users can choose between. |
| `spacing/default.tokens.json` | Real Figma export (semantic spacing, single mode for now). Add e.g. `compact.tokens.json` plus a `collections.json` entry to make density switchable. |
| `shadows/{default,off}.tokens.json` | Real Figma export (shadows collection). Drop shadow parts: x, y, blur and colour; `off` removes shadows. |
| `motion/default.tokens.json` | Real Figma export (motion collection). Durations (ms), easing curve and pressed scale. |
| `typography/{mobile,desktop}.tokens.json` | Real Figma export (typography collection). **Responsive**, not themed: mobile is the base and desktop applies at `(min-width: 48em)` (768px, set in `collections.json`). |

To update a collection, re-export it from Figma and overwrite its file. Don't merge files or edit an export by hand.

## Layout

```
tokens/
  <collection>/<mode>.tokens.json   # one file per Figma collection × mode, e.g. radius/small.tokens.json
  <collection>.tokens.json          # single-mode collection
```

`collections.json` sets each multi-mode collection's mode order and default mode, because Figma's export includes neither.
The default mode's values are baked into the StyleX vars. Every multi-mode collection is an independent theme axis:
`<ThemeProvider modes={{ colorTheme: 'dark demo', radius: 'small' }}>`.

Run `npm run tokens` to regenerate `src/tokens/` (StyleX `defineVars`, `createTheme` per mode, and `tokens.json`).
Never edit the generated files by hand.

## Supported `$type`s

`color` (string or DTCG colour object), `dimension`, `number`, `fontFamily`, `fontWeight`, `duration`,
`cubicBezier`, `shadow` and `typography`.

Figma exports font-family variables as `$type: "string"`. Strings with the `FONT_FAMILY` scope, or under a `font.family` group, compile as `fontFamily` (quoted when the name has spaces).

Figma exports every number variable as `$type: "number"` in px with no unit. The compiler adds units by path
(`scripts/build-tokens.ts`):

| Paths | Output | Why |
| --- | --- | --- |
| `spacing`, `border.radius`, `font.size`, `font.line height` | rem (px ÷ 16; 1000px+ stays px) | Scales with the user's browser text size |
| `border.width`, `drop shadow.blur/x/y` | px | Hairlines and shadows stay crisp |
| `duration` | ms | Motion timing |
| anything else | unitless, rounded to 4 decimals | e.g. `scale.pressed` 0.96 |

Figma stays in px. Docs show both (e.g. `1rem (16px)`). Never change the root `html` font size: every rem value assumes 16px.
Breakpoints in `collections.json` use em (`48em` = 768px) so they respond to zoom correctly.

Aliases (`{group.token}`) resolve within the same collection and mode first, then across collections.
Values in `$extensions` (for example Figma variable IDs) are kept in `tokens.json` for the Figma sync.
