import * as stylex from '@stylexjs/stylex';
import { createContext, type CSSProperties, type ReactNode, useContext } from 'react';
import { flushSync } from 'react-dom';
import {
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as AriaToastContent,
  UNSTABLE_ToastQueue as AriaToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
  UNSTABLE_ToastStateContext as AriaToastStateContext,
  type QueuedToast,
  type ToastRenderProps,
  type ToastState,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { dropShadow } from '../../tokens/shadows.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { racStyles } from '../../utils/stylex-rac';
import { Button, type ButtonTone } from '../Button';
import { IconButton } from '../IconButton';
import { Icon, type IconName } from '../Icon';

/*
 * React Aria's toast API is still marked UNSTABLE. It is only used in this file, behind Themis's own API
 * (`ToastRegion`, `createToastQueue`, `toast.show`), so an upstream change never reaches app code.
 */

export type ToastTone = 'info' | 'brand' | 'danger' | 'warning' | 'success';
export type ToastPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** Toasts stay at least this long (WCAG 2.2.1: enough time to read). */
export const MIN_TOAST_TIMEOUT = 5000;

export interface ToastAction {
  /** The button's label, e.g. "Undo" or "View". Keep it to one or two words. */
  label: string;
  /** Called when the button is pressed. The toast closes afterwards. */
  onAction: () => void;
}

export interface ToastProps {
  /**
   * Colour and meaning. `info` (neutral) for general updates, `brand` for product messages, `success` when
   * something worked, `warning` when something needs attention, `danger` when something failed.
   * @default 'info'
   */
  tone?: ToastTone;
  /** Short heading, e.g. "Changes saved". Shown in the tone colour. */
  title?: ReactNode;
  /** The message. If there is no `title`, this is also the toast's accessible name. */
  description: ReactNode;
  /**
   * Status icon before the first line. `true` shows the tone's built-in icon, `false` hides it, or pass your
   * own decorative icon.
   * @default true for info, warning, success and danger; false for brand
   */
  icon?: ReactNode | boolean;
  /** One optional action button, e.g. `{ label: 'Undo', onAction: restore }`. */
  action?: ToastAction;
  /**
   * Show the close (×) button. It can only be hidden on toasts that close by themselves (with a `timeout`);
   * otherwise it is always shown, so the toast can be dismissed.
   * @default true
   */
  showCloseButton?: boolean;
}

export interface ToastOptions extends ToastProps {
  /**
   * Milliseconds before the toast closes by itself. The timer pauses while the toast region is hovered or
   * focused. Values under 5000 are raised to 5000. `null` keeps the toast until it is closed.
   * @default 5000, or null for danger toasts and toasts with an action
   */
  timeout?: number | null;
  /** Called when the toast closes, whether by the user, its action or its timeout. */
  onClose?: () => void;
}

/** What the queue stores per toast: the content, with defaults resolved. */
interface ToastContent extends ToastProps {
  showCloseButton: boolean;
}

export interface ToastQueue {
  /** Shows a toast and returns its key, which `close` accepts. */
  show(options: ToastOptions): string;
  /** Closes one toast. */
  close(key: string): void;
  /** Closes every toast, including those waiting to be shown. */
  clear(): void;
}

export interface ToastQueueOptions {
  /**
   * How many toasts are shown at once. Newer toasts push older ones into a queue; they appear as others close.
   * @default 3
   */
  maxVisibleToasts?: number;
}

const queues = new WeakMap<ToastQueue, AriaToastQueue<ToastContent>>();

/**
 * Creates a queue of toasts. Most apps use the shared `toast` queue instead; create your own only when a part
 * of the app needs its own `ToastRegion` (for example an embedded widget).
 */
export function createToastQueue({ maxVisibleToasts = 3 }: ToastQueueOptions = {}): ToastQueue {
  const queue = new AriaToastQueue<ToastContent>({
    maxVisibleToasts,
    // Animate adding, removing and restacking with a view transition where the browser supports it.
    wrapUpdate: (fn) => {
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        // A newer update skips a running transition; that's expected, so don't report it as an error.
        document.startViewTransition(() => flushSync(fn)).ready.catch(() => {});
      } else {
        fn();
      }
    },
  });
  const api: ToastQueue = {
    show({ timeout, onClose, showCloseButton, ...content }) {
      const autoTimeout = content.tone === 'danger' || content.action ? null : MIN_TOAST_TIMEOUT;
      const resolved = timeout === undefined ? autoTimeout : timeout === null ? null : Math.max(timeout, MIN_TOAST_TIMEOUT);
      return queue.add(
        // A toast that never closes by itself always gets a close button.
        { ...content, showCloseButton: showCloseButton !== false || resolved === null },
        { timeout: resolved ?? undefined, onClose },
      );
    },
    close: (key) => queue.close(key),
    clear: () => queue.clear(),
  };
  queues.set(api, queue);
  return api;
}

