import * as stylex from '@stylexjs/stylex';
import { useMemo } from 'react';
import { VisuallyHidden } from 'react-aria';
import { parseColor } from 'react-aria-components';
import {
  Button,
  Chip,
  Code,
  type ColorFormat,
  type ColorRating,
  formatColor,
  Heading,
  Modal,
  rateThemeColors,
  Select,
  SelectItem,
  suggestPassingColor,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  type ThemeColors,
} from 'themis-ds';

import { border as borderWidth } from '../../../../src/tokens/borderWidth.stylex';
import { color } from '../../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../../src/tokens/fontTheme.stylex';
import { border as radius } from '../../../../src/tokens/radius.stylex';
import { spacing } from '../../../../src/tokens/spacing.stylex';
import { font } from '../../../../src/tokens/typography.stylex';
import type { ColorFormats } from '../storage';
import { COLOR_KEYS, COLOR_LABELS, type ContrastTab, PAIR_COPY, tokenName } from './contrast-copy';
import { LEVEL_TONE, ratioText } from './RatingChip';

interface ContrastModalProps {
  colors: ThemeColors;
  /** The code each colour field shows, so a suggested fix is written the same way. */
  colorFormats: ColorFormats;
  /** The tab it's open on, or null when it's closed. */
  tab: ContrastTab | null;
  onTabChange: (tab: ContrastTab | null) => void;
  /** Use a suggested colour. */
  onApply: (key: keyof ThemeColors, hex: string) => void;
  showTokens: boolean;
  onShowTokensChange: (show: boolean) => void;
  /** Phones: a select instead of the row of tabs. */
  compact?: boolean;
}

const TAB_LABEL = (tab: ContrastTab) => (tab === 'about' ? 'About' : COLOR_LABELS[tab]);
const TABS: ContrastTab[] = [...COLOR_KEYS, 'about'];

/**
 * What the contrast ratings mean: a tab for each colour (every place it's checked, the lowest first, with a suggested
 * fix when it's below AA) and one explaining the ratings. Opened from a rating chip, the "About contrast ratings"
 * link, or the tipped scales in the header.
 */
export function ContrastModal({ colors, colorFormats, tab, onTabChange, onApply, showTokens, onShowTokensChange, compact = false }: ContrastModalProps) {
  const ratings = useMemo(() => rateThemeColors(colors), [colors]);
  const current = tab ?? 'brand';
  const panel = (t: ContrastTab) =>
    t === 'about' ? (
      <AboutPanel />
    ) : (
      <ColorPanel
        colorKey={t}
        colors={colors}
        ratings={ratings}
        format={colorFormats[t] ?? 'hex'}
        onApply={onApply}
        showTokens={showTokens}
        onShowTokensChange={onShowTokensChange}
      />
    );

  return (
    <Modal title="Contrast ratings" size="large" showCloseButton isOpen={tab != null} onOpenChange={(open) => !open && onTabChange(null)}>
      {compact ? (
        <div {...stylex.props(styles.body)}>
          <Select label="Show" value={current} onChange={(key) => onTabChange(key as ContrastTab)}>
            {TABS.map((t) => (
              <SelectItem key={t} id={t} textValue={t === 'about' ? TAB_LABEL(t) : `${TAB_LABEL(t)}, ${ratings[t].level}`}>
                {TAB_LABEL(t)}
                {t !== 'about' && ` · ${ratings[t].level}`}
              </SelectItem>
            ))}
          </Select>
          {panel(current)}
        </div>
      ) : (
        <Tabs selectedKey={current} onSelectionChange={(key) => onTabChange(key as ContrastTab)}>
          <TabList aria-label="Colour">
            {TABS.map((t) => (
              <Tab key={t} id={t}>
                <span {...stylex.props(styles.tabLabel)}>
                  {t !== 'about' && <span aria-hidden="true" {...stylex.props(styles.dot, ratings[t].level === 'Fail' ? styles.dotFail : styles.dotPass)} />}
                  {TAB_LABEL(t)}
                  {t !== 'about' && <VisuallyHidden> ({ratings[t].level})</VisuallyHidden>}
                </span>
              </Tab>
            ))}
          </TabList>
          {TABS.map((t) => (
            <TabPanel key={t} id={t}>
              <div {...stylex.props(styles.body)}>{panel(t)}</div>
            </TabPanel>
          ))}
        </Tabs>
      )}
    </Modal>
  );
}

