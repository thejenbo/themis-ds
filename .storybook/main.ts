import type { StorybookConfig } from '@storybook/react-vite';

/** Where the built Storybook is published (.github/workflows), for the absolute URLs link previews need. */
const SITE_URL = 'https://thejenbo.github.io/themis-ds/storybook/';
const DESCRIPTION =
  'Docs for Themis, an accessible React design system you can make your own: every component with its guidance, live examples and design tokens.';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../docs/**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  // `public/themis-manifest.json` (built by `npm run manifest`) is served at
  // /themis-manifest.json — the machine-readable feed for Figma and AI tooling.
  staticDirs: ['../public', './static'],
  // The page head when a link is shared (Slack, iMessage…): name, description and a preview image (static/og-image.png,
  // a 1200 × 630 render of the Introduction page's hero). Link previews
  // read this static HTML without running scripts. The <title> itself is set after the build
  // (scripts/storybook-title.ts), since Storybook always appends " - Storybook" to it.
  managerHead: (head) => `${head}
<meta name="description" content="${DESCRIPTION}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Themis Docs" />
<meta property="og:title" content="Themis Docs" />
<meta property="og:description" content="${DESCRIPTION}" />
<meta property="og:url" content="${SITE_URL}" />
<meta property="og:image" content="${SITE_URL}og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="The Themis logomark and wordmark, the tagline “An accessible React design system you can make your own.”, and the Themis scales" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#ffffff" />`,
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    // Exposes an MCP endpoint (http://localhost:6006/mcp) so AI agents can
    // query components, stories and docs straight from the running Storybook.
    '@storybook/addon-mcp',
  ],
  // StyleX dev CSS is served from a virtual module by @stylexjs/unplugin; static builds bundle it
  // into the preview's CSS instead.
  previewHead: (head, { configType }) =>
    configType === 'DEVELOPMENT'
      ? `${head}
<link rel="stylesheet" href="/virtual:stylex.css" />
<script type="module">import('/@id/virtual:stylex:runtime').catch(() => {});</script>`
      : head,
  typescript: {
    // Prop tables come from TypeScript + JSDoc. Write JSDoc on every public prop.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Keep Themis props + React Aria's documented ones; hide ~70 global DOM attributes/events.
      propFilter: (prop) => !['GlobalDOMAttributes', 'GlobalDOMEvents'].includes(prop.parent?.name ?? ''),
    },
  },
};

export default config;