/**
 * The app-wide toast queue. Call `toast.show({ ... })` from anywhere, and render one `<ToastRegion />` near the
 * root of the app to display it.
 */
export const toast: ToastQueue = createToastQueue();

/** Status words read before each toast, so the status isn't conveyed by colour alone. */
export type ToastStatusLabels = Partial<Record<ToastTone, string>>;

const defaultStatusLabels: ToastStatusLabels = { info: 'Info', success: 'Success', warning: 'Warning', danger: 'Error' };

interface RegionContextValue {
  queued: QueuedToast<ToastContent>;
  close: () => void;
  closeLabel: string;
  statusLabels: ToastStatusLabels;
  from: 'top' | 'bottom';
}
const RegionContext = createContext<RegionContextValue | null>(null);

export interface ToastRegionProps {
  /**
   * Corner the toasts appear in, 24px from the edges. On narrow screens (under 768px) toasts are full width and
   * only the top or bottom is used.
   * @default 'bottom-right'
   */
  placement?: ToastPlacement;
  /**
   * The queue to display.
   * @default the shared `toast` queue
   */
  queue?: ToastQueue;
  /**
   * Name of the region landmark that holds the toasts (F6 moves focus to it).
   * @default 'Notifications'
   */
  'aria-label'?: string;
  /**
   * Accessible name of each toast's close button.
   * @default 'Close'
   */
  closeLabel?: string;
  /**
   * Words read before each toast's text so screen readers hear the status, e.g. "Error: Couldn't save".
   * Brand toasts have none by default. Pass translations here.
   * @default { info: 'Info', success: 'Success', warning: 'Warning', danger: 'Error' }
   */
  statusLabels?: ToastStatusLabels;
}

/**
 * Displays toasts from a queue. Render one near the root of the app, inside the ThemeProvider.
 * Built on React Aria's ToastRegion: a landmark region (F6), with each toast announced to screen readers.
 */
export function ToastRegion({
  placement = 'bottom-right',
  queue = toast,
  'aria-label': ariaLabel,
  closeLabel = 'Close',
  statusLabels = defaultStatusLabels,
}: ToastRegionProps) {
  const ariaQueue = queues.get(queue);
  if (!ariaQueue) throw new Error('ToastRegion: `queue` must come from createToastQueue().');
  const from = placement.startsWith('top') ? 'top' : 'bottom';
  return (
    <>
      {/* React hoists this into <head> once, however many regions there are. */}
      <style href="themis-toast-transitions" precedence="default">
        {toastTransitionCss}
      </style>
      <AriaToastRegion queue={ariaQueue} aria-label={ariaLabel} {...stylex.props(styles.region, regionPlacement[placement])}>
        {({ toast: queued }) => (
          <RegionContext.Provider value={{ queued, close: () => ariaQueue.close(queued.key), closeLabel, statusLabels, from }}>
            <Toast {...queued.content} />
          </RegionContext.Provider>
        )}
      </AriaToastRegion>
    </>
  );
}

const previewState: ToastState<ToastContent> = {
  add: () => '',
  close: () => {},
  pauseAll: () => {},
  resumeAll: () => {},
  visibleToasts: [],
};

/**
 * Internal: renders a toast in place, outside a region, for the docs gallery and visual tests.
 * Not exported from the package; apps use `toast.show()`.
 */
export function ToastPreview(props: ToastProps & { id: string }) {
  const { id, ...content } = props;
  const queued = { key: `_preview-${id}`, content: { ...content, showCloseButton: content.showCloseButton ?? true } };
  return (
    <AriaToastStateContext.Provider value={previewState}>
      <RegionContext.Provider value={{ queued, close: () => {}, closeLabel: 'Close', statusLabels: defaultStatusLabels, from: 'bottom' }}>
        <Toast {...content} />
      </RegionContext.Provider>
    </AriaToastStateContext.Provider>
  );
}

