import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { Logomark } from '../apps/config/src/illustrations/Logomark';
import { ScalesIllustration } from '../apps/config/src/illustrations/ScalesIllustration';
import { Sparkle } from '../apps/config/src/illustrations/Sparkle';
import { CodeBlock } from '../src/components/CodeBlock';
import { Code } from '../src/components/Code';
import { Heading } from '../src/components/Heading';
import { Text } from '../src/components/Text';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { border as borderWidth } from '../src/tokens/borderWidth.stylex';
import { color } from '../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../src/tokens/fontTheme.stylex';
import { border as radius } from '../src/tokens/radius.stylex';
import { spacing } from '../src/tokens/spacing.stylex';
import { font } from '../src/tokens/typography.stylex';

/** The config tool's own look: black on white, Space Mono, 2px rules. */
const TOOL_MODES = { colorTheme: 'themis config', fontTheme: 'themis', borderWidth: 'themis config', radius: 'themis config' } as const;
/** The sparkle takes the light demo theme's brand (#7406EB) on its white background, matching the scales. */
const ART_MODES = { colorTheme: 'light demo', radius: 'medium', borderWidth: 'medium' } as const;
const BRAND = '#7406EB';
const CONFIG_TOOL_URL = 'https://thejenbo.github.io/themis-ds/';

/** A link to another page of this Storybook. Docs render in an iframe, so the link targets the Storybook window. */
function storybookHref(path: string) {
  let base = '';
  try {
    base = window.parent.location.pathname;
  } catch {
    // A cross-origin parent (an embed): fall back to a link relative to this page.
  }
  return `${base}?path=${path}`;
}

function StoryLink({ path, children }: { path: string; children: ReactNode }) {
  return (
    <a href={storybookHref(path)} target="_top" {...stylex.props(styles.link)}>
      {children}
    </a>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section {...stylex.props(styles.section)}>
      <Heading level={2} size="base">
        {title}
      </Heading>
      {children}
    </section>
  );
}

const USAGE = `import 'themis-ds/styles.css';
import { Button, ThemeProvider } from 'themis-ds';
import config from './themis.theme.json';

export function App() {
  return (
    <ThemeProvider theme={config.themes.light}>
      <Button onPress={save}>Save changes</Button>
    </ThemeProvider>
  );
}`;

const INSIDE: { title: string; body: ReactNode }[] = [
  { title: '36 components', body: 'Actions, inputs, selection, color, navigation, disclosure, overlays, feedback, data display and type.' },
  {
    title: 'Built for WCAG AA',
    body: 'AA is the WCAG level Themis supports today: every component is built and tested to it, with AAA where it comes cheaply. Keyboard and screen reader support come from React Aria, and every story runs an axe check.',
  },
  { title: 'Tokens from Figma', body: 'Figma variables, exported as DTCG and compiled to StyleX variables. The CSS ships compiled, so apps need no StyleX setup.' },
  { title: 'Icons that follow the theme', body: 'A Lucide set whose lines take the theme’s border width, with sharp versions when the radius is none.' },
];

const READERS: [string, ReactNode][] = [
  ['People', 'The Docs page of each component: usage, variants, anatomy, guidelines, accessibility, tokens, Figma mapping, examples and the API.'],
  [
    'AI agents',
    <>
      The Storybook MCP server at <Code>/mcp</Code>, and <Code>/themis-manifest.json</Code> (props, tokens and guidance).
    </>,
  ],
  ['Figma', 'The Themis library, with Code Connect: select a component in Dev Mode to see the code for it.'],
];

