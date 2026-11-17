import type { ThemisConfig } from 'themis-ds';

/** What the tool starts from: the Themis demo themes. */
export const initialConfig: ThemisConfig = {
  $schema: 'https://unpkg.com/themis-ds/dist/theme.schema.json',
  version: 1,
  themes: {
    light: {
      colors: { brand: '#7406EB', text: '#000000', background: '#FFFFFF', error: '#AF0E0E', warning: '#A35104', success: '#2C6E2F' },
      borderWidth: 'medium',
      radius: 'medium',
      fonts: { heading: 'Playfair Display', body: 'Montserrat' },
    },
    dark: {
      colors: { brand: '#EBBFF8', text: '#FFFFFF', background: '#000000', error: '#FAB1B1', warning: '#FDDFBD', success: '#71F2C1' },
      borderWidth: 'medium',
      radius: 'medium',
      fonts: { heading: 'Playfair Display', body: 'Montserrat' },
    },
  },
};
