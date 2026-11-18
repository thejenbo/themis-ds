import * as stylex from '@stylexjs/stylex';
import { useMemo, useState } from 'react';
import {
  Button,
  Chip,
  type ChipTone,
  ColorField,
  type ContrastLevel,
  collectionModes,
  Heading,
  Icon,
  type ModeOf,
  rateThemeColors,
  Select,
  SelectItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type ThemeColors,
  type ThemeSettings,
  type ThemisConfig,
} from 'themis-ds';

import { spacing } from '../../../src/tokens/spacing.stylex';

interface SettingsPanelProps {
  config: ThemisConfig;
  selected: string;
  onSelect: (name: string) => void;
  onChange: (name: string, theme: ThemeSettings) => void;
  onAddTheme: () => void;
}

/** The left-hand panel: a tab per theme, each with its colours, borders and fonts; then the export. */
export function SettingsPanel({ config, selected, onSelect, onChange, onAddTheme }: SettingsPanelProps) {
  const names = Object.keys(config.themes);
  return (
    <div {...stylex.props(styles.panel)}>
      <Tabs selectedKey={selected} onSelectionChange={(key) => onSelect(String(key))}>
        <div {...stylex.props(styles.tabRow)}>
          <TabList aria-label="Themes">
            {names.map((name) => (
              <Tab key={name} id={name}>
                {name}
              </Tab>
            ))}
          </TabList>
          <Button variant="subtle" size="small" iconLeft={<Icon name="plus" />} onPress={onAddTheme}>
            Add Theme
          </Button>
        </div>
        {names.map((name) => (
          <TabPanel key={name} id={name}>
            <ThemeSettingsForm theme={config.themes[name]!} onChange={(theme) => onChange(name, theme)} />
          </TabPanel>
        ))}
      </Tabs>
      <ExportSection config={config} />
    </div>
  );
}

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  brand: 'Brand',
  text: 'Text',
  background: 'Background',
  error: 'Error',
  warning: 'Warning',
  success: 'Success',
};

const LEVEL_TONE: Record<ContrastLevel, ChipTone> = { AAA: 'success', AA: 'success', 'AA Large': 'warning', Fail: 'danger' };

const BORDER_WIDTH_LABELS: Record<ModeOf<'borderWidth'>, string> = {
  none: 'None - Borderless',
  small: 'Small - Subtle',
  medium: 'Medium - Distinct',
  large: 'Large - Bold',
};

const RADIUS_LABELS: Record<ModeOf<'radius'>, string> = {
  none: 'None - Sharp',
  small: 'Small - Crisp',
  medium: 'Medium - Balanced',
  large: 'Large - Soft',
};

/** A starter list until the Google Fonts search lands. */
const FONTS = ['Playfair Display', 'Montserrat', 'Inter', 'Fraunces', 'DM Sans', 'Lora', 'Space Grotesk', 'Fredoka'];

function ThemeSettingsForm({ theme, onChange }: { theme: ThemeSettings; onChange: (theme: ThemeSettings) => void }) {
  const ratings = useMemo(() => rateThemeColors(theme.colors), [theme.colors]);
  const fonts = theme.fonts ?? { heading: 'Playfair Display', body: 'Montserrat' };
  const setColor = (key: keyof ThemeColors, hex: string) => onChange({ ...theme, colors: { ...theme.colors, [key]: hex } });

  return (
    <div {...stylex.props(styles.sections)}>
      <section {...stylex.props(styles.section)}>
        <Heading level={2} size="sm">
          Colors
        </Heading>
        {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((key) => {
          const rating = ratings[key];
          return (
            <ColorField
              key={key}
              label={
                <span {...stylex.props(styles.colorLabel)}>
                  {COLOR_LABELS[key]}
                  <Chip variant="solid" tone={LEVEL_TONE[rating.level]}>
                    <span title={`Lowest contrast ${rating.ratio.toFixed(2)}:1 (${rating.worstPair})`}>{rating.level}</span>
                  </Chip>
                </span>
              }
              value={theme.colors[key]}
              formats={['hex', 'rgb', 'hsl', 'hsb']}
              onChange={(c) => c && setColor(key, c.toString('hex'))}
            />
          );
        })}
      </section>

      <section {...stylex.props(styles.section)}>
        <Heading level={2} size="sm">
          Borders
        </Heading>
        <Select
          label="Border width"
          value={theme.borderWidth ?? 'medium'}
          onChange={(v) => onChange({ ...theme, borderWidth: v as ModeOf<'borderWidth'> })}
        >
          {collectionModes.borderWidth.map((mode) => (
            <SelectItem key={mode} id={mode}>
              {BORDER_WIDTH_LABELS[mode]}
            </SelectItem>
          ))}
        </Select>
        <Select label="Border radius" value={theme.radius ?? 'medium'} onChange={(v) => onChange({ ...theme, radius: v as ModeOf<'radius'> })}>
          {collectionModes.radius.map((mode) => (
            <SelectItem key={mode} id={mode}>
              {RADIUS_LABELS[mode]}
            </SelectItem>
          ))}
        </Select>
      </section>

      <section {...stylex.props(styles.section)}>
        <Heading level={2} size="sm">
          Fonts
        </Heading>
        {(['heading', 'body'] as const).map((slot) => (
          <Select
            key={slot}
            label={slot === 'heading' ? 'Heading' : 'Body'}
            value={typeof fonts[slot] === 'string' ? fonts[slot] : fonts[slot].family}
            onChange={(v) => onChange({ ...theme, fonts: { ...fonts, [slot]: String(v) } })}
          >
            {FONTS.map((family) => (
              <SelectItem key={family} id={family}>
                {family}
              </SelectItem>
            ))}
          </Select>
        ))}
      </section>
    </div>
  );
}

/** The theme file as it will be saved. Copy for now; the format switch and download come with the export phase. */
function ExportSection({ config }: { config: ThemisConfig }) {
  const json = JSON.stringify(config, null, 2);
  const [copied, setCopied] = useState(false);
  return (
    <section {...stylex.props(styles.section, styles.exportSection)}>
      <Heading level={2} size="sm">
        Export
      </Heading>
      <pre {...stylex.props(styles.code)}>{json}</pre>
      <div {...stylex.props(styles.exportActions)}>
        <Button
          variant="outline"
          size="micro"
          iconLeft={<Icon name={copied ? 'check' : 'copy'} />}
          onPress={async () => {
            await navigator.clipboard.writeText(json);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </section>
  );
}

const styles = stylex.create({
  panel: { display: 'flex', flexDirection: 'column', gap: spacing.lg, padding: spacing.sm },
  tabRow: { display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  sections: { display: 'flex', flexDirection: 'column', gap: spacing.lg, paddingBlockStart: spacing.sm },
  section: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  colorLabel: { display: 'inline-flex', alignItems: 'center', gap: spacing.xs },
  exportSection: { paddingBlockEnd: spacing.lg },
  code: {
    margin: 0,
    padding: spacing.sm,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.75rem',
    lineHeight: 1.5,
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  exportActions: { display: 'flex', justifyContent: 'flex-end' },
});
