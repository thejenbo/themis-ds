import * as stylex from '@stylexjs/stylex';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  /** The code each color field shows, so a suggested fix is written the same way. */
  colorFormats: ColorFormats;
  /** The tab it opens on, or null when it's closed. Switching tabs inside is the modal's own business. */
  tab: ContrastTab | null;
  onClose: () => void;
  /** Use a suggested color. */
  onApply: (key: keyof ThemeColors, hex: string) => void;
  showTokens: boolean;
  onShowTokensChange: (show: boolean) => void;
  /** Phones: a select instead of the row of tabs. (It also switches to the select whenever the tabs don't fit.) */
  compact?: boolean;
}

const TAB_LABEL = (tab: ContrastTab) => (tab === 'about' ? 'About' : COLOR_LABELS[tab]);
const TABS: ContrastTab[] = [...COLOR_KEYS, 'about'];

/**
 * What the contrast ratings mean: a tab for each color (every place it's checked, the lowest first, with a suggested
 * fix when it's below AA) and one explaining the ratings. Opened from a rating chip, the "About contrast ratings"
 * link, or the tipped scales in the header.
 */
export function ContrastModal({ colors, colorFormats, tab, onClose, onApply, showTokens, onShowTokensChange, compact = false }: ContrastModalProps) {
  const ratings = useMemo(() => rateThemeColors(colors), [colors]);
  // The tab showing. Held here, so switching re-renders only the modal (switching through the app re-rendered all of
  // it, and the indicator's slide lost its frames). Opening it again on another tab moves to that one.
  const [current, setCurrent] = useState<ContrastTab>(tab ?? 'brand');
  const [openedOn, setOpenedOn] = useState(tab);
  if (tab !== openedOn) {
    setOpenedOn(tab);
    if (tab) setCurrent(tab);
  }
  // The tabs switch to a select when there isn't room for all of them (before "About" would be cut off), not only on
  // phones: their full width is measured while they show, and compared with the room there is.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(Infinity);
  const [tabsWidth, setTabsWidth] = useState(0);
  // The panels keep one height, so the centered modal doesn't move when the tabs switch (it took the indicator's slide
  // with it): at least as tall as About (the tallest, measured from an invisible copy at the same width), and as the
  // tallest panel shown since the modal opened (a color tab with its tokens showing can be taller).
  const panelsRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [panelsHeight, setPanelsHeight] = useState(0);
  if (tab == null && panelsHeight !== 0) setPanelsHeight(0);
  const useSelect = compact || (tabsWidth > 0 && tabsWidth > room);
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const measure = () => {
      setRoom(body.clientWidth);
      const panels = panelsRef.current;
      const ghost = ghostRef.current;
      if (panels && ghost) setPanelsHeight((h) => Math.max(h, ghost.offsetHeight, panels.offsetHeight));
      const list = body.querySelector<HTMLElement>('[role="tablist"]');
      if (list) setTabsWidth(list.scrollWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    // The invisible About copy sits out of the flow, so it's watched too: it grows when the fonts arrive.
    if (ghostRef.current) observer.observe(ghostRef.current);
    return () => observer.disconnect();
  }, [tab != null, useSelect]);
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
    <Modal title="Contrast ratings" size="large" showCloseButton isOpen={tab != null} onOpenChange={(open) => !open && onClose()}>
      <div ref={bodyRef}>
        {useSelect ? (
          <div {...stylex.props(styles.body)}>
            <Select label="Show" value={current} onChange={(key) => setCurrent(key as ContrastTab)}>
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
          <Tabs selectedKey={current} onSelectionChange={(key) => setCurrent(key as ContrastTab)}>
            <TabList aria-label="Color">
              {TABS.map((t) => (
                <Tab key={t} id={t}>
                  <span {...stylex.props(styles.tabLabel)}>
                    {t !== 'about' && (
                      <span aria-hidden="true" {...stylex.props(styles.dot, ratings[t].level === 'Fail' ? styles.dotFail : styles.dotPass)} />
                    )}
                    {TAB_LABEL(t)}
                    {t !== 'about' && <VisuallyHidden> ({ratings[t].level})</VisuallyHidden>}
                  </span>
                </Tab>
              ))}
            </TabList>
            <div ref={panelsRef} {...stylex.props(styles.panels)} style={{ minHeight: panelsHeight || undefined }}>
              <div ref={ghostRef} aria-hidden="true" inert {...stylex.props(styles.ghost)}>
                <div {...stylex.props(styles.body)}>
                  <AboutPanel />
                </div>
              </div>
              {TABS.map((t) => (
                <TabPanel key={t} id={t}>
                  <div {...stylex.props(styles.body)}>{panel(t)}</div>
                </TabPanel>
              ))}
            </div>
          </Tabs>
        )}
      </div>
    </Modal>
  );
}

