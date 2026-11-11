import { useState } from 'react';
import type { PressEvent } from 'react-aria-components';

interface PressHandlers {
  onPressStart?: (e: PressEvent) => void;
  onPressEnd?: (e: PressEvent) => void;
}

/**
 * Whether the button is physically being pressed right now (pointer down or key held).
 *
 * React Aria's `isPressed` render prop is also true while a menu or popover the button opens is open (MenuTrigger
 * keeps its trigger "pressed"). That should keep the State Layer on, but not the press shrink, so the shrink uses
 * this instead. Pass the returned handlers to the React Aria Button; they call the consumer's own handlers too.
 */
export function usePressMotion({ onPressStart, onPressEnd }: PressHandlers) {
  const [isHeld, setHeld] = useState(false);
  return {
    isHeld,
    pressHandlers: {
      onPressStart: (e: PressEvent) => {
        setHeld(true);
        onPressStart?.(e);
      },
      onPressEnd: (e: PressEvent) => {
        setHeld(false);
        onPressEnd?.(e);
      },
    },
  };
}
