import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { fontChoiceFor, loadGoogleFonts, searchFonts } from './fonts/google-fonts';
import { cleanup, renderApp } from './test-utils';

afterEach(cleanup);

describe('the Google Fonts catalog', () => {
  test('has the whole library, most popular first, with each family’s weights', async () => {
    const fonts = await loadGoogleFonts();
    expect(fonts.length).toBeGreaterThan(1000);
    const montserrat = fonts.find((f) => f.family === 'Montserrat')!;
    expect(montserrat.category).toBe('sans-serif');
    expect(montserrat.weights).toEqual(expect.arrayContaining([400, 600, 700]));
  });

  test('a family with all of Themis’s weights is stored by name; one without gets its closest weights', async () => {
    const fonts = await loadGoogleFonts();
    const find = (name: string) => fonts.find((f) => f.family === name)!;
    expect(fontChoiceFor(find('Montserrat'))).toBe('Montserrat');
    // Lobster has only 400, so asking Google for 600 or 700 would fail the whole stylesheet request.
    expect(fontChoiceFor(find('Lobster'))).toEqual({ family: 'Lobster', weights: [400] });
    // Space Mono has 400 and 700: semibold takes the closest, 700.
    expect(fontChoiceFor(find('Space Mono'))).toEqual({ family: 'Space Mono', weights: [400, 700] });
  });

  test('search puts an exact name first, then names that start with it, then ones that contain it', async () => {
    const fonts = await loadGoogleFonts();
    const names = searchFonts(fonts, 'lobster').map((f) => f.family);
    expect(names[0]).toBe('Lobster');
    expect(names).toContain('Lobster Two');
    const mono = searchFonts(fonts, 'mono').map((f) => f.family);
    const firstContains = mono.findIndex((n) => !n.toLowerCase().startsWith('mono'));
    expect(mono.slice(0, firstContains).every((n) => n.toLowerCase().startsWith('mono'))).toBe(true);
    expect(searchFonts(fonts, '', 50)).toHaveLength(50);
  });
});

describe('the font fields', () => {
  test('search every Google font; choosing one updates the preview with only the weights it has', async () => {
    renderApp();
    const heading = page.getByRole('combobox', { name: 'Heading' });
    await expect.element(heading).toHaveValue('Playfair Display');
    // The box shows the chosen font in its own face…
    const boxFont = () => getComputedStyle(heading.element()).fontFamily;
    expect(boxFont()).toMatch(/^"Playfair Display", /);
    await heading.fill('lob');
    // …and a search in the tool's font.
    await expect.poll(boxFont).not.toMatch(/Playfair|Lobster/);
    // Only matches are listed while searching (not the current font).
    await expect.element(page.getByRole('option', { name: /^Lobster\b/ }).first()).toBeVisible();
    expect(page.getByRole('option', { name: /Playfair/ }).query()).toBeNull();
    // Each option's name is set in its own (renamed) preview face, never the real family name, so a partial preview face
    // can't stand in for a theme's full font.
    const name = [...document.querySelectorAll('[role=option] span')].find((el) => el.textContent === 'Lobster' && el.children.length === 0)!;
    expect(getComputedStyle(name).fontFamily).toMatch(/^"Themis preview Lobster", /);
    // Choose it from the keyboard: an exact name is listed first. (A click can land while the list redraws as the
    // catalog finishes loading under test load.)
    await heading.fill('Lobster');
    await expect.poll(() => page.getByRole('option').first().query()?.textContent ?? '').toBe('Lobsterdisplay');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect.element(heading).toHaveValue('Lobster');
    await expect.poll(boxFont).toMatch(/^"?Lobster"?, /);
    // The preview's heading font, and a stylesheet asking only for the weight Lobster has.
    await expect.poll(() => getComputedStyle(document.querySelector('main h1')!).fontFamily).toBe('Lobster');
    const links = [...document.querySelectorAll<HTMLLinkElement>('link[data-themis-fonts]')].map((l) => l.href);
    expect(links.some((href) => href.includes('family=Lobster:wght@400&'))).toBe(true);
    // Saved with the theme (the tool saves after a moment).
    await expect.poll(() => localStorage.getItem('themis-config:v1')).toContain('"heading":{"family":"Lobster","weights":[400]}');
  });

  test('leaving the box after typing, without choosing, puts the current font back', async () => {
    renderApp();
    const body = page.getByRole('combobox', { name: 'Body' });
    await expect.element(body).toHaveValue('Montserrat');
    await body.fill('zzzz');
    await expect.element(page.getByText('No Google Fonts match.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Tab}');
    await expect.element(body).toHaveValue('Montserrat');
  });
});
