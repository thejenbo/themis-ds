# themis-ds

**Themis** is a parametric, accessible React design system.

| Concern | Tool |
| --- | --- |
| Behaviour and accessibility | [React Aria Components](https://react-spectrum.adobe.com/react-aria/) |
| Styling | [StyleX](https://stylexjs.com) (compiled to atomic CSS) |
| Design tokens | Figma variables, exported as [DTCG](https://www.designtokens.org/) and compiled to StyleX vars |
| Docs and source of truth | Storybook 10, with the docs, a11y, vitest and MCP addons |

## Getting started

```sh
nvm use            # Node 22 (see .nvmrc); Vite 8 / Storybook 10 need >= 20.19
npm install
npm run storybook  # http://localhost:6006
```

| Script | What it does |
| --- | --- |
| `npm run tokens` | `tokens/**/*.tokens.json` → `src/tokens/` (StyleX vars, themes, `tokens.json`) |
| `npm run manifest` | Builds and validates `public/themis-manifest.json` (docs + props + tokens) |
| `npm run storybook` | Tokens → manifest → Storybook dev server |
| `npm run build-storybook` | Static Storybook in `storybook-static/` |
| `npm test` | Runs every story as a Chromium test, including axe a11y checks (`npx playwright install chromium` once) |
| `npm run build` | Library build to `dist/` (ESM, `themis.css`, types, manifest) |
| `npm run typecheck` | `tsc --noEmit` |

## Architecture

```
tokens/                      DTCG source from Figma (placeholders until the real export lands)
scripts/build-tokens.ts      DTCG → StyleX compiler
scripts/build-manifest.ts    docs + props + tokens → themis-manifest.json (validated)
src/tokens/                  GENERATED: *.stylex.ts, themes.ts, tokens.json
src/docs/component-docs.ts   The documentation contract every component fills in
src/components/<Name>/       <Name>.tsx · <Name>.docs.ts · <Name>.stories.tsx · index.ts
src/theme/ThemeProvider.tsx  Applies a token mode (light/dark/…) to a subtree
src/utils/stylex-rac.ts      racStyles(): StyleX ↔ React Aria render-prop bridge
.storybook/blocks/           Docs page template that renders <Name>.docs.ts
```

### How documentation flows

`<Name>.docs.ts` holds usage, anatomy, accessibility, guidelines, tokens and the Figma property mapping. It is the only
place this guidance is written. From there it reaches three audiences:

- **People:** each component's Storybook Docs page renders it in a fixed order.
- **AI agents:** the Storybook MCP server at `http://localhost:6006/mcp` (already configured in `.mcp.json`) serves
  components, stories and previews. Storybook also generates `/manifests/components.json`.
- **Figma:** `/themis-manifest.json` combines the docs with props from TypeScript and the resolved token values. It
  ships in the npm package as `themis-ds/manifest.json`.

### Consuming the package

```tsx
import 'themis-ds/styles.css';
import { Button, ThemeProvider } from 'themis-ds';
```

The library ships StyleX already compiled to a single stylesheet, so consumers don't need StyleX tooling.

## Status

- Every collection in `tokens/` is a real Figma export (see `tokens/README.md`).
- `Button` is a reference implementation. Align its variants and tokens with the Figma component set.
- Known quirk: after `npm test` passes, Vitest waits about 10s before exiting.