/** How a color code reads in its field: "#A35104", or "RGB 163, 81, 4". */
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
  // Changing Text or Background (or any color) can move other colors' ratings too.
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
          Lowest contrast <strong>{ratioText(rating.ratio)}</strong>: {PAIR_COPY[rating.worstPair]?.where.toLowerCase()}.
        </Text>
      </div>

      {rating.level === 'Fail' && (
        <div {...stylex.props(styles.fix)} role="group" aria-label="Suggested fix">
          {fix ? (
            <>
              <Text variant="body-base">
                <strong {...stylex.props(styles.fixLead)}>Below AA.</strong> The nearest shade of this {label.toLowerCase()} that reaches 4.5:1
                everywhere it’s used:
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
              <strong {...stylex.props(styles.fixLead)}>Below AA.</strong> No shade of this color reaches 4.5:1 with the current{' '}
              {colorKey === 'background' ? 'text color' : 'background'}. Try changing {colorKey === 'background' ? 'Text' : 'Background'} too.
            </Text>
          )}
        </div>
      )}

      {/* The count and the tokens switch belong to the list: 8px above it. */}
      <div {...stylex.props(styles.listGroup)}>
        <div {...stylex.props(styles.toolbar)}>
          <Text variant="caption">
            {rating.checks.length} places {label.toLowerCase()} is checked, lowest first
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
                {/* The text in its real colors, so the number has a picture. */}
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
                {check.advisory && (
                  <Text variant="caption" xstyle={styles.exempt}>
                    WCAG exempts disabled text: it isn’t something people need to read to use the page.
                  </Text>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

// The ratio scale on the About tab: where each rating starts, as a share of the way from 1:1 to 21:1 (drawn on a
// square-root scale, so the low end, where the ratings change, gets the room).
const SCALE_STOPS = [
  { ratio: 1, label: '1:1' },
  { ratio: 4.5, label: '4.5' },
  { ratio: 7, label: '7' },
  { ratio: 21, label: '21:1' },
];
const scaleAt = (ratio: number) => (Math.sqrt(ratio) - 1) / (Math.sqrt(21) - 1);

function AboutPanel() {
  // Unique per copy: the modal also renders an invisible one for measuring.
  const id = useId();
  return (
    <>
      <section {...stylex.props(styles.section)} aria-labelledby={`${id}-ratings`}>
        <Heading level={3} size="sm" id={`${id}-ratings`}>
          What the ratings mean
        </Heading>
        <Text variant="body-base">Contrast is how far apart two colors are in lightness: 1:1 is the same color, 21:1 is black on white.</Text>
        {/* The scale: Fail up to 4.5, AA to 7, AAA beyond. */}
        <div {...stylex.props(styles.scale)} aria-hidden="true">
          <div {...stylex.props(styles.scaleBar)}>
            <span {...stylex.props(styles.scaleFail)} style={{ width: `${scaleAt(4.5) * 100}%` }} />
            <span {...stylex.props(styles.scalePass)} style={{ width: `${(scaleAt(7) - scaleAt(4.5)) * 100}%` }} />
            <span {...stylex.props(styles.scalePass, styles.scaleBest)} style={{ flexGrow: 1 }} />
          </div>
          <div {...stylex.props(styles.scaleLabels)}>
            {SCALE_STOPS.map(({ ratio, label }) => (
              <span key={ratio} {...stylex.props(styles.scaleLabel)} style={{ left: `${scaleAt(ratio) * 100}%` }}>
                <Text variant="caption" as="span">
                  {label}
                </Text>
              </span>
            ))}
          </div>
        </div>
        <ul {...stylex.props(styles.levels)}>
          {[
            {
              level: 'AAA',
              tone: 'success',
              range: '7:1 or more',
              note: 'Enhanced. Easy to read with low vision, for small text and in bright light.',
            },
            { level: 'AA', tone: 'success', range: '4.5:1 or more', note: 'The WCAG minimum for normal-size text, and Themis’s target.' },
            {
              level: 'Fail',
              tone: 'danger',
              range: 'Below 4.5:1',
              note: 'Too low for normal-size text. WCAG’s 3:1 for large text doesn’t apply: every check here has normal-size text in it.',
            },
          ].map(({ level, tone, range, note }) => (
            <li key={level} {...stylex.props(styles.level)}>
              <Chip tone={tone as 'success' | 'danger'} xstyle={[styles.chip, styles.levelChip]}>
                {level}
              </Chip>
              <div {...stylex.props(styles.levelText)}>
                <Text variant="label" as="span">
                  {range}
                </Text>
                <span {...stylex.props(styles.listText)}>{note}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section {...stylex.props(styles.section, styles.sectionRuled)} aria-labelledby={`${id}-rating`}>
        <Heading level={3} size="sm" id={`${id}-rating`}>
          How Themis rates a color
        </Heading>
        <ul {...stylex.props(styles.bullets, styles.listText)}>
          {[
            'Each color is checked everywhere it’s used: as text, behind text, and hovered.',
            'One weak spot is enough to lower its rating.',
            'Hover highlights are checked as they appear on screen: the light tint laid over the background it sits on.',
            'Every other color in the theme, like hover shades, is worked out from your six. So changing one, especially Text or Background, can change other colors’ ratings too.',
            'Disabled text is shown but not rated: WCAG exempts it.',
          ].map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

const styles = stylex.create({
  // The panels' area, with an invisible copy of About in it for measuring (its top margin matches the panels').
  panels: { position: 'relative' },
  ghost: { position: 'absolute', insetInline: 0, top: 0, visibility: 'hidden', pointerEvents: 'none', paddingBlockStart: spacing.sm },
  // Room around the content (24px to the sides, with the modal's own 16px) and between its groups.
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    paddingInline: spacing.xs,
    paddingBlock: `${spacing.xs} ${spacing.md}`,
  },
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
  listGroup: { display: 'flex', flexDirection: 'column', gap: spacing.xs },
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
    // A faint edge, so a sample on the page color still reads as a sample.
    boxShadow: `inset 0 0 0 1px ${color.backgroundHover}`,
  },
  ratio: { fontVariantNumeric: 'tabular-nums', textAlign: { default: 'start', '@media (min-width: 48em)': 'end' } },
  exempt: { gridColumn: '1 / -1' },
  // Chips keep their own width in a grid cell.
  chip: { justifySelf: 'start' },
  // In the About tab's levels, the chip sits 6px down, level with the top of the range's text beside it.
  levelChip: { marginBlockStart: `calc(${spacing['2xs']} + ${spacing['3xs']})` },
  // About: two sections, the second under a line.
  section: { display: 'flex', flexDirection: 'column', gap: spacing.xs },
  sectionRuled: {
    paddingBlockStart: spacing.md,
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: borderWidth.widthSm,
    borderBlockStartColor: color.border,
  },
  // The ratio scale: a bar in three parts (Fail, AA, AAA), the ratios under it.
  scale: { display: 'flex', flexDirection: 'column', gap: spacing['2xs'], marginBlock: spacing.xs },
  scaleBar: { display: 'flex', height: spacing.xs, borderRadius: radius.radiusFull, overflow: 'hidden' },
  scaleFail: { backgroundColor: color.stateError },
  scalePass: { backgroundColor: color.stateSuccess, opacity: 0.6 },
  scaleBest: { opacity: 1 },
  scaleLabels: { position: 'relative', height: font.lineHeightCaption },
  scaleLabel: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    ':first-child': { transform: 'none' },
    ':last-child': { transform: 'translateX(-100%)' },
  },
  levels: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: spacing.sm },
  level: { display: 'grid', gridTemplateColumns: '3rem minmax(0, 1fr)', gap: spacing.sm, alignItems: 'start' },
  levelText: { display: 'flex', flexDirection: 'column', gap: spacing['3xs'] },
  bullets: { margin: 0, paddingInlineStart: spacing.sm, display: 'flex', flexDirection: 'column', gap: spacing['2xs'] },
  // The About tab's list text (the bullets, the levels' notes): 14/22, a step between the captions and body text.
  // (The tokens' only 14px step is the code size.)
  listText: { fontFamily: fontTheme.familyBody, fontSize: font.sizeCode, lineHeight: font.lineHeightCode, color: color.text },
});
