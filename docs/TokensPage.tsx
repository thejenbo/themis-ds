import type { CSSProperties, ReactNode } from 'react';

import tokenData from '../src/tokens/tokens.json';

type Token = (typeof tokenData.tokens)[number];
type ModeValue = { value: string; px?: string; aliasOf?: string[] };

/** What each collection is for, in the order a reader meets them. Every collection in tokens.json is listed here. */
const COLLECTIONS: { id: string; name: string; about: ReactNode; open?: boolean }[] = [
  {
    id: 'colorTheme',
    name: 'Color theme',
    about: (
      <>
        The 27 colors components use. A theme chooses six of them (brand, text, background, error, warning and
        success); the rest, from hovers and tints to muted text, are worked out from those six by the Themis color
        rules.
      </>
    ),
    open: true,
  },
  { id: 'fontTheme', name: 'Font theme', about: 'The heading and body font families.' },
  {
    id: 'borderWidth',
    name: 'Border width',
    about: (
      <>
        Border widths, from none (borderless) to large. The focus ring keeps its 2px in every mode, so a borderless theme
        still shows where focus is.
      </>
    ),
  },
  { id: 'radius', name: 'Radius', about: 'Corner radii for borders and for components, from none (square) to large.' },
  { id: 'typography', name: 'Typography', about: 'Font sizes, line heights and weights. The desktop sizes apply on their own from 48em wide.' },
  { id: 'spacing', name: 'Spacing', about: 'The spacing scale for padding, gaps and margins.' },
  { id: 'motion', name: 'Motion', about: 'Durations, easing, and how far a pressed control shrinks.' },
  { id: 'shadows', name: 'Shadows', about: 'The drop shadow under floating surfaces such as menus and popovers.' },
  {
    id: 'system',
    name: 'System colors',
    about: 'Colors that stay the same in every theme: disabled states and the code colors (Monokai on black).',
  },
  { id: 'components', name: 'Component tokens', about: 'A few sizes that belong to one component.' },
  {
    id: 'primitives',
    name: 'Primitives',
    about: (
      <>
        The raw values everything above points to: the palette, its darken and lighten ramps, the spacing and border
        scales and the font families. Components never use these directly.
      </>
    ),
  },
];

const tokensIn = (collection: string) => tokenData.tokens.filter((t) => t.collection === collection);
const modesOf = (collection: string) => (tokenData.collections as Record<string, { modes: string[]; defaultMode: string }>)[collection]!;
/** Figma's name for a token: its path with slashes, e.g. color/brand. */
const figmaName = (t: Token) => t.path.replace(/\./g, '/');
const stylexName = (t: Token) => `${t.stylex.export}.${t.stylex.key}`;

const s = {
  swatch: (value: string): CSSProperties => ({
    display: 'inline-block',
    flexShrink: 0,
    width: 16,
    height: 16,
    border: '1px solid #000',
    borderRadius: 4,
    // A checkerboard under the color, so see-through colors (tints, overlays) read as see-through.
    background: `linear-gradient(${value}, ${value}), repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 8px 8px`,
  }),
  value: { display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' } as CSSProperties,
  alias: { display: 'block', fontSize: 12, lineHeight: 1.4 } as CSSProperties,
  small: { fontSize: 12 } as CSSProperties,
  inCode: { display: 'block', marginTop: 4, fontSize: 13 } as CSSProperties,
  summary: { cursor: 'pointer', fontWeight: 700, margin: '0.5rem 0' } as CSSProperties,
  scroll: { overflowX: 'auto' } as CSSProperties,
};

function Value({ token, mode }: { token: Token; mode: string }) {
  const v = (token.modes as Record<string, ModeValue | undefined>)[mode];
  if (!v) return <>—</>;
  return (
    <>
      <span style={s.value}>
        {token.type === 'color' && <span style={s.swatch(v.value)} />}
        <span>{v.value}</span>
        {v.px && <span style={s.small}>({v.px})</span>}
      </span>
      {v.aliasOf && <span style={s.alias}>→ {v.aliasOf.map((a) => a.split('/').slice(1).join('/').replace(/\./g, '/')).join(' → ')}</span>}
    </>
  );
}

function CollectionTable({ id }: { id: string }) {
  const { modes, defaultMode } = modesOf(id);
  const tokens = tokensIn(id);
  return (
    <div style={s.scroll}>
      <table>
        <thead>
          <tr>
            <th>Token (Figma, then code)</th>
            {modes.map((m) => (
              <th key={m}>
                {modes.length > 1 ? m : 'Value'}
                {modes.length > 1 && m === defaultMode && <span style={s.alias}>default</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.id}>
              <td>
                {figmaName(t)}
                <span style={s.inCode}>
                  <code>{stylexName(t)}</code>
                </span>
              </td>
              {modes.map((m) => (
                <td key={m}>
                  <Value token={t} mode={m} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** An overview of the collections, then each one's tokens with the values in each of its modes. */
export function TokensPage() {
  return (
    <>
      <h2>How the tokens fit together</h2>
      <p>
        Every value in Themis (a color, a width, a font size) is a design token: a Figma variable with a name, exported
        as DTCG JSON into <code>tokens/</code> and compiled by <code>npm run tokens</code> into StyleX variables. They sit
        in three layers:
      </p>
      <ol>
        <li>
          <strong>Primitives:</strong> the raw palette and scales.
        </li>
        <li>
          <strong>Mode and system tokens:</strong> what components use, such as <code>color/brand</code> or{' '}
          <code>spacing/sm</code>. They point at primitives, and the mode tokens point at different ones in each mode
          (light or dark, small or large radius…).
        </li>
        <li>
          <strong>Component tokens:</strong> a few values only one component needs.
        </li>
      </ol>
      <p>
        A theme is a choice of mode for each collection. In an app that's a <code>ThemeProvider</code>, usually with a
        theme file from the config tool; in this Storybook it's the toolbar.
      </p>

      <h3>Using a token in a component</h3>
      <p>
        Import the collection's StyleX variables and use them in <code>stylex.create</code>. The name in code is the Figma
        name in camelCase: <code>color/brand-hover</code> is <code>color.brandHover</code>.
      </p>
      <pre>
        <code>{`import { color } from '../../tokens/colorTheme.stylex';
import { spacing } from '../../tokens/spacing.stylex';

const styles = stylex.create({
  root: { backgroundColor: color.brand, padding: spacing.sm },
});`}</code>
      </pre>

      <h2>Collections</h2>
      <table>
        <thead>
          <tr>
            <th>Collection</th>
            <th>Modes</th>
            <th>Tokens</th>
          </tr>
        </thead>
        <tbody>
          {COLLECTIONS.map((c) => (
            <tr key={c.id}>
              <td>
                <a href={`#tokens-${c.id}`}>{c.name}</a>
              </td>
              <td>{modesOf(c.id).modes.length > 1 ? modesOf(c.id).modes.join(', ') : '—'}</td>
              <td>{tokensIn(c.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {COLLECTIONS.map((c) => (
        <section key={c.id} id={`tokens-${c.id}`}>
          <h2>{c.name}</h2>
          <p>{c.about}</p>
          <details open={c.open}>
            <summary style={s.summary}>
              {tokensIn(c.id).length} tokens{modesOf(c.id).modes.length > 1 ? `, in ${modesOf(c.id).modes.length} modes` : ''}
            </summary>
            <CollectionTable id={c.id} />
          </details>
        </section>
      ))}
    </>
  );
}