const closeTone: Record<ToastTone, ButtonTone> = {
  info: 'neutral',
  brand: 'brand',
  danger: 'danger',
  warning: 'warning',
  success: 'success',
};

/**
 * A brief message about something that just happened, such as "Changes saved". Don't render it yourself:
 * show one with `toast.show({ ... })` and it appears in the `ToastRegion`. The props here are the options
 * `toast.show` accepts (plus `timeout` and `onClose`).
 */
export function Toast({ tone = 'info', title, description, icon, action, showCloseButton = true }: ToastProps) {
  const region = useContext(RegionContext);
  if (!region) throw new Error('Toast: show toasts with toast.show() and render a <ToastRegion />.');
  const { queued, close, closeLabel, statusLabels, from } = region;
  const iconNode = icon === true || (icon === undefined && tone !== 'brand') ? <Icon name={statusIcons[tone]} /> : icon || null;
  const status = statusLabels[tone];
  const prefix = status ? <span {...stylex.props(styles.visuallyHidden)}>{`${status}: `}</span> : null;
  const iconSlot = iconNode ? (
    <span aria-hidden="true" {...stylex.props(styles.icon, title != null ? styles.iconOnTitle : styles.iconOnMessage, toneText[tone])}>
      {iconNode}
    </span>
  ) : null;
  const rac = racStyles<ToastRenderProps<ToastContent>>((s) => [
    styles.toast,
    toastBorders[tone],
    focusRing.base,
    s.isFocusVisible && focusRing.visible,
  ]);
  // Each toast is its own view-transition group, so others slide into place when one leaves.
  const transition = {
    viewTransitionName: `themis-toast${queued.key}`,
    viewTransitionClass: `themis-toast themis-toast-from-${from}`,
  } as CSSProperties;
  return (
    <AriaToast
      toast={queued}
      data-themis-tone={tone}
      className={rac.className}
      style={(s) => ({ ...rac.style(s), ...transition })}
    >
      <span {...stylex.props(styles.surface)}>
        <AriaToastContent {...stylex.props(styles.text)}>
          {title != null ? (
            <>
              <span {...stylex.props(styles.line)}>
                {iconSlot}
                <Text slot="title" {...stylex.props(styles.title, toneText[tone])}>
                  {prefix}
                  {title}
                </Text>
              </span>
              <Text slot="description" {...stylex.props(styles.description)}>
                {description}
              </Text>
            </>
          ) : (
            <span {...stylex.props(styles.line)}>
              {iconSlot}
              {/* With no heading, the message names the toast. */}
              <Text slot="title" {...stylex.props(styles.description)}>
                {prefix}
                {description}
              </Text>
            </span>
          )}
        </AriaToastContent>
        {action && (
          <Button
            size="small"
            variant="outline"
            tone={closeTone[tone]}
            xstyle={styles.action}
            onPress={() => {
              action.onAction();
              close();
            }}
          >
            {action.label}
          </Button>
        )}
        {showCloseButton && (
          <span {...stylex.props(styles.closeSlot, title == null && styles.closeCentered)}>
            <IconButton slot="close" size="micro" variant="subtle" tone={closeTone[tone]} aria-label={closeLabel}>
              <Icon name="x" />
            </IconButton>
          </span>
        )}
      </span>
    </AriaToast>
  );
}

/** The icon each tone shows by default. Brand has none. */
const statusIcons: Record<ToastTone, IconName> = {
  info: 'info',
  brand: 'info',
  danger: 'circle-alert',
  warning: 'triangle-alert',
  success: 'circle-check',
};

// Same breakpoint as the typography tokens' mobile mode.
const NARROW = '@media (width < 48em)';
const edge = spacing.md;

