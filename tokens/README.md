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
| `shadows/default.tokens.json` | Real Figma export (shadows collection, single mode for now). Drop shadow parts: x, y, blur and colour. |
| `typography/{mobile,desktop}.tokens.json` | Real Figma export (typography collection). **Responsive**, not themed: mobile is the base and desktop applies at `(min-width: 768px)` (set in `collections.json`). |

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

Figma exports every number variable as `$type: "number"` with no unit. Tokens under the path prefixes in
`PX_NUMBER_PATHS` (`scripts/build-tokens.ts`: `spacing`, `border.width`, `border.radius`, `font.size`, `font.line height`, `drop shadow.blur/x/y`) compile to `px`. Add a prefix
there when a new collection exports lengths as numbers. A `typography` token is split into `…FontSize`, `…LineHeight` and similar variables.

Aliases (`{group.token}`) resolve within the same collection and mode first, then across collections.
Values in `$extensions` (for example Figma variable IDs) are kept in `tokens.json` for the Figma sync.
