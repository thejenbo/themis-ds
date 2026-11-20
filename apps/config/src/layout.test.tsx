import { afterEach, describe, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { initialConfig } from './initial-config';
import { chooseMenuItem, cleanup, preview, renderApp, sidebar, themeSelect, wait } from './test-utils';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const rect = (el: Element) => el.getBoundingClientRect();
/** Within a pixel: layout positions can land on half pixels. */
const near = (a: number, b: number) => Math.abs(a - b) <= 1;

describe('header', () => {
  test('the current page is marked and underlined; the underline slides to the other link', async () => {
    renderApp();
    const simulator = page.getByRole('link', { name: 'simulator' });
    const docs = page.getByRole('link', { name: 'components' });
    await expect.element(simulator).toHaveAttribute('aria-current', 'page');
    const indicator = () => document.querySelector('nav span[aria-hidden]')!;
    await expect.poll(() => near(rect(indicator()).left, rect(simulator.element()).left)).toBe(true);

    await docs.click();
    await expect.element(docs).toHaveAttribute('aria-current', 'page');
    // It animates (like the Tabs indicator) rather than jumping.
    expect(getComputedStyle(indicator()).transitionProperty).toContain('translate');
    await expect.poll(() => near(rect(indicator()).left, rect(docs.element()).left)).toBe(true);
    await expect.poll(() => near(rect(indicator()).width, rect(docs.element()).width)).toBe(true);
    await expect.element(page.getByText('The components view is coming soon.')).toBeVisible();
  });
});

describe('header links', () => {
  test('"docs" opens the full Storybook in a new tab, and says so', async () => {
    renderApp();
    const docs = page.getByRole('link', { name: 'docs (opens in a new tab)' });
    await expect.element(docs).toHaveAttribute('target', '_blank');
    await expect.element(docs).toHaveAttribute('rel', 'noopener noreferrer');
    expect(docs.element().getAttribute('href')).toMatch(/^https?:\/\//);
    expect(docs.element().querySelector('svg')).not.toBeNull();
    // It's not one of the tool's pages, so it never gets the current-page underline.
    expect(docs.element().getAttribute('aria-current')).toBeNull();
  });

  test('the "Themis Config" wordmark is 24px at every width', async () => {
    renderApp();
    const wordmark = page.getByText('Themis Config', { exact: true });
    await expect.element(wordmark).toBeVisible();
    expect(getComputedStyle(wordmark.element()).fontSize).toBe('24px');
  });
});

describe('sidebar', () => {
  test('section headings use the small heading size (Figma type/heading/sm)', async () => {
    renderApp();
    const colors = page.getByRole('heading', { name: 'Colors' });
    await expect.element(colors).toBeVisible();
    const size = parseFloat(getComputedStyle(colors.element()).fontSize);
    // type/heading/sm: 16px, or 18px on wider screens (it was md, a step too big).
    expect([16, 18]).toContain(size);
  });

  test('a section closes to a one-line summary, and stays closed on the next visit', async () => {
    renderApp();
    const borders = page.getByRole('button', { name: 'Borders' });
    const widthField = page.getByRole('complementary').getByRole('button', { name: /Medium - Distinct/ });
    await expect.element(borders).toHaveAttribute('aria-expanded', 'true');
    await expect.element(widthField).toBeVisible();
    await borders.click();
    await expect.element(page.getByRole('button', { name: /^Borders/ })).toHaveAttribute('aria-expanded', 'false');
    await expect.element(page.getByRole('button', { name: 'Borders Medium width • Medium radius' })).toBeVisible();
    // Its fields are hidden (and out of the accessibility tree) while it's closed.
    expect(widthField.query()).toBeNull();
    await wait(50);
    cleanup();
    // renderApp clears storage, so render directly over what was saved.
    const { createRoot } = await import('react-dom/client');
    const { App } = await import('./App');
    const host = document.body.appendChild(document.createElement('div'));
    const root = createRoot(host);
    root.render(<App />);
    await expect.element(page.getByRole('button', { name: /^Borders/ })).toHaveAttribute('aria-expanded', 'false');
    await expect.element(page.getByRole('button', { name: 'Colors' })).toHaveAttribute('aria-expanded', 'true');
    root.unmount();
    host.remove();
  });

  test('a closed Borders section says "No width • No radius" for the borderless, sharp levels', async () => {
    renderApp();
    const aside = page.getByRole('complementary');
    await aside.getByRole('button', { name: /Medium - Distinct/ }).click();
    await page.getByRole('option', { name: 'None - Borderless' }).click();
    await aside.getByRole('button', { name: /Medium - Balanced/ }).click();
    await page.getByRole('option', { name: 'None - Sharp' }).click();
    await page.getByRole('button', { name: 'Borders' }).click();
    await expect.element(page.getByRole('button', { name: 'Borders No width • No radius' })).toBeVisible();
  });

  test('a closed Colors section still says when a colour fails contrast', async () => {
    renderApp();
    await page.getByRole('textbox', { name: /^Brand/ }).fill('#FFFF00');
    await userEvent.keyboard('{Tab}');
    await page.getByRole('button', { name: 'Colors' }).click();
    await expect.element(page.getByRole('button', { name: 'Colors Fail' })).toBeVisible();
  });

  test('section headings stick below the theme row while their section scrolls past', async () => {
    renderApp();
    const aside = await sidebar();
    const row = aside.firstElementChild!;
    const colors = page.getByRole('heading', { name: 'Colors' }).element();
    aside.scrollTop = 300;
    await wait(50);
    expect(near(rect(colors).top, rect(row).bottom)).toBe(true);
  });

  test('an open section’s heading has no line until it’s stuck, then a full-width bottom border until it’s scrolled away', async () => {
    renderApp();
    const aside = await sidebar();
    const bar = aside.firstElementChild!;
    // A short window, so the sidebar can scroll far enough for Borders to reach the top.
    aside.style.maxHeight = '500px';
    const [colors, borders] = [...aside.querySelectorAll('h2')];
    const title = colors!.querySelector('button > span')!;
    const line = (h: Element) => getComputedStyle(h, '::after');
    // In place and open: no line under the heading (the section's line is under its content).
    await expect.poll(() => line(colors!).width).toBe('0px');
    expect(line(colors!).height).toBe('2px');
    expect(line(colors!).backgroundColor).toBe('rgb(0, 0, 0)');
    expect(line(colors!).bottom).toBe('0px');
    expect(Math.round(rect(colors!).bottom - rect(title).bottom)).toBe(10);
    // Stuck: across the whole heading (the sidebar's width), on its bottom edge.
    aside.scrollTop = 300;
    await expect.poll(() => line(colors!).width).toBe(`${aside.clientWidth}px`);
    expect(line(colors!).bottom).toBe('0px');
    expect(line(colors!).left).toBe('0px');
    expect(line(borders!).width).toBe('0px');
    // Borders arriving pushes Colors up under the theme row: it keeps its border until it's out of view.
    // (Borders 40px below the row leaves 24px of Colors showing.)
    const target = aside.scrollTop + rect(borders!).top - rect(bar).bottom - 40;
    aside.scrollTop = target;
    expect(aside.scrollTop).toBe(target);
    await wait(50);
    expect(rect(colors!).bottom).toBeGreaterThan(rect(bar).bottom);
    await expect.poll(() => line(colors!).width).toBe(`${aside.clientWidth}px`);
    // In the last few pixels it drops the border, which would sit right under the theme row's line (a double line).
    aside.scrollTop += rect(colors!).bottom - rect(bar).bottom - 6;
    await wait(50);
    expect(Math.round(rect(colors!).bottom - rect(bar).bottom)).toBe(6);
    await expect.poll(() => line(colors!).width).toBe('0px');
    // Scrolled back to the top, no line again. The widening is a short transition.
    aside.scrollTop = 0;
    await expect.poll(() => line(colors!).width).toBe('0px');
    expect(line(colors!).transitionDuration).toBe('0.1s');
    // And the theme row is drawn over the heading sliding under it.
    expect(Number(getComputedStyle(bar).zIndex)).toBeGreaterThan(Number(getComputedStyle(colors!).zIndex));
  });

  test('an open section has a line under its content (24px below the last field, 16px above the next title) that moves as it opens', async () => {
    renderApp();
    await sidebar();
    const panel = page.getByRole('group', { name: 'Colors' }).element();
    // The section's line, so it moves down with the content as the section opens.
    const section = panel.parentElement!;
    const line = getComputedStyle(section, '::after');
    expect(line.height).toBe('2px');
    expect(line.backgroundColor).toBe('rgb(0, 0, 0)');
    // Rounded ends, like the Tabs indicator (radius sm).
    expect(line.borderTopLeftRadius).not.toBe('0px');
    // Across the content width, like a closed section's line.
    const heading = page.getByRole('heading', { name: 'Colors' }).element();
    expect(line.width).toBe(`${heading.querySelector('button')!.offsetWidth}px`);
    expect(Math.round(rect(section).width)).toBe(heading.querySelector('button')!.offsetWidth);
    const lastField = page.getByRole('button', { name: /Pick the success color/ }).element();
    expect(Math.round(rect(section).bottom - 2 - rect(lastField).bottom)).toBe(24);
    const next = page.getByRole('heading', { name: 'Borders' }).element().querySelector('button > span')!;
    expect(Math.round(rect(next).top - rect(section).bottom)).toBe(16);
    // The panel's height animates, so the line moves with it. It reaches 8px past the fields, so their focus rings
    // aren't clipped.
    expect(getComputedStyle(panel).transitionProperty).toBe('height');
    // At the same speed as the shorter sections: the taller Colors panel takes longer than Borders, up to 500ms.
    const seconds = (el: Element) => parseFloat(getComputedStyle(el).transitionDuration);
    const bordersPanel = page.getByRole('group', { name: 'Borders' }).element();
    await expect.poll(() => seconds(panel)).toBeGreaterThan(seconds(bordersPanel));
    expect(seconds(panel)).toBeLessThanOrEqual(0.5);
    expect(seconds(bordersPanel)).toBeGreaterThanOrEqual(0.15);
    expect(Math.round(rect(panel).width - rect(section).width)).toBe(16);
    // Closing it: the same line, now under the heading. No line on the heading itself.
    await page.getByRole('button', { name: 'Colors' }).click();
    await expect.poll(() => Math.round(rect(section).bottom - rect(heading).bottom)).toBe(2);
    expect(getComputedStyle(heading, '::after').width).toBe('0px');
  });

  test('a closed section’s heading gets no border while it sticks; only open ones do', async () => {
    renderApp();
    const aside = await sidebar();
    aside.style.maxHeight = '500px';
    await page.getByRole('button', { name: 'Borders' }).click();
    const borders = page.getByRole('heading', { name: /^Borders/ }).element();
    const bar = aside.firstElementChild!;
    // Scroll until closed Borders reaches the theme row and sticks, being pushed up by Fonts.
    aside.scrollTop += rect(borders).top - rect(bar).bottom + 4;
    await expect.poll(() => borders.hasAttribute('data-stuck')).toBe(true);
    await wait(150);
    expect(getComputedStyle(borders, '::after').width).toBe('0px');
  });

  test('nothing in a section draws over the sticky headings (the colour code control did)', async () => {
    renderApp();
    await sidebar();
    const control = page.getByRole('radiogroup', { name: 'Color code for every field' }).element();
    // The control's outer border is a raised ::after (z-index 1, the same as the stuck headings), drawn later, so it
    // showed through a heading as the sidebar scrolled. Pseudo-elements can't be hit-tested, so check the cause: the
    // panel it sits in is its own stacking context, which keeps anything raised inside it below the headings.
    expect(getComputedStyle(control, '::after').zIndex).toBe('1');
    const panel = page.getByRole('group', { name: 'Colors' }).element();
    expect(panel.contains(control)).toBe(true);
    expect(getComputedStyle(panel).isolation).toBe('isolate');
    expect(getComputedStyle(page.getByRole('heading', { name: 'Colors' }).element()).zIndex).toBe('1');
  });

  test('closed sections: summary under the title, a full line under each, 16px to the next title (Figma 2437:2652)', async () => {
    renderApp();
    const aside = await sidebar();
    await page.getByRole('textbox', { name: /^Brand/ }).fill('#FFFF00');
    await userEvent.keyboard('{Tab}');
    for (const name of ['Colors', 'Borders', 'Fonts']) await page.getByRole('button', { name: new RegExp(`^${name}`) }).click();
    // Let the panels finish closing (their height animates, up to 500ms).
    await expect.poll(() => [...aside.querySelectorAll('h2')].every((h) => h.nextElementSibling?.getBoundingClientRect().height === 0)).toBe(true);
    await wait(100);
    // A closed panel keeps its padding under hidden="until-found"; that made closed headings 110px apart.
    const headings = [...aside.querySelectorAll('h2')];
    const titles = headings.map((h) => rect(h.querySelector('button > span:first-child')!));
    // The summary's text, inside its collapsing row (4px of padding above it).
    const summaries = headings.map((h) => rect(h.querySelector('button > span:nth-child(2) > span > span')!));
    expect(Math.round(titles[0]!.top - rect(aside.firstElementChild!).bottom)).toBe(24);
    // The summary sits under the title: 8px for the Colors dots and chip, 4px for the text ones.
    // (The Colors summary's extra 4px is padding inside it, so measure its Fail chip.)
    const chip = rect(headings[0]!.querySelector('button > span:nth-child(2) > span > span > span > :last-child')!);
    // (Text tops: the summary's first piece of text, below its padding.)
    const textTop = (i: number) => rect(headings[i]!.querySelector('button > span:nth-child(2) > span > span > *')!).top;
    const tops = [chip.top, textTop(1), textTop(2)];
    expect(tops.map((top, i) => Math.round(top - titles[i]!.bottom))).toEqual([8, 4, 4]);
    expect(summaries.map((s, i) => Math.round(s.left - titles[i]!.left))).toEqual([0, 0, 0]);
    for (const [i, h] of headings.entries()) {
      // 16px under the summary, then the section's 2px line across the content width.
      const section = h.parentElement!;
      // The last section has no line: Export's line is right below it.
      expect(getComputedStyle(section, '::after').content).toBe(headings[i + 1] ? '""' : 'none');
      expect(Math.round(rect(section).width)).toBe(h.querySelector('button')!.offsetWidth);
      expect(Math.round(rect(section).bottom - summaries[i]!.bottom)).toBe(headings[i + 1] ? 18 : 16);
      // Then 16px to the next title.
      if (headings[i + 1]) expect(Math.round(titles[i + 1]!.top - rect(section).bottom)).toBe(16);
    }
    // The chevron is centred on the title and summary together.
    const chevron = rect(headings[1]!.querySelector('[aria-hidden="true"]')!);
    expect(Math.abs((chevron.top + chevron.bottom) / 2 - (titles[1]!.top + summaries[1]!.bottom) / 2)).toBeLessThan(1);
  });

  test('the lines under the theme row and above Export are full width, 2px and black like the other borders', async () => {
    renderApp();
    const aside = await sidebar();
    const footer = aside.lastElementChild!;
    for (const line of [getComputedStyle(aside.firstElementChild!, '::after'), getComputedStyle(footer, '::before')]) {
      expect(line.width).toBe(`${aside.clientWidth}px`);
      expect(line.height).toBe('2px');
      expect(line.backgroundColor).toBe('rgb(0, 0, 0)');
    }
  });

  test('open sections: 16px under the heading, 24px between fields; 24px, a line, then 16px to the next heading', async () => {
    renderApp();
    const aside = await sidebar();
    const colors = aside.querySelector('h2')!;
    const control = page.getByRole('radiogroup', { name: 'Color code for every field' }).element();
    const label = (name: string) => [...aside.querySelectorAll('label')].find((l) => l.textContent?.startsWith(name))!;
    const brandLabel = label('Brand');
    const textLabel = label('Text');
    const brandSwatch = page.getByRole('button', { name: /Pick the brand color/ }).element();
    // 16px from the heading to the first field (24px between fields).
    expect(Math.round(rect(control).top - rect(colors).bottom)).toBe(16);
    expect(Math.round(rect(brandLabel).top - rect(control).bottom)).toBe(24);
    expect(Math.round(rect(textLabel).top - rect(brandSwatch).bottom)).toBe(24);
    const lastColor = page.getByRole('button', { name: /Pick the success color/ }).element();
    const borders = page.getByRole('button', { name: /^Borders/ }).element();
    // 24px below the last field, the 2px line, 16px to the next title (was 64px with no line, Figma 2437:2201).
    expect(Math.round(rect(borders).top - rect(lastColor).bottom)).toBe(24 + 2 + 16);
  });

  test('the theme row stays at the top while the sidebar scrolls', async () => {
    renderApp();
    const aside = await sidebar();
    const row = aside.firstElementChild!;
    expect(getComputedStyle(row).position).toBe('sticky');
    aside.scrollTop = 400;
    await wait(50);
    expect(aside.scrollTop).toBeGreaterThan(0);
    expect(near(rect(row).top, rect(aside).top)).toBe(true);
  });

  test('sits on the left, with Export pinned to its bottom edge', async () => {
    renderApp();
    const aside = await sidebar();
    expect(rect(aside).right).toBeLessThanOrEqual(rect(await preview()).left + 0.5);
    const exportButton = page.getByRole('complementary').getByRole('button', { name: 'Export' });
    await expect.element(exportButton).toBeVisible();
    // Full width inside the 24px padding, at the bottom however far the settings scroll.
    const footer = exportButton.element().parentElement!;
    expect(getComputedStyle(footer).position).toBe('sticky');
    expect(Math.round(rect(exportButton.element()).width)).toBe(Math.round(aside.clientWidth - 48));
    for (const top of [0, 9999]) {
      aside.scrollTop = top;
      await wait(50);
      expect(near(rect(footer).bottom, rect(aside).bottom)).toBe(true);
    }
  });

  test('the ✓ and ✕ buttons keep their 40px size next to the name field', async () => {
    renderApp();
    await chooseMenuItem('Add new theme');
    for (const name of ['Create theme', 'Cancel']) {
      const button = page.getByRole('button', { name, exact: true }).element();
      expect(Math.round(rect(button).width)).toBe(40);
    }
    // And nothing spills past the sidebar's padding.
    const cancel = rect(page.getByRole('button', { name: 'Cancel', exact: true }).element());
    const side = rect(await sidebar());
    expect(cancel.right).toBeLessThanOrEqual(side.right - 24 + 0.5);
  });
});

describe('border modes', () => {
  test('the tool’s own UI uses the "themis config" radius and width; the preview keeps the theme’s', async () => {
    // A saved theme that leaves width and radius out (as a hand-written theme file may).
    const plain = { colors: initialConfig.themes.light!.colors };
    renderApp({ saved: { config: { version: 1, themes: { plain } }, selected: 'plain' } });
    const exportButton = page.getByRole('button', { name: 'Export' });
    await expect.element(exportButton).toBeVisible();
    // themis config: radius md 4px, width sm 2px (the sidebar's edge).
    expect(getComputedStyle(exportButton.element()).borderTopLeftRadius).toBe('4px');
    expect(getComputedStyle(await sidebar()).borderInlineEndWidth).toBe('2px');
    // The preview's theme doesn't set them, so it gets medium (radius md 10px), not the tool's modes.
    const save = page.getByRole('main').getByRole('button', { name: 'Save Changes' });
    await expect.element(save).toBeVisible();
    expect(getComputedStyle(save.element()).borderTopLeftRadius).toBe('10px');
  });

  test('"themis config" isn’t offered as a width or radius for a theme', async () => {
    renderApp();
    for (const label of ['Width', 'Radius']) {
      await page.getByRole('complementary').getByRole('button', { name: new RegExp(label) }).click();
      await expect.poll(() => page.getByRole('option').elements().map((o) => o.textContent)).toHaveLength(4);
      expect(page.getByRole('option', { name: /themis config/i }).query()).toBeNull();
      await userEvent.keyboard('{Escape}');
    }
  });
});

describe('simulator', () => {
  test('the page has a 7% brand tint behind it', async () => {
    renderApp();
    const surface = (await preview()).firstElementChild!;
    // Light theme: 7% of #7406EB over white.
    await expect.poll(() => getComputedStyle(surface).backgroundColor).toMatch(/color\(srgb 0\.96\d* 0\.93\d* 0\.99\d*\)|rgb\(245, 237, 254\)/);
  });

  test('on a very dark background the tint goes up to 10%', async () => {
    renderApp();
    await themeSelect().click();
    await page.getByRole('option', { name: 'dark' }).click();
    const surface = (await preview()).firstElementChild!;
    // Dark theme: 10% of #EBBFF9 over black (7% would be 0.0645 0.0525 0.0683).
    await expect.poll(() => getComputedStyle(surface).backgroundColor).toMatch(/color\(srgb 0\.092\d* 0\.074\d* 0\.097\d*\)|rgb\(24, 19, 25\)/);
  });

  test('the scales art lightens a dark brand by 50%, and leaves a light one alone', async () => {
    renderApp();
    const art = async () => {
      await preview();
      return getComputedStyle(document.querySelector('[data-sim-part="scales"] svg path')!).fill;
    };
    // Light theme: #7406EB, halfway to white. Dark theme: #EBBFF8, as is.
    await expect.poll(art).toMatch(/color\(srgb 0\.72\d* 0\.5[01]\d* 0\.96\d*\)|rgb\(186, 13[01], 245\)/);
    await themeSelect().click();
    await page.getByRole('option', { name: 'dark' }).click();
    await expect.poll(art).toBe('rgb(235, 191, 248)');
  });

  test('the title has a 1px outline in the background colour, painted under the letters', async () => {
    renderApp();
    const title = page.getByRole('heading', { name: 'Settings Sim', level: 1 });
    await expect.element(title).toBeVisible();
    const style = getComputedStyle(title.element());
    expect(style.webkitTextStrokeWidth).toBe('2px');
    expect(style.webkitTextStrokeColor).toBe('rgb(255, 255, 255)');
    expect(style.paintOrder).toMatch(/^stroke/);
  });
});

describe('export', () => {
  test('shows the theme file, copies it with a toast, and downloads themis.theme.json', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({ writeText } as unknown as Clipboard);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderApp();
    await page.getByRole('button', { name: 'Export' }).click();
    const dialog = page.getByRole('dialog', { name: 'Export theme file' });
    await expect.element(dialog).toBeVisible();
    const json = JSON.parse(document.querySelector('pre')!.textContent!);
    expect(Object.keys(json.themes)).toEqual(['light', 'dark']);

    await dialog.getByRole('button', { name: 'Copy' }).click();
    expect(JSON.parse(writeText.mock.calls[0]![0])).toEqual(json);
    // Screen readers hear "Success: Theme file copied."
    await expect.element(page.getByText(/Theme file copied\./)).toBeVisible();

    await dialog.getByRole('button', { name: 'Download' }).click();
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('themis.theme.json');
  });
});
