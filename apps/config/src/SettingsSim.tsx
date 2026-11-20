import * as stylex from '@stylexjs/stylex';
import { memo, useState } from 'react';
import { useFocusRing } from 'react-aria';
import { Focusable } from 'react-aria-components';
import { Chip, Heading, Icon, SegmentedControl, SegmentedControlItem, ToastRegion, Tooltip, TooltipTrigger } from 'themis-ds';

import { color } from '../../../src/tokens/colorTheme.stylex';
import { border as radius } from '../../../src/tokens/radius.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { focusRing } from '../../../src/utils/focus-ring';
import { ScalesIllustration } from './illustrations/ScalesIllustration';
import { Sparkle } from './illustrations/Sparkle';
import { AccountView } from './sim/AccountView';
import { daysUntil, nextRenewal, planOf, type SimData } from './sim/simData';
import { SubscriptionView } from './sim/SubscriptionView';
import { simToast, useSimData } from './sim/useSimData';

type View = 'account' | 'subscription';

/**
 * "Settings Sim" (Figma 1936:11209 and 2422:36732): an account settings page built only from Themis components, so
 * every token a theme sets shows up somewhere. It works: the forms check what's typed, save it in this browser and
 * confirm with a toast, and the modals and tooltip open as they would in a real app.
 */
export const SettingsSim = memo(function SettingsSim({ lightenBrandArt = false }: { lightenBrandArt?: boolean }) {
  const [view, setView] = useState<View>('account');
  const [data, update] = useSimData();
  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.content)}>
        <div {...stylex.props(styles.title)}>
          <Heading level={1} size="lg">
            Settings Sim
          </Heading>
          <Sparkle lightenBrand={lightenBrandArt} xstyle={styles.titleSparkle} />
        </div>
        <div {...stylex.props(styles.toolbar)}>
          <SegmentedControl aria-label="Settings section" selectedKey={view} onSelectionChange={(key) => setView(key as View)}>
            <SegmentedControlItem id="account">account</SegmentedControlItem>
            <SegmentedControlItem id="subscription">subscription</SegmentedControlItem>
          </SegmentedControl>
          <PlanChip data={data} />
        </div>
        {/* Keyed by view, so each view's unsaved edits start again from what's saved when you come back to it. */}
        {view === 'account' ? <AccountView key="account" data={data} update={update} /> : <SubscriptionView key="subscription" data={data} update={update} />}
      </div>
      {/* Pinned to the bottom of the preview as it scrolls, behind the content (Figma: it stands at the bottom). */}
      <div aria-hidden="true" data-sim-part="scales" {...stylex.props(styles.scalesDock)}>
        <ScalesIllustration lightenBrand={lightenBrandArt} xstyle={styles.scales} />
      </div>
      {/* The simulator's toasts, inside the preview so they're drawn in the theme being edited. */}
      <ToastRegion queue={simToast} aria-label="Settings Sim notifications" />
    </div>
  );
});

/** What the plan chip's tooltip says (Figma 2424:37702). */
export function planTooltip(data: SimData): string {
  if (data.plan === 'basic') return 'You’re on the free plan. To make changes, go to the subscription section.';
  const days = daysUntil(nextRenewal());
  const when = `${days} ${days === 1 ? 'day' : 'days'}`;
  return data.autoPay
    ? `Your plan will renew in ${when}. To make changes, go to the subscription section.`
    : `Your next payment is due in ${when}. To make changes, go to the subscription section.`;
}

/** "premium active", with its info icon: hover or focus it for the renewal tooltip. */
function PlanChip({ data }: { data: SimData }) {
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <TooltipTrigger delay={300}>
      {/* Chips aren't focusable, so a focusable wrapper carries the tooltip (and its focus ring). */}
      <Focusable>
        <span tabIndex={0} {...focusProps} {...stylex.props(styles.planChip, focusRing.base, isFocusVisible && focusRing.visible)}>
          <Chip tone="brand" variant="solid" iconRight={<Icon name="info" />}>
            {planOf(data.plan).name.toLowerCase()} active
          </Chip>
        </span>
      </Focusable>
      <Tooltip placement="top end">{planTooltip(data)}</Tooltip>
    </TooltipTrigger>
  );
}

// Where the scales start, from the content's left edge: under its right edge, so the left pan sits behind the
// accordions (as in Figma).
const scalesLeft = '37.3rem';

const styles = stylex.create({
  // The illustration sits behind the content's right edge, as in Figma; it's clipped on narrow screens.
  // No padding at the bottom: the scales' dock is the last thing on the page, so they reach its very bottom.
  page: {
    position: 'relative',
    overflowX: 'clip',
    containerType: 'inline-size',
    paddingBlockStart: spacing.md,
    // The tool's layouts: 16px sides on phones, 24px on tablets, 64px beside the desktop sidebar (as in Figma).
    paddingInline: { default: spacing.sm, '@media (min-width: 48em)': spacing.md, '@media (min-width: 64em)': spacing['2xl'] },
  },
  content: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: spacing.md, maxWidth: '48rem', marginBlockEnd: { default: spacing.md, '@media (min-width: 64em)': spacing.xl } },
  // A zero-height strip at the end of the page that sticks to the bottom of the scrolling preview; the scales stand
  // on it. Below the content, so the cards pass over them.
  scalesDock: { position: 'sticky', insetBlockEnd: 0, height: 0 },
  scales: {
    position: 'absolute',
    insetBlockEnd: 0,
    insetInlineStart: scalesLeft,
    // Shrinks to fit beside the content; hidden when there isn't room for the pole to show.
    width: `min(27.3rem, calc(100cqw + ${spacing['2xl']} - ${scalesLeft}))`,
    display: { default: 'block', '@container (max-width: 56rem)': 'none' },
  },
  // Figma: the title, the only text right on the tinted page, has a 1px outside stroke in the background colour.
  // CSS strokes are centred on the outline, so 2px painted under the fill leaves 1px showing outside.
  title: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing['3xs'],
    WebkitTextStroke: `2px ${color.background}`,
    paintOrder: 'stroke fill',
  },
  titleSparkle: { width: '1.3rem', flexShrink: 0 },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  planChip: { position: 'relative', display: 'inline-flex', borderRadius: radius.radiusXs, cursor: 'default' },
});
