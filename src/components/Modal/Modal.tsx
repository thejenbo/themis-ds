import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useCallback, useState } from 'react';
import { useFocusRing } from 'react-aria';
import {
  Dialog,
  DialogTrigger,
  Heading,
  Modal as AriaModal,
  ModalOverlay,
  type ModalOverlayProps,
  type ModalRenderProps,
} from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing, scale } from '../../tokens/motion.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { dropShadow } from '../../tokens/shadows.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { racStyles } from '../../utils/stylex-rac';
import { IconButton } from '../IconButton';
import { Icon } from '../Icon';

export type ModalSize = 'small' | 'medium' | 'large';
export type ModalTone = 'brand' | 'danger';

interface ModalBaseProps extends Omit<ModalOverlayProps, 'className' | 'style' | 'children'> {
  /** The modal's content. */
  children: ReactNode;
  /**
   * Buttons shown at the bottom, right-aligned. Put the secondary action first and the primary action last.
   * Give a cancel button `slot="close"` to close the modal, or pass a function that receives `close`.
   */
  actions?: ReactNode | ((close: () => void) => ReactNode);
  /**
   * Show a close (×) button: in the header, or at the top right of the content when there's no title.
   * Escape always closes the modal, whether or not this is shown.
   * @default true when there are no `actions`, false otherwise
   */
  showCloseButton?: boolean;
  /**
   * Accessible name of the close button.
   * @default 'Close'
   */
  closeLabel?: string;
  /** Remove the line above the actions. */
  hideActionBorder?: boolean;
  /**
   * Width. `small` (400px) for confirmations and short messages, `medium` (560px) for forms and most modals,
   * `large` (800px) for rich content. On narrow screens every size shrinks to fit.
   * @default 'medium'
   */
  size?: ModalSize;
  /**
   * Header colour. `danger` (error colour) is for destructive confirmations such as "Delete project?"; it also
   * makes the modal an alert dialog and stops clicks outside from closing it.
   * @default 'brand'
   */
  tone?: ModalTone;
  /**
   * `alertdialog` for urgent messages that need a response, announced straight away by screen readers.
   * @default 'alertdialog' for the danger tone, 'dialog' otherwise
   */
  role?: 'dialog' | 'alertdialog';
  /**
   * Whether clicking outside the modal closes it. Escape still closes it either way.
   * @default true, or false for the danger tone and alert dialogs
   */
  isDismissable?: boolean;
}

interface ModalWithTitle {
  /** The header text. Also the modal's accessible name. */
  title: ReactNode;
  /** Only needed if the title isn't plain text. */
  'aria-label'?: string;
}

interface ModalWithoutTitle {
  title?: undefined;
  /** Required without a title: the modal's accessible name, announced when it opens. */
  'aria-label': string;
}

export type ModalProps = ModalBaseProps & (ModalWithTitle | ModalWithoutTitle);

/**
 * A dialog shown on top of the page, which people must respond to or close before going back.
 * Built on React Aria `ModalOverlay`, `Modal` and `Dialog`: focus moves into the modal and stays there,
 * the page behind can't be scrolled or reached by screen readers, and focus returns to the trigger on close.
 *
 * Open it with `ModalTrigger` (wrap a Button and the Modal), or control it with `isOpen` and `onOpenChange`.
 */