/** How a colour code reads in its field: "#A35104", or "RGB 163, 81, 4". */
function codeIn(hex: string, format: ColorFormat) {
  const code = formatColor(parseColor(hex), format);
  return format === 'hex' ? code.toUpperCase() : `${format.toUpperCase()} ${code}`;
}

function ColorPanel({
  colorKey,
  colors,
  ratings,
  format,
  onApply,
  showTokens,
  onShowTokensChange,
}: {
  colorKey: keyof ThemeColors;
  colors: ThemeColors;
  ratings: Record<keyof ThemeColors, ColorRating>;
  format: ColorFormat;
  onApply: (key: keyof ThemeColors, hex: string) => void;
  showTokens: boolean;
  onShowTokensChange: (show: boolean) => void;
}) {
  const rating = ratings[colorKey];
  const label = COLOR_LABELS[colorKey];
  const fix = useMemo(() => (rating.level === 'Fail' ? suggestPassingColor(colors, colorKey) : null), [rating.level, colors, colorKey]);
  // Changing Text or Background (or any colour) can move other colours' ratings too.
  const sideEffects = useMemo(() => {
    if (!fix) return [];
    const after = rateThemeColors({ ...colors, [colorKey]: fix });
    return COLOR_KEYS.filter((k) => k !== colorKey && after[k].level !== ratings[k].level).map(
      (k) => `${COLOR_LABELS[k]} ${ratings[k].level} → ${after[k].level}`,
    );
  }, [fix, colors, colorKey, ratings]);
  // The lowest first; disabled text (not rated) last.
  const checks = [...rating.checks].sort((a, b) => Number(!!a.advisory) - Number(!!b.advisory) || a.ratio - b.ratio);
  const fixCode = fix ? codeIn(fix, format) : '';

  return (
    <>
      <div {...stylex.props(styles.summary)}>
        <Heading level={3} size="sm" xstyle={styles.panelHeading}>
          {label} <Chip tone={LEVEL_TONE[rating.level]}>{rating.level}</Chip>
        </Heading>
        <Text variant="body-base">
          Lowest contrast <strong>{ratioText(rating.ratio)}</strong>: {PAIR_COPY[rating.worstPair]?.where.toLowerCase()}. A colour is rated by its
          lowest check.
        </Text>
      </div>

      {rating.level === 'Fail' && (
        <div {...stylex.props(styles.fix)} role="group" aria-label="Suggested fix">
          {fix ? (
            <>
              <Text variant="body-base">
                <strong {...stylex.props(styles.fixLead)}>Below AA.</strong> The nearest shade of this {label.toLowerCase()} that reaches 4.5:1 everywhere
                it’s used:
              </Text>
              <div {...stylex.props(styles.fixRow)}>
                <span aria-hidden="true" {...stylex.props(styles.fixSwatch)} style={{ backgroundColor: colors[colorKey] }} />
                <span aria-hidden="true">→</span>
                <span aria-hidden="true" {...stylex.props(styles.fixSwatch)} style={{ backgroundColor: fix }} />
                <Button size="small" onPress={() => onApply(colorKey, fix)}>
                  Use {fixCode}
                </Button>
              </div>
              {sideEffects.length > 0 && <Text variant="caption">Also changes: {sideEffects.join(', ')}.</Text>}
            </>
          ) : (
            <Text variant="body-base">
              <strong {...stylex.props(styles.fixLead)}>Below AA.</strong> No shade of this colour reaches 4.5:1 with the current{' '}
              {colorKey === 'background' ? 'text colour' : 'background'}. Try changing {colorKey === 'background' ? 'Text' : 'Background'} too.
            </Text>
          )}
        </div>
      )}

      <div {...stylex.props(styles.toolbar)}>
        <Text variant="body-base">
          {rating.checks.length} places {label.toLowerCase()} is checked
        </Text>
        <Switch size="micro" isSelected={showTokens} onChange={onShowTokensChange}>
          Show tokens
        </Switch>
      </div>

      <ul {...stylex.props(styles.checks)} aria-label={`Where ${label.toLowerCase()} is checked`}>
        {checks.map((check) => {
          const copy = PAIR_COPY[check.id];
          const isWorst = check.id === rating.worstPair;
          return (
            <li key={check.id} {...stylex.props(styles.check, isWorst && styles.checkWorst)}>
              <div {...stylex.props(styles.context)}>
                {isWorst && <span {...stylex.props(styles.worstTag)}>Lowest</span>}
                <Text variant="body-bold" as="span">
                  {copy?.where ?? check.id}
                </Text>
                <Text variant="caption">{copy?.usedBy}</Text>
                {showTokens && (
                  <span {...stylex.props(styles.tokens)}>
                    <Code loadFont={false}>{tokenName(check.text)}</Code> on <Code loadFont={false}>{tokenName(check.surface)}</Code>
                    {check.overlay && (
                      <>
                        {' '}
                        + <Code loadFont={false}>{tokenName(check.overlay)}</Code>
                      </>
                    )}
                  </span>
                )}
              </div>
              {/* The text in its real colours, so the number has a picture. */}
              <span aria-hidden="true" {...stylex.props(styles.sample)} style={{ color: check.textHex, backgroundColor: check.surfaceHex }}>
                {copy?.sample ?? 'Aa'}
              </span>
              <span {...stylex.props(styles.ratio)}>{ratioText(check.ratio)}</span>
              {check.advisory ? (
                <Chip tone="neutral" xstyle={styles.chip}>
                  Not rated
                </Chip>
              ) : (
                <Chip tone={LEVEL_TONE[check.level]} xstyle={styles.chip}>
                  {check.level}
                </Chip>
              )}
              {check.advisory && <Text variant="caption" xstyle={styles.exempt}>WCAG exempts disabled text: it isn’t something people need to read to use the page.</Text>}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function AboutPanel() {
  return (
    <>
      <div {...stylex.props(styles.summary)}>
        <Heading level={3} size="sm">
          What the ratings mean
        </Heading>
        <Text variant="body-base">
          Contrast is how far apart two colours are in lightness, from 1:1 (the same) to 21:1 (black on white). WCAG, the web’s accessibility standard, sets
          minimums so text stays readable for people with low vision or colour blindness, and in glare or on a dim screen.
        </Text>
      </div>
      <ul {...stylex.props(styles.levels)}>
        <li {...stylex.props(styles.level)}>
          <Chip tone="success" xstyle={styles.chip}>
            AAA
          </Chip>
          <div>
            <Text variant="body-bold">7:1 or more</Text>
            <Text variant="body-base">Enhanced contrast. Comfortable to read even with low vision, for small text and in bright light.</Text>
          </div>
        </li>
        <li {...stylex.props(styles.level)}>
          <Chip tone="success" xstyle={styles.chip}>
            AA
          </Chip>
          <div>
            <Text variant="body-bold">4.5:1 or more</Text>
            <Text variant="body-base">The WCAG minimum for normal-size text, and Themis’s target. Every colour should reach at least this.</Text>
          </div>
        </li>
        <li {...stylex.props(styles.level)}>
          <Chip tone="danger" xstyle={styles.chip}>
            Fail
          </Chip>
          <div>
            <Text variant="body-bold">Below 4.5:1</Text>
            <Text variant="body-base">
              Too low for normal-size text. WCAG allows 3:1 for large text (24px, or about 19px bold) and for icons and edges, but every place these colours
              are checked has normal-size text on it, so anything under 4.5:1 counts as a fail here.
            </Text>
          </div>
        </li>
      </ul>
      <Heading level={3} size="sm">
        How Themis rates a colour
      </Heading>
      <ul {...stylex.props(styles.bullets)}>
        <li>
          <Text variant="body-base">Each colour is checked everywhere it’s used: as text on the page, as a fill behind text, and in their hover states.</Text>
        </li>
        <li>
          <Text variant="body-base">The rating is the lowest of those checks, so one weak spot is enough to lower it.</Text>
        </li>
        <li>
          <Text variant="body-base">Hover highlights are see-through, so they’re measured over the colour beneath them, the way the browser draws them.</Text>
        </li>
        <li>
          <Text variant="body-base">
            The six colours make every other colour in the theme, so changing one (especially Text or Background) can change other ratings too.
          </Text>
        </li>
        <li>
          <Text variant="body-base">Disabled text is shown but not rated: WCAG exempts it.</Text>
        </li>
      </ul>
    </>
  );
}

const styles = stylex.create({
  body: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  tabLabel: { display: 'inline-flex', alignItems: 'center', gap: spacing.xs },
  dot: { width: '0.5rem', height: '0.5rem', borderRadius: radius.radiusFull, flexShrink: 0 },
  dotPass: { backgroundColor: color.stateSuccess },
  dotFail: { backgroundColor: color.stateError },
  summary: { display: 'flex', flexDirection: 'column', gap: spacing['2xs'] },
  panelHeading: { display: 'flex', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  fix: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    padding: spacing.sm,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthMandatory,
    borderColor: color.stateError,
    borderRadius: radius.radiusMd,
  },
  fixLead: { color: color.stateError },
  fixRow: { display: 'flex', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  fixSwatch: {
    width: '1.75rem',
    height: '1.75rem',
    borderStyle: 'solid',
    borderWidth: borderWidth.widthMandatory,
    borderColor: color.border,
    borderRadius: radius.radiusXs,
  },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  checks: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    borderStyle: 'solid',
    borderWidth: borderWidth.widthSm,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
    overflow: 'hidden',
  },
  check: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr) auto', '@media (min-width: 48em)': 'minmax(0, 1fr) 7rem 4.5rem 5.5rem' },
    alignItems: 'center',
    gap: `${spacing.xs} ${spacing.sm}`,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderTopStyle: { default: 'solid', ':first-child': 'none' },
    borderTopWidth: borderWidth.widthSm,
    borderTopColor: color.border,
  },
  checkWorst: { backgroundColor: color.backgroundHover },
  context: { display: 'flex', flexDirection: 'column', gap: spacing['3xs'], minWidth: 0 },
  worstTag: {
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeCaption,
    lineHeight: font.lineHeightCaption,
    fontWeight: font.weightBold,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tokens: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing['2xs'], fontSize: font.sizeCaption },
  sample: {
    justifySelf: 'start',
    paddingBlock: spacing['2xs'],
    paddingInline: spacing.xs,
    borderRadius: radius.radiusXs,
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
    fontWeight: font.weightSemibold,
    whiteSpace: 'nowrap',
    // A faint edge, so a sample on the page colour still reads as a sample.
    boxShadow: `inset 0 0 0 1px ${color.backgroundHover}`,
  },
  ratio: { fontVariantNumeric: 'tabular-nums', textAlign: { default: 'start', '@media (min-width: 48em)': 'end' } },
  exempt: { gridColumn: '1 / -1' },
  // Chips keep their own width in a grid cell.
  chip: { justifySelf: 'start' },
  levels: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: spacing.sm },
  level: { display: 'grid', gridTemplateColumns: '3.5rem minmax(0, 1fr)', gap: spacing.sm, alignItems: 'start' },
  bullets: { margin: 0, paddingInlineStart: spacing.md, display: 'flex', flexDirection: 'column', gap: spacing['2xs'] },
});