/** Storybook's Introduction page, in the config tool's style, with its scales as the accent. */
export function IntroPage() {
  return (
    <ThemeProvider modes={TOOL_MODES} loadFonts={false} xstyle={styles.page}>
      <header {...stylex.props(styles.hero)}>
        <div {...stylex.props(styles.heroText)}>
          <div {...stylex.props(styles.brandRow)}>
            <Logomark brand={BRAND} xstyle={styles.logomark} />
            <h1 {...stylex.props(styles.wordmark)}>Themis</h1>
            <ThemeProvider modes={ART_MODES} loadFonts={false} xstyle={styles.sparkle}>
              <Sparkle />
            </ThemeProvider>
          </div>
          <Text variant="body-large" xstyle={styles.tagline}>
            An accessible React design system you can make your own.
          </Text>
          <Text variant="body-base">
            Themis is the goddess of justice, shown blindfolded and holding a pair of scales: fair to everyone, whoever
            they are. This design system aims for the same. Pick six colors, a border, a radius and two fonts, and every
            component follows, with its contrast checked along the way.
          </Text>
          <div {...stylex.props(styles.actions)}>
            <a href={CONFIG_TOOL_URL} {...stylex.props(styles.button, styles.buttonFilled)}>
              Make a theme
            </a>
            <a href={storybookHref('/docs/actions-button--docs')} target="_top" {...stylex.props(styles.button)}>
              Browse components
            </a>
          </div>
        </div>
        <div {...stylex.props(styles.art)}>
          <ScalesIllustration brand={BRAND} xstyle={styles.scales} />
        </div>
      </header>

      <Section title="Make it yours">
        <Text variant="body-base">
          The <a href={CONFIG_TOOL_URL} {...stylex.props(styles.link)}>Themis config tool</a> builds a theme as you
          watch: a settings app and every component preview it live.
        </Text>
        <ol {...stylex.props(styles.steps)}>
          <li>
            <Text variant="body-base">
              Choose six colors (brand, text, background, error, warning and success). Every other color, from hovers to
              disabled text, is worked out from them.
            </Text>
          </li>
          <li>
            <Text variant="body-base">Choose a border width, a corner radius, and heading and body fonts from Google Fonts.</Text>
          </li>
          <li>
            <Text variant="body-base">
              Export <Code>themis.theme.json</Code>, holding as many named themes as you like (a light and a dark one, say).
            </Text>
          </li>
        </ol>
        <div {...stylex.props(styles.callout)}>
          <Logomark brand={BRAND} isUnbalanced xstyle={styles.calloutMark} />
          <Text variant="body-base">
            Each color gets a contrast rating (AAA, AA or Fail) against the colors it's used with. AA is the level
            Themis supports, so anything below it fails, and the scales in the tool's logo tip until it's fixed.
          </Text>
        </div>
      </Section>

      <Section title="Use it">
        <Text variant="body-base">
          Pass a theme from the file to <Code>ThemeProvider</Code>. Its fonts load from Google Fonts on their own (
          <Code>{'loadFonts={false}'}</Code> if you host them yourself).
        </Text>
        <CodeBlock language="tsx" aria-label="Using a theme" loadFont={false}>
          {USAGE}
        </CodeBlock>
        <Text variant="body-base">
          <StoryLink path="/story/foundations-theme-file--light-and-dark">Theme file</StoryLink> shows two themes from one
          file side by side.
        </Text>
        <Text variant="caption">Themis isn't on npm yet, so for now it's built from this repository.</Text>
      </Section>

      <Section title="What's inside">
        <ul {...stylex.props(styles.grid)}>
          {INSIDE.map(({ title, body }) => (
            <li key={title} {...stylex.props(styles.card)}>
              <Text variant="body-bold">{title}</Text>
              <Text variant="body-base">{body}</Text>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Browse this Storybook">
        <Text variant="body-base">
          The toolbar switches every story between the token modes: <Code>colorTheme</Code>, <Code>fontTheme</Code>,{' '}
          <Code>radius</Code> and <Code>borderWidth</Code>. Each component's Docs page follows the
          same order, from usage to the API reference.
        </Text>
        <Text variant="body-base">
          Start with the foundations: <StoryLink path="/docs/foundations-design-tokens--docs">design tokens</StoryLink>,{' '}
          <StoryLink path="/docs/foundations-focus-ring--docs">the focus ring</StoryLink>,{' '}
          <StoryLink path="/docs/foundations-touch-targets--docs">touch targets</StoryLink> and{' '}
          <StoryLink path="/docs/foundations-motion--docs">motion</StoryLink>. Building a component? Read{' '}
          <StoryLink path="/docs/guides-authoring-components--docs">Authoring components</StoryLink>.
        </Text>
      </Section>

      <Section title="One source, three readers">
        <Text variant="body-base">
          Each component's guidance is written once, in its <Code>.docs.ts</Code> file, and reaches:
        </Text>
        <dl {...stylex.props(styles.readers)}>
          {READERS.map(([who, where]) => (
            <div key={who} {...stylex.props(styles.reader)}>
              <dt>
                <Text variant="body-bold" as="span">
                  {who}
                </Text>
              </dt>
              <dd {...stylex.props(styles.readerText)}>
                <Text variant="body-base" as="span">
                  {where}
                </Text>
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </ThemeProvider>
  );
}

const rule = { borderBlockStartStyle: 'solid', borderBlockStartWidth: borderWidth.widthSm, borderBlockStartColor: color.border } as const;

const styles = stylex.create({
  page: { display: 'flex', flexDirection: 'column', color: color.text, backgroundColor: color.background, maxWidth: '62rem' },
  hero: {
    display: 'grid',
    gridTemplateColumns: { default: '1fr', '@media (min-width: 48em)': 'minmax(0, 1fr) minmax(14rem, 22rem)' },
    gap: spacing.lg,
    alignItems: 'center',
    paddingBlockEnd: spacing.xl,
  },
  heroText: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  // The wordmark stands on the same ground as the scales, as in the config tool's header.
  brandRow: { display: 'flex', alignItems: 'flex-end', gap: spacing.xs },
  logomark: { width: '3.5rem', height: 'auto' },
  wordmark: {
    margin: 0,
    fontFamily: fontTheme.familyHeading,
    fontSize: font.size3xl,
    lineHeight: 1,
    fontWeight: font.weightBold,
  },
  sparkle: { alignSelf: 'flex-start', width: '1.25rem' },
  tagline: { fontWeight: font.weightBold },
  actions: { display: 'flex', flexWrap: 'wrap', gap: spacing.xs, paddingBlockStart: spacing.xs },
  // The tool's buttons: Export is black and full; the rest are outlined.
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingBlock: spacing['2xs'],
    paddingInline: spacing.sm,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
    color: color.text,
    backgroundColor: { default: color.background, ':hover': color.backgroundHover },
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeLabel,
    lineHeight: font.lineHeightLabel,
    fontWeight: font.weightBold,
    textDecoration: 'none',
  },
  buttonFilled: {
    color: color.textInverse,
    backgroundColor: { default: color.backgroundInverse, ':hover': color.backgroundInverseHover },
  },
  // The scales stand straight on the page, drawn like the logomark: the brand fill, black outlines.
  art: { display: 'flex', justifyContent: 'center' },
  scales: { width: '100%', maxWidth: '18rem', height: 'auto' },
  section: { ...rule, display: 'flex', flexDirection: 'column', gap: spacing.sm, paddingBlock: spacing.lg },
  link: { color: 'inherit', textDecorationLine: 'underline', textUnderlineOffset: '0.2em' },
  steps: { display: 'flex', flexDirection: 'column', gap: spacing.xs, margin: 0, paddingInlineStart: spacing.md },
  callout: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
  },
  calloutMark: { flexShrink: 0, width: '3rem', height: 'auto' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
    gap: spacing.sm,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing['2xs'],
    padding: spacing.sm,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
  },
  readers: { display: 'flex', flexDirection: 'column', gap: spacing.sm, margin: 0 },
  reader: {
    display: 'grid',
    gridTemplateColumns: { default: '1fr', '@media (min-width: 48em)': '8rem minmax(0, 1fr)' },
    gap: spacing['2xs'],
  },
  readerText: { margin: 0 },
});
