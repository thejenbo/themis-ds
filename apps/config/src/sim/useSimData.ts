import { useCallback, useState } from 'react';
import { createToastQueue, type ToastOptions } from 'themis-ds';

import { loadSimData, saveSimData, type SimData } from './simData';

/**
 * The simulator's own toasts. Its region sits inside the preview, so they're drawn in the theme being edited, not
 * the tool's.
 */
export const simToast = createToastQueue();

/** Shows the "check the form" error toast. */
export function showInvalidToast() {
  simToast.show({ tone: 'danger', title: 'Changes not saved', description: 'Some fields need fixing. They’re marked in red.', timeout: 8000 });
}

export type UpdateSimData = (patch: Partial<SimData>, success: Pick<ToastOptions, 'title' | 'description'>) => boolean;

/**
 * The simulator's data, and `update`, which saves a change and confirms it with a toast (or shows an error toast
 * if the browser wouldn't store it, leaving what's shown as it was).
 */
export function useSimData(): [SimData, UpdateSimData] {
  const [data, setData] = useState(loadSimData);
  const update = useCallback<UpdateSimData>((patch, success) => {
    const next = { ...loadSimData(), ...patch };
    if (!saveSimData(next)) {
      simToast.show({
        tone: 'danger',
        title: 'Changes not saved',
        description: 'Your browser wouldn’t store them. Check that this site can save data, then try again.',
      });
      return false;
    }
    setData(next);
    simToast.show({ tone: 'success', ...success });
    return true;
  }, []);
  return [data, update];
}
