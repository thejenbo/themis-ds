# themis-ds — notes for AI agents

- Use Node 22 (`source ~/.nvm/nvm.sh && nvm use`). The default Node 20.10 is too old for Vite 8 and Storybook 10.
- Never edit `src/tokens/*` by hand. They are generated from `tokens/` by `npm run tokens`.
- New components follow `docs/AuthoringComponents.mdx`: wrap a React Aria Components primitive, style it with
  StyleX tokens, and use `racStyles()` for interaction state. Each one needs `.docs.ts`, `.stories.tsx` and JSDoc on every prop.
- When a component puts text on a new surface or tint (a `transform-*` overlay), add the pair to `tokens/contrast-pairs.json`
  and check it with `npm run contrast`.
- Before finishing a change, run `npm run manifest` (validates docs against props and tokens), `npm run typecheck` and `npm test`.
- The config tool (`apps/config`) has its own browser tests (`apps/config/src/*.test.tsx`, the `config` project in
  `npm test`). Add one for each new flow, and for each bug fixed, so it can't come back.
- When Storybook is running, use the `themis-storybook` MCP server (`.mcp.json`) for component info and preview URLs.