const styles = stylex.create({
  region: {
    position: 'fixed',
    zIndex: 200,
    display: 'flex',
    gap: spacing.xs,
    outline: 'none',
    // Toasts are full width, minus the margins, on narrow screens.
    insetInline: { default: null, [NARROW]: edge },
  },
  toast: {
    position: 'relative',
    width: { default: '31.25rem', [NARROW]: '100%' },
    maxWidth: `calc(100vw - 2 * ${edge})`,
    borderRadius: radius.radiusMd,
    boxShadow: `${dropShadow.xDefault} ${dropShadow.yDefault} ${dropShadow.blurDefault} ${dropShadow.colorDefault}`,
    // The border, drawn on top like Figma's inside stroke, so it adds no size.
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      borderStyle: 'solid',
      borderWidth: borderWidth.widthMandatory,
      pointerEvents: 'none',
    },
  },
  surface: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    // Figma: never shorter than 48px, so one-line toasts fit a small Button.
    minHeight: '3rem',
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
    borderRadius: 'inherit',
    backgroundColor: color.background,
    color: color.text,
    fontFamily: fontTheme.familyBody,
  },
  text: {
    flexGrow: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  line: { display: 'flex', alignItems: 'flex-start', gap: spacing.xs },
  // As tall as the line it sits on (heading or message), so it's centred on that line and doesn't stretch it.
  icon: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
  },
  iconOnTitle: { height: font.lineHeightLabel },
  iconOnMessage: { height: font.lineHeightSm },
  // Figma type/label/base.
  title: {
    fontSize: font.sizeLabel,
    lineHeight: font.lineHeightLabel,
    fontWeight: font.weightSemibold,
  },
  // Figma type/body/base.
  description: {
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
    fontWeight: font.weightRegular,
  },
  action: { flexShrink: 0 },
  // Figma "Close Button Alignment": as tall as the row, with the × at the top, level with the heading.
  closeSlot: { flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'flex-start' },
  // One-line toasts: the × is centred on the text, which the row centres too (Figma has it 4px higher).
  closeCentered: { alignItems: 'center' },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

const safeTop = `calc(${edge} + env(safe-area-inset-top, 0px))`;
const safeBottom = `calc(${edge} + env(safe-area-inset-bottom, 0px))`;

/** The newest toast is always nearest the edge: first in the list for top placements, last for bottom ones. */
const regionPlacement = stylex.create({
  'top-left': { top: safeTop, left: edge, flexDirection: 'column' },
  'top-right': { top: safeTop, right: edge, flexDirection: 'column' },
  'bottom-left': { bottom: safeBottom, left: edge, flexDirection: 'column-reverse' },
  'bottom-right': { bottom: safeBottom, right: edge, flexDirection: 'column-reverse' },
});

const toastBorders = stylex.create({
  info: { '::after': { borderColor: color.border } },
  brand: { '::after': { borderColor: color.borderBrand } },
  danger: { '::after': { borderColor: color.stateError } },
  warning: { '::after': { borderColor: color.stateWarning } },
  success: { '::after': { borderColor: color.stateSuccess } },
});

/** Heading and icon colour. */
const toneText = stylex.create({
  info: { color: color.text },
  brand: { color: color.textBrand },
  danger: { color: color.stateError },
  warning: { color: color.stateWarning },
  success: { color: color.stateSuccess },
});

/*
 * View-transition animations. The ::view-transition pseudo-elements hang off the root element, so they're
 * styled with a global stylesheet; the motion tokens still apply because their variables are defined on :root.
 */
const toastTransitionCss = `
::view-transition-group(.themis-toast) {
  animation-duration: ${duration.slow};
  animation-timing-function: ${easing.standard};
}
::view-transition-new(.themis-toast):only-child {
  animation: ${duration.slow} ${easing.standard} both themis-toast-in;
}
::view-transition-new(.themis-toast-from-bottom):only-child {
  animation-name: themis-toast-in-bottom;
}
::view-transition-old(.themis-toast):only-child {
  animation: ${duration.base} ${easing.standard} both themis-toast-out;
}
@keyframes themis-toast-in { from { opacity: 0; transform: translateY(-100%); } }
@keyframes themis-toast-in-bottom { from { opacity: 0; transform: translateY(100%); } }
@keyframes themis-toast-out { to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(.themis-toast) { animation: none; }
  ::view-transition-new(.themis-toast):only-child,
  ::view-transition-new(.themis-toast-from-bottom):only-child { animation-name: themis-toast-fade-in; }
  @keyframes themis-toast-fade-in { from { opacity: 0; } }
}
`;
