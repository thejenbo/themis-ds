import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../docs/**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  // `public/themis-manifest.json` (built by `npm run manifest`) is served at
  // /themis-manifest.json — the machine-readable feed for Figma and AI tooling.
  staticDirs: ['../public'],
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
