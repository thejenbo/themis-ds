import { Profiler, type ProfilerOnRenderCallback } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { expect } from 'vitest';
import { page } from 'vitest/browser';

import { App } from './App';

let root: Root | null = null;
let container: HTMLElement | null = null;

/**
 * Renders the config tool on a clean slate: nothing saved, on the simulator page. Pass `onRender` to profile how much
 * of the app each update renders, or `keepStorage` to come back to what's saved (like reloading the page).
 */
export function renderApp({
  saved,
  onRender,
  keepStorage = false,
}: { saved?: unknown; onRender?: ProfilerOnRenderCallback; keepStorage?: boolean } = {}) {
  cleanup();
  if (!keepStorage) localStorage.clear();
  if (saved !== undefined) localStorage.setItem('themis-config:v1', JSON.stringify(saved));
  history.replaceState(null, '', location.pathname);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  root.render(onRender ? <Profiler id="app" onRender={onRender}><App /></Profiler> : <App />);
}

export function cleanup() {
  root?.unmount();
  container?.remove();
  root = null;
  container = null;
}

/** The theme switcher's box (a button named by the "Theme" label and the chosen theme). */
export const themeSelect = () => page.getByRole('complementary').getByRole('button', { name: /Theme/ }).first();
export const themeActions = () => page.getByRole('button', { name: /^Actions for the/ });
export const menuItem = (name: string) => page.getByRole('menuitem', { name, exact: true });

/**
 * Theme names in the file, in order (read from the switcher's hidden native select, the one with "Add new theme").
 * Empty while a theme is being named, since the switcher is replaced by the name field then.
 */
export function themeNames() {
  const select = [...document.querySelectorAll('aside select')].find((s) =>
    [...(s as HTMLSelectElement).options].some((o) => o.textContent === 'Add new theme'),
  ) as HTMLSelectElement | undefined;
  return select ? [...select.options].map((o) => o.textContent ?? '').filter((t) => t.trim() && t !== 'Add new theme') : [];
}

/** The name field shown while naming a theme. */
export const nameField = () => page.getByRole('textbox', { name: /theme name/i });

export async function chooseMenuItem(name: string) {
  await themeActions().click();
  await menuItem(name).click();
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The sidebar and the preview, once the app has rendered. */
export async function sidebar() {
  const locator = page.getByRole('complementary', { name: 'Theme settings' });
  await expect.element(locator).toBeInTheDocument();
  return locator.element() as HTMLElement;
}
export async function preview() {
  const locator = page.getByRole('main');
  await expect.element(locator).toBeInTheDocument();
  return locator.element() as HTMLElement;
}
