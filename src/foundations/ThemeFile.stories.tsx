import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { Heading } from '../components/Heading';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { parseThemisConfig, type ThemisConfig } from '../theme/theme-config';
import { ThemeProvider } from '../theme/ThemeProvider';

/** A theme file as the config tool writes it (`themis.theme.json`). */
const themeFile = {
  $schema: 'https://unpkg.com/themis-ds/dist/theme.schema.json',
  version: 1,
  themes: {
    light: {
      colors: { brand: '#0B6E4F', text: '#1B1B1B', background: '#FFFDF7', error: '#B3261E', warning: '#8A4B00', success: '#1E6B33' },
      borderWidth: 'small',
      radius: 'large',
      fonts: { heading: 'Fraunces', body: 'Inter' },
    },
    dark: {
      colors: { brand: '#8EE3C8', text: '#F3F1EA', background: '#141414', error: '#FFB4AB', warning: '#FFC98A', success: '#9BE0A9' },
      borderWidth: 'medium',
      radius: 'none',
      fonts: { heading: 'Fraunces', body: 'Inter' },
    },
  },
} as const satisfies ThemisConfig;

function Sample() {
  return (
    <div style={{ display: 'grid', gap: 16, padding: 24, maxWidth: 420 }}>
      <Heading level={2}>Order summary</Heading>
      <Text>Your parcel ships tomorrow. We'll email the tracking link.</Text>
      <TextInput label="Email" defaultValue="sam@example.com" />
      <Checkbox defaultSelected>Send me updates</Checkbox>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip tone="success">Paid</Chip>
        <Chip tone="warning">Low stock</Chip>
        <Chip tone="danger">Declined</Chip>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button iconLeft={<Icon name="check" />}>Confirm</Button>
        <Button variant="outline" iconLeft={<Icon name="trash" />}>Remove</Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Foundations/Theme file',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Both themes from a theme file, side by side: `<ThemeProvider theme={config.themes.light}>`. Every color token is
 * worked out from each theme's six colors; the fonts load from Google Fonts.
 */
export const LightAndDark: Story = {
  render: () => {
    const { config, errors } = parseThemisConfig(themeFile);
    if (!config) return <pre>{errors.join('\n')}</pre>;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        {Object.entries(config.themes).map(([name, theme]) => (
          <ThemeProvider key={name} theme={theme}>
            <div data-testid={name}>
              <Sample />
            </div>
          </ThemeProvider>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const light = canvasElement.querySelector('[data-testid="light"]')!;
    const dark = canvasElement.querySelector('[data-testid="dark"]')!;
    // The brand color reaches a filled Button.
    const surface = (root: Element) => root.querySelector('button [data-themis-part="surface"]')!;
    await expect(getComputedStyle(surface(light)).backgroundColor).toBe('rgb(11, 110, 79)');
    await expect(getComputedStyle(surface(dark)).backgroundColor).toBe('rgb(142, 227, 200)');
    // The theme's radius applies: `none` turns icons sharp in the dark theme.
    await expect(getComputedStyle(dark.querySelector('svg[data-themis-icon="check"]')!).strokeLinejoin).toBe('miter');
    await expect(getComputedStyle(light.querySelector('svg[data-themis-icon="check"]')!).strokeLinejoin).toBe('round');
    // The fonts are requested from Google Fonts, once.
    await waitFor(() => expect(document.querySelectorAll('link[data-themis-fonts*="Fraunces"]')).toHaveLength(1));
  },
};
