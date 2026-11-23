import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { initialConfig } from './initial-config';
import { chooseMenuItem, cleanup, renderApp, themeNames, themeSelect, wait } from './test-utils';

afterEach(cleanup);

const KEY = 'themis-config:v1';

describe('saving work in the browser', () => {
  test('changes are saved shortly after they are made', async () => {
    renderApp();
    await chooseMenuItem('Duplicate "light"');
    await userEvent.keyboard('{Enter}');
    await wait(500);
    const saved = JSON.parse(localStorage.getItem(KEY)!);
    expect(Object.keys(saved.config.themes)).toEqual(['light', 'dark', 'light copy']);
    expect(saved.selected).toBe('light copy');
  });

  test('saved work comes back on the next visit', async () => {
    const config = structuredClone(initialConfig);
    config.themes.sepia = { ...config.themes.light!, colors: { ...config.themes.light!.colors, brand: '#704214' } };
    renderApp({ saved: { config, selected: 'sepia' } });
    await expect.element(themeSelect()).toHaveTextContent('sepia');
    await expect.poll(themeNames).toEqual(['light', 'dark', 'sepia']);
    await expect.element(page.getByRole('textbox', { name: /Brand/ })).toHaveValue('#704214');
  });

  test('saved data that isn’t a valid theme file is ignored', async () => {
    renderApp({ saved: { config: { version: 9 } } });
    await expect.element(themeSelect()).toHaveTextContent('light');
    await expect.poll(themeNames).toEqual(['light', 'dark']);
  });

  test('a saved selection that no longer exists falls back to the first theme', async () => {
    renderApp({ saved: { config: initialConfig, selected: 'gone' } });
    await expect.element(themeSelect()).toHaveTextContent('light');
  });

  test('leaving the page while naming a new theme asks first; otherwise it doesn’t', async () => {
    renderApp();
    const leave = () => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(leave()).toBe(false);
    await chooseMenuItem('Add new theme');
    await expect.poll(leave).toBe(true);
    await userEvent.keyboard('{Escape}');
    await expect.poll(leave).toBe(false);
  });
});