export function Modal({
  title,
  children,
  actions,
  showCloseButton = actions == null,
  closeLabel = 'Close',
  hideActionBorder = false,
  size = 'medium',
  tone = 'brand',
  role = tone === 'danger' ? 'alertdialog' : 'dialog',
  isDismissable = role !== 'alertdialog',
  'aria-label': ariaLabel,
  ...props
}: ModalProps) {
  const hasTitle = title != null;
  const scroll = useScrollableRegion();
  return (
    <ModalOverlay
      {...props}
      isDismissable={isDismissable}
      {...racStyles<ModalRenderProps>((s) => [styles.overlay, s.isEntering && styles.fadeIn, s.isExiting && styles.fadeOut])}
    >
      <AriaModal
        {...racStyles<ModalRenderProps>((s) => [styles.modal, widths[size], s.isEntering && styles.popIn, s.isExiting && styles.popOut])}
      >
        <Dialog role={role} aria-label={ariaLabel} {...stylex.props(styles.dialog)}>
          {({ close }) => (
            <>
              {hasTitle && (
                <div {...stylex.props(styles.header, tones[tone])}>
                  <Heading slot="title" {...stylex.props(styles.title)}>
                    {title}
                  </Heading>
                  {showCloseButton && (
                    <IconButton size="micro" variant="subtle" tone="neutral-inverse" aria-label={closeLabel} onPress={close}>
                      <Icon name="x" />
                    </IconButton>
                  )}
                </div>
              )}
              <div {...stylex.props(styles.body, !hasTitle && styles.bodyAlone)}>
                <div
                  ref={scroll.ref}
                  {...scroll.props}
                  {...stylex.props(
                    styles.content,
                    !hasTitle && showCloseButton && styles.contentWithClose,
                    focusRing.base,
                    scroll.isFocusVisible && focusRing.visible,
                    scroll.isFocusVisible && focusRing.inset,
                  )}
                >
                  {!hasTitle && showCloseButton ? (
                    <>
                      <div {...stylex.props(styles.contentInner)}>{children}</div>
                      <IconButton size="micro" variant="subtle" tone="neutral" aria-label={closeLabel} onPress={close}>
                        <Icon name="x" />
                      </IconButton>
                    </>
                  ) : (
                    children
                  )}
                </div>
                {actions != null && (
                  <div {...stylex.props(styles.actions, hideActionBorder && styles.actionsNoBorder)}>
                    {typeof actions === 'function' ? actions(close) : actions}
                  </div>
                )}
              </div>
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}

/**
 * When the content overflows, it becomes a tab stop so keyboard users can scroll it with the arrow keys
 * (WCAG 2.1.1). It isn't one when everything fits, so there's no pointless extra tab stop.
 */
function useScrollableRegion() {
  const [isScrollable, setScrollable] = useState(false);
  const { focusProps, isFocusVisible } = useFocusRing();
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const check = () => setScrollable(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, []);
  return { ref, isFocusVisible, props: isScrollable ? { tabIndex: 0, ...focusProps } : {} };
}

/**
 * Opens a Modal from a button: put the trigger Button first and the Modal second.
 * React Aria `DialogTrigger`; focus returns to the button when the modal closes.
 */
export const ModalTrigger = DialogTrigger;


const fade = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const fadeAway = stylex.keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });
const pop = stylex.keyframes({
  from: { opacity: 0, transform: `scale(${scale.pressed})` },
  to: { opacity: 1, transform: 'scale(1)' },
});
const popAway = stylex.keyframes({
  from: { opacity: 1, transform: 'scale(1)' },
  to: { opacity: 0, transform: `scale(${scale.pressed})` },
});


const widths = stylex.create({
  small: { width: 'min(25rem, 100%)' },
  medium: { width: 'min(35rem, 100%)' },
  large: { width: 'min(50rem, 100%)' },
});

const tones = stylex.create({
  brand: { backgroundColor: color.brand },
  danger: { backgroundColor: color.stateError },
});

const styles = stylex.create({
  // The backdrop: Figma's Overlay (overlay-tint + 10px blur). Keeps spacing.sm at the sides and spacing.lg
  // above and below, so the modal never touches the screen edges.
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacing.lg,
    paddingInline: spacing.sm,
    backgroundColor: color.overlayTint,
    backdropFilter: { default: 'blur(10px)', '@media (prefers-reduced-transparency: reduce)': 'none' },
  },
  fadeIn: { animationName: fade, animationDuration: duration.base, animationTimingFunction: easing.standard },
  fadeOut: {
    animationName: fadeAway,
    animationDuration: duration.base,
    animationTimingFunction: easing.standard,
    animationFillMode: 'forwards',
  },
  modal: { display: 'flex', maxHeight: '100%', outline: 'none' },
  popIn: {
    animationName: { default: pop, '@media (prefers-reduced-motion: reduce)': fade },
    animationDuration: duration.base,
    animationTimingFunction: easing.standard,
  },
  popOut: {
    animationName: { default: popAway, '@media (prefers-reduced-motion: reduce)': fadeAway },
    animationDuration: duration.base,
    animationTimingFunction: easing.standard,
    animationFillMode: 'forwards',
  },
  dialog: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxHeight: '100%',
    borderRadius: radius.radiusMd,
    boxShadow: `${dropShadow.xDefault} ${dropShadow.yDefault} ${dropShadow.blurDefault} ${dropShadow.colorDefault}`,
    outline: 'none',
    // The outer border, drawn on top like Figma's inside stroke, so it adds no size (header 40px, content 150px).
    '::after': {
      content: "''",
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      borderRadius: 'inherit',
      borderStyle: 'solid',
      borderWidth: borderWidth.widthSm,
      borderColor: color.border,
      pointerEvents: 'none',
    },
  },
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
    borderStartStartRadius: radius.radiusMd,
    borderStartEndRadius: radius.radiusMd,
    color: color.textInverse,
  },
  title: {
    margin: 0,
    fontFamily: fontTheme.familyHeading,
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
    fontWeight: font.weightSemibold,
  },
  // Content and actions. Only the content scrolls, so the header and actions stay in view.
  body: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: color.background,
    color: color.text,
    borderEndStartRadius: radius.radiusMd,
    borderEndEndRadius: radius.radiusMd,
  },
  bodyAlone: { borderRadius: radius.radiusMd },
  content: {
    position: 'relative',
    // Figma: the content area is never shorter than 150px, so short messages don't look cramped.
    minHeight: '9.375rem',
    overflowY: 'auto',
    padding: spacing.sm,
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeSm,
    lineHeight: font.lineHeightSm,
    fontWeight: font.weightRegular,
  },
  contentWithClose: { display: 'flex', alignItems: 'flex-start', gap: spacing.xs },
  contentInner: { flexGrow: 1, minWidth: 0 },
  actions: {
    flexShrink: 0,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    // Figma's line is an inside stroke: take its width off the top padding (64px tall with small buttons).
    paddingBlockStart: `calc(${spacing.sm} - ${borderWidth.widthSm})`,
    paddingBlockEnd: spacing.sm,
    paddingInline: spacing.sm,
    borderTopStyle: 'solid',
    borderTopColor: color.border,
    borderTopWidth: borderWidth.widthSm,
  },
  actionsNoBorder: { borderTopWidth: 0, paddingBlockStart: 0 },
});
