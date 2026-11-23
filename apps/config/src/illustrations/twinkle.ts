import { type RefObject, useEffect } from 'react';

/**
 * The stars twinkle when the theme changes. The app announces each change with a window event, and each star plays a
 * short animation on its own element when it hears one, so nothing re-renders: the Settings Sim stays memoised, and a
 * colour slider stays quick. A star that's mid-twinkle carries on rather than restarting, so dragging a slider gives
 * a steady sparkle rather than a stutter.
 */
const EVENT = 'themis:theme-change';

export function announceThemeChange() {
  window.dispatchEvent(new Event(EVENT));
}

/** A twinkle: a quick swell and turn, then back. */
export const TWINKLE: Keyframe[] = [
  { transform: 'scale(1) rotate(0deg)', opacity: 1 },
  { transform: 'scale(1.3) rotate(18deg)', opacity: 0.75, offset: 0.4 },
  { transform: 'scale(0.92) rotate(0deg)', opacity: 1, offset: 0.75 },
  { transform: 'scale(1) rotate(0deg)', opacity: 1 },
];
export const TWINKLE_MS = 650;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Twinkles each of `refs` (an SVG group or element) when the theme changes, each a moment after the one before. */
export function useTwinkleOnThemeChange(refs: RefObject<Element | null>[], isOn = true) {
  useEffect(() => {
    if (!isOn) return;
    const onChange = () => {
      if (reducedMotion()) return;
      refs.forEach((ref, i) => {
        const el = ref.current;
        if (!el || el.getAnimations().some((a) => a.id === 'twinkle' && a.playState === 'running')) return;
        const animation = el.animate(TWINKLE, { duration: TWINKLE_MS, delay: i * 90, easing: 'ease-in-out' });
        animation.id = 'twinkle';
      });
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
    // The refs are stable (useRef); listing them would re-subscribe on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn]);
}
