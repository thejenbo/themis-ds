import * as stylex from '@stylexjs/stylex';
import { memo, useLayoutEffect, useRef, useState } from 'react';
import { useFocusRing } from 'react-aria';
import { Focusable } from 'react-aria-components';
import { Chip, Heading, Icon, Tab, TabList, TabPanel, Tabs, ToastRegion, Tooltip, TooltipTrigger } from 'themis-ds';

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

export type SimView = 'account' | 'subscription';

/**
 * "Settings Sim" (Figma 1936:11209 and 2422:36732): an account settings page built only from Themis components, so
 * every token a theme sets shows up somewhere. It works: the forms check what's typed, save it in this browser and
 * confirm with a toast, and the modals and tooltip open as they would in a real app.
 */
interface SettingsSimProps {
  lightenBrandArt?: boolean;
  /**
   * Which view shows. Held by the app, not here: changing layout (desktop, tablet, phone) remounts the preview, and
   * the view should stay put.
   */
  view: SimView;
  onViewChange: (view: SimView) => void;
  /**
   * Where the simulator's toasts appear. Tablet uses the top right of the preview (just under the app header), so
   * they don't cover the settings drawer at the bottom.
   * @default 'bottom-right'
   */
  toastPlacement?: 'bottom-right' | 'top-right';
}

export const SettingsSim = memo(function SettingsSim({
  lightenBrandArt = false,
  view,
  onViewChange,
  toastPlacement = 'bottom-right',
}: SettingsSimProps) {
  // Top placement: below whatever sits above the preview (the app header), measured from the preview's top.
  const pageRef = useRef<HTMLDivElement>(null);
  const [previewTop, setPreviewTop] = useState(0);
  useLayoutEffect(() => {
    if (toastPlacement !== 'top-right') return;
    const scroller = pageRef.current?.closest('main');
    if (!scroller) return;
    const measure = () => setPreviewTop(Math.max(0, Math.round(scroller.getBoundingClientRect().top)));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [toastPlacement]);
  const [data, update] = useSimData();
  return (
    <div ref={pageRef} {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.content)}>
        <div {...stylex.props(styles.title)}>
          <Heading level={1} size="lg">
            Settings Sim
          </Heading>
          <Sparkle lightenBrand={lightenBrandArt} xstyle={styles.titleSparkle} />
        </div>
        {/* The two views as tabs, with the plan chip at the end of the tab row. */}
        <Tabs selectedKey={view} onSelectionChange={(key) => onViewChange(key as SimView)}>
          <div {...stylex.props(styles.toolbar)}>
            <TabList aria-label="Settings section">
              <Tab id="account">account</Tab>
              <Tab id="subscription">subscription</Tab>
            </TabList>
            <PlanChip data={data} />
          </div>
          {/* Only the selected panel is rendered, so each view's unsaved edits start again from what's saved. */}
          <TabPanel id="account">
            <div {...stylex.props(styles.view)}>
              <AccountView data={data} update={update} />
            </div>
          </TabPanel>
          <TabPanel id="subscription">
            <div {...stylex.props(styles.view)}>
              <SubscriptionView data={data} update={update} />
            </div>
          </TabPanel>
        </Tabs>
      </div>
      {/* Pinned to the bottom of the preview as it scrolls, behind the content (Figma: it stands at the bottom). */}
      <div aria-hidden="true" data-sim-part="scales" {...stylex.props(styles.scalesDock)}>
        <ScalesIllustration lightenBrand={lightenBrandArt} xstyle={styles.scales} />
      </div>
      {/* The simulator's toasts, inside the preview so they're drawn in the theme being edited. */}
      <ToastRegion
        queue={simToast}
        aria-label="Settings Sim notifications"
        placement={toastPlacement}
        topOffset={toastPlacement === 'top-right' ? `${previewTop}px` : undefined}
      />
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

/**
 * "premium active", with an info icon: hover or focus the icon for the renewal tooltip (Figma 2424:37702). The icon is
 * the tooltip's trigger, so the tooltip and its arrow line up on it. It's a small button ("About your plan") inside the
 * chip's label, since the chip's own icon slot is hidden from screen readers.
 */
function PlanChip({ data }: { data: SimData }) {
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <Chip tone="brand" variant="solid">
      {planOf(data.plan).name.toLowerCase()} active
      <TooltipTrigger delay={300}>
        <Focusable>
          <span
            role="button"
            tabIndex={0}
            aria-label="About your plan"
            {...focusProps}
            {...stylex.props(styles.infoButton, focusRing.base, isFocusVisible && focusRing.visible)}
          >
            {/* 12px, Chip's icon size: 16px nearly touched the chip's edge. */}
            <Icon name="info" size="xsmall" />
          </span>
        </Focusable>
        <Tooltip placement="top">{planTooltip(data)}</Tooltip>
      </TooltipTrigger>
    </Chip>
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
    // Named, so parts that are query containers themselves (the plan cards) can still ask about the page's width.
    containerName: 'sim-page',
    paddingBlockStart: spacing.md,
    // The tool's layouts: 16px sides on phones, 24px on tablets, 64px beside the desktop sidebar (as in Figma).
    paddingInline: { default: spacing.sm, '@media (min-width: 48em)': spacing.md, '@media (min-width: 64em)': spacing['2xl'] },
  },
  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    // Full width on phones and tablets; beside the desktop sidebar it stops at Figma's 768px.
    maxWidth: { default: 'none', '@media (min-width: 64em)': '48rem' },
    marginBlockEnd: { default: spacing.md, '@media (min-width: 64em)': spacing.xl },
  },
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
  // 24px under the tabs (the panel's own 16px, plus 8px), as between the sections.
  view: { display: 'flex', flexDirection: 'column', gap: spacing.md, paddingBlockStart: spacing.xs },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  // After the label, 4px apart (Chip's icon gap), centred on the caption line. 4px of padding all round, taken back
  // with negative margins: a 20px target, wider than the tooltip's 18px arrow, which React Aria keeps within the
  // trigger's edges (with just the 12px icon it was pushed 3px off-centre).
  infoButton: {
    position: 'relative',
    display: 'inline-flex',
    verticalAlign: 'middle',
    padding: spacing['2xs'],
    marginBlock: `calc(-1 * ${spacing['2xs']} - 0.125em) calc(-1 * ${spacing['2xs']})`,
    marginInlineStart: 0,
    marginInlineEnd: `calc(-1 * ${spacing['2xs']})`,
    borderRadius: radius.radiusFull,
    cursor: 'default',
  },
});
