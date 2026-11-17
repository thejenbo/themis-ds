import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { type ThemeSettings, ThemeProvider, type ThemisConfig } from 'themis-ds';

import { color } from '../../../src/tokens/colorTheme.stylex';
import { border } from '../../../src/tokens/borderWidth.stylex';
import { initialConfig } from './initial-config';
import { SettingsPanel } from './SettingsPanel';
import { SettingsSim } from './SettingsSim';

/**
 * The config tool: the settings for each theme on the left, and a sample app wearing the selected theme on the right.
 * The tool's own chrome uses the Themis config theme; only the preview changes.
 */
export function App() {
  const [config, setConfig] = useState<ThemisConfig>(initialConfig);
  const [selected, setSelected] = useState<string>(Object.keys(initialConfig.themes)[0]!);
  const theme = config.themes[selected]!;

  const updateTheme = (name: string, next: ThemeSettings) => setConfig((c) => ({ ...c, themes: { ...c.themes, [name]: next } }));
  const addTheme = () => {
    const names = Object.keys(config.themes);
    let n = names.length + 1;
    while (config.themes[`theme ${n}`]) n++;
    const name = `theme ${n}`;
    setConfig((c) => ({ ...c, themes: { ...c.themes, [name]: structuredClone(c.themes[selected]!) } }));
    setSelected(name);
  };

  return (
    <ThemeProvider modes={{ colorTheme: 'themis config', fontTheme: 'themis' }} xstyle={styles.app}>
      <aside {...stylex.props(styles.panel)}>
        <SettingsPanel config={config} selected={selected} onSelect={setSelected} onChange={updateTheme} onAddTheme={addTheme} />
      </aside>
      <main {...stylex.props(styles.preview)} aria-label={`Preview of the ${selected} theme`}>
        <ThemeProvider theme={theme} xstyle={styles.previewTheme}>
          <SettingsSim />
        </ThemeProvider>
      </main>
    </ThemeProvider>
  );
}

const styles = stylex.create({
  app: {
    display: 'grid',
    gridTemplateColumns: '25.5rem minmax(0, 1fr)',
    height: '100dvh',
  },
  panel: {
    overflowY: 'auto',
    borderInlineEndWidth: border.widthSm,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: color.border,
  },
  preview: { overflowY: 'auto' },
  previewTheme: { minHeight: '100%' },
});
