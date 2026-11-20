import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { simToast } from './sim/useSimData';
import { cleanup, renderApp } from './test-utils';

afterEach(() => {
  simToast.clear();
  cleanup();
});

const sim = () => page.getByRole('main');
const toasts = () => page.getByRole('region', { name: 'Settings Sim notifications' });
const showSubscription = () => sim().getByRole('tab', { name: 'subscription' }).click();
/** Waits for a toast in the simulator's region to say `text`. */
const toastSays = (text: string) => expect.poll(() => toasts().query()?.textContent ?? '').toContain(text);

describe('Settings Sim: subscription (Figma 2422:36732)', () => {
  test('shows the plan, the payment method and five statements', async () => {
    renderApp();
    await showSubscription();
    await expect.element(sim().getByRole('heading', { name: 'Premium', level: 3 })).toBeVisible();
    await expect.element(sim().getByText(/^Renews automatically on /)).toBeVisible();
    const plans = sim().getByRole('group', { name: 'Plans' }).getByRole('button');
    expect(plans.elements().map((el) => el.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
    await expect.element(sim().getByText('your plan')).toBeVisible();
    // The chosen plan can't be turned off, so it has the default cursor (no hover or press either).
    const chosen = plans.elements()[2] as HTMLElement;
    expect(getComputedStyle(chosen).cursor).toBe('default');
    expect(getComputedStyle(plans.elements()[0]!).cursor).toBe('pointer');
    await expect.element(sim().getByText('Visa', { exact: true })).toBeVisible();
    await expect.element(sim().getByText('Expires 12/28')).toBeVisible();
    expect(sim().getByRole('table', { name: 'Statements' }).getByRole('row').elements()).toHaveLength(5);
  });

  test('changing the plan saves it, confirms with a toast, and is still there after a reload', async () => {
    renderApp();
    await showSubscription();
    await sim().getByRole('button', { name: /^Growth/ }).click();
    await sim().getByRole('radio', { name: 'Yearly (save 20%)' }).click();
    // 20% off, per month.
    await expect.element(sim().getByText('$8', { exact: true })).toBeVisible();
    await sim().getByRole('button', { name: 'Save Changes' }).first().click();
    await toastSays('You’re on Growth, billed yearly.');
    await expect.element(sim().getByRole('heading', { name: 'Growth', level: 3 })).toBeVisible();
    await expect.element(sim().getByText('growth active')).toBeVisible();

    renderApp({ keepStorage: true });
    await showSubscription();
    await expect.element(sim().getByRole('heading', { name: 'Growth', level: 3 })).toBeVisible();
    await expect.element(sim().getByRole('radio', { name: 'Yearly (save 20%)' })).toBeChecked();
  });

  test('the payment modal checks each field, then updates the card shown', async () => {
    renderApp();
    await showSubscription();
    await sim().getByRole('button', { name: 'Update', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Update Payment Method' });
    await expect.element(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Update' }).click();
    await expect.element(dialog.getByText('Enter the name on the card.')).toBeVisible();
    await expect.element(dialog.getByText('Enter the card number.')).toBeVisible();
    await toastSays('Some fields need fixing. They’re marked in red.');

    await dialog.getByRole('textbox', { name: 'Name on Card' }).fill('Ada Lovelace');
    await dialog.getByRole('textbox', { name: 'Card Number' }).fill('5555 5555 5555 4444');
    await dialog.getByRole('textbox', { name: 'Expiry' }).fill('13/40');
    await dialog.getByRole('textbox', { name: 'Security Code' }).fill('12');
    await dialog.getByRole('textbox', { name: 'Zip Code' }).fill('94107');
    await expect.element(dialog.getByText('Months go from 01 to 12.')).toBeVisible();
    await expect.element(dialog.getByText('Enter the 3 or 4 digits.')).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Expiry' }).fill('4/40');
    await dialog.getByRole('textbox', { name: 'Security Code' }).fill('123');
    await dialog.getByRole('button', { name: 'Update' }).click();

    await expect.element(dialog).not.toBeInTheDocument();
    await toastSays('We’ll charge your Mastercard ending in 4444.');
    await expect.element(sim().getByText('Mastercard', { exact: true })).toBeVisible();
    await expect.element(sim().getByText('Expires 04/40')).toBeVisible();
    // Only the last four digits are kept.
    expect(localStorage.getItem('themis-config:sim')).not.toContain('5555');
  });

  test('automatic payments save as soon as they change (no Save button)', async () => {
    renderApp();
    await showSubscription();
    const payment = sim().getByRole('group', { name: 'Payment Method' });
    await expect.element(payment).toBeVisible();
    expect(payment.getByRole('button', { name: 'Save Changes' }).query()).toBeNull();
    await sim().getByText('Automatic Payments', { exact: true }).click();
    await toastSays('Automatic payments are off.');
    await expect.element(sim().getByText(/^Payment due on /)).toBeVisible();
  });
});

describe('Settings Sim: account', () => {
  test('the profile needs a display name, then saves it and keeps it', async () => {
    renderApp();
    await sim().getByRole('button', { name: 'Save Changes' }).click();
    await expect.element(sim().getByText('Enter a display name.')).toBeVisible();
    await toastSays('Changes not saved');
    await sim().getByRole('textbox', { name: 'Display Name' }).fill('  Taylor Brooks ');
    await expect.element(sim().getByText('Enter a display name.')).not.toBeInTheDocument();
    await sim().getByRole('button', { name: 'Save Changes' }).click();
    await toastSays('Your profile now shows as Taylor Brooks.');
    await expect.element(sim().getByRole('img', { name: /Taylor Brooks/ })).toBeVisible();

    renderApp({ keepStorage: true });
    await expect.element(sim().getByRole('textbox', { name: 'Display Name' })).toHaveValue('Taylor Brooks');
  });

  test('the avatar image uploads, then can be updated or deleted (after a confirmation)', async () => {
    renderApp();
    const avatarSection = sim().getByRole('group', { name: 'Avatar' });
    await expect.element(avatarSection.getByRole('button', { name: 'Upload Image' })).toBeVisible();
    expect(avatarSection.getByRole('button', { name: 'Delete Image' }).query()).toBeNull();

    const canvas = Object.assign(document.createElement('canvas'), { width: 40, height: 30 });
    canvas.getContext('2d')!.fillRect(0, 0, 40, 30);
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'));
    const input = document.querySelector('main input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File([blob], 'me.png', { type: 'image/png' }));
    await toastSays('Avatar image uploaded.');
    await expect.element(avatarSection.getByRole('button', { name: 'Update Image' })).toBeVisible();
    expect(localStorage.getItem('themis-config:sim')).toContain('data:image/jpeg');

    await avatarSection.getByRole('button', { name: 'Delete Image' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete image?' });
    await expect.element(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Yes, Delete Image' }).click();
    await toastSays('Avatar image deleted.');
    await expect.element(avatarSection.getByRole('button', { name: 'Upload Image' })).toBeVisible();
    expect(avatarSection.getByRole('button', { name: 'Delete Image' }).query()).toBeNull();
  });

  test('the online indicator saves as soon as it changes, and the dot follows it', async () => {
    renderApp();
    const avatarSection = sim().getByRole('group', { name: 'Avatar' });
    await expect.element(avatarSection.getByRole('switch', { name: /Online Indicator/ })).toBeChecked();
    await avatarSection.getByText('Online Indicator', { exact: true }).click();
    await toastSays('Others can’t see when you’re online.');
    renderApp({ keepStorage: true });
    await expect.element(sim().getByRole('switch', { name: /Online Indicator/ })).not.toBeChecked();
  });

  test('the email can be updated in a modal, which checks the address', async () => {
    renderApp();
    await sim().getByRole('button', { name: 'Update', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Update Email' });
    await dialog.getByRole('textbox', { name: 'Email' }).fill('not an email');
    await dialog.getByRole('button', { name: 'Update' }).click();
    await expect.element(dialog.getByText('Enter an email address like name@example.com.')).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Email' }).fill('taylor@example.com');
    await userEvent.keyboard('{Enter}');
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(sim().getByText('taylor@example.com')).toBeVisible();
  });

  test('privacy switches save straight away', async () => {
    renderApp();
    await sim().getByText('Public Profile', { exact: true }).click();
    await toastSays('Your profile is private.');
    renderApp({ keepStorage: true });
    await expect.element(sim().getByRole('switch', { name: /Public Profile/ })).not.toBeChecked();
  });

  test('deleting the account asks first, then fails with a demo toast (Figma 2424:37704)', async () => {
    renderApp();
    await sim().getByRole('button', { name: 'Delete Forever' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Are you sure?' });
    await expect.element(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'No, Close' }).click();
    await expect.element(dialog).not.toBeInTheDocument();

    await sim().getByRole('button', { name: 'Delete Forever' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Yes, Delete Account' }).click();
    await toastSays('Account deletion failed');
    await toastSays('Your account could not be deleted because this is just a demo :-)');
  });
});

describe('Settings Sim: page', () => {
  test('the plan chip shows when the plan renews, on hover or focus (Figma 2424:37702)', async () => {
    renderApp();
    // React Aria ignores the first hover after the page loads, until the pointer has moved, as a real one would have.
    await sim().getByRole('heading', { name: 'Settings Sim' }).hover();
    await sim().getByRole('button', { name: 'About your plan' }).hover();
    await expect
      .poll(() => page.getByRole('tooltip').query()?.textContent ?? '')
      .toMatch(/^Your plan will renew in \d+ days?\. To make changes, go to the subscription section\.$/);
    // The arrow points at the info icon, not the middle of the chip.
    const offset = () => {
      const arrow = page.getByRole('tooltip').element().querySelector('svg')!.getBoundingClientRect();
      const icon = sim().getByRole('button', { name: 'About your plan' }).element().querySelector('svg')!.getBoundingClientRect();
      return Math.abs(arrow.left + arrow.width / 2 - (icon.left + icon.width / 2));
    };
    await expect.poll(offset).toBeLessThan(1.5);
  });

  test('the scales stay at the bottom of the preview as it scrolls', async () => {
    renderApp();
    await expect.element(sim().getByRole('heading', { name: 'Settings Sim' })).toBeVisible();
    const art = document.querySelector('[data-sim-part="scales"] > svg') as Element;
    expect(art).not.toBeNull();
    let scroller: HTMLElement | null = document.querySelector('main');
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
    const bottomOf = (el: Element) => Math.round(el.getBoundingClientRect().bottom);
    const viewBottom = () => Math.min(bottomOf(scroller!), window.innerHeight);
    expect(bottomOf(art)).toBe(viewBottom());
    scroller!.scrollTop = 300;
    await new Promise((r) => setTimeout(r, 50));
    expect(bottomOf(art)).toBe(viewBottom());
  });
});

describe('Settings Sim: narrow screens', () => {
  afterEach(async () => {
    await page.viewport(1440, 1000);
  });
  const rect = (el: Element) => el.getBoundingClientRect();
  const uploadImage = async () => {
    const canvas = Object.assign(document.createElement('canvas'), { width: 20, height: 20 });
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'));
    await userEvent.upload(document.querySelector('main input[type="file"]') as HTMLInputElement, new File([blob], 'me.png', { type: 'image/png' }));
  };

  test('on phones, the image buttons drop "Image", sit 8px apart at the end of the row, and keep their full names', async () => {
    await page.viewport(402, 874);
    renderApp();
    await page.getByRole('radio', { name: 'Preview' }).click();
    await uploadImage();
    const update = sim().getByRole('button', { name: 'Update Image' });
    const remove = sim().getByRole('button', { name: 'Delete Image' });
    await expect.element(remove).toBeVisible();
    // What's shown (the hidden "Image" still counts in textContent).
    expect((update.element() as HTMLElement).innerText).toBe('Update');
    expect((remove.element() as HTMLElement).innerText).toBe('Delete');
    expect(Math.round(rect(remove.element()).left - rect(update.element()).right)).toBe(8);
    // Both on the avatar's line, ending where the switch ends.
    const toggle = sim().getByRole('switch', { name: /Online Indicator/ }).element().closest('label')!;
    expect(Math.round(rect(remove.element()).right)).toBe(Math.round(rect(toggle).right));
  });

  test('on desktop, the image buttons keep "Image"', async () => {
    renderApp();
    await uploadImage();
    const remove = sim().getByRole('button', { name: 'Delete Image' });
    await expect.element(remove).toBeVisible();
    expect((remove.element() as HTMLElement).innerText.replace(/\s/g, '')).toBe('DeleteImage');
  });

  test('the plan chip’s info icon is Chip’s 12px size', async () => {
    renderApp();
    const button = sim().getByRole('button', { name: 'About your plan' });
    await expect.element(button).toBeVisible();
    const icon = button.element().querySelector('svg')!;
    expect(Math.round(icon.getBoundingClientRect().width)).toBe(12);
  });

  test('on a wider phone (500px), the card’s Update still sits at the end of its row', async () => {
    await page.viewport(500, 874);
    renderApp();
    await page.getByRole('radio', { name: 'Preview' }).click();
    await sim().getByRole('tab', { name: 'subscription' }).click();
    const card = sim().getByRole('button', { name: 'Update', exact: true });
    await expect.element(card).toBeVisible();
    const toggle = sim().getByRole('switch', { name: /Automatic Payments/ }).element().closest('label')!;
    expect(Math.round(rect(card.element()).right)).toBe(Math.round(rect(toggle).right));
  });

  test('on phones, the Update buttons sit at the end of their rows', async () => {
    await page.viewport(402, 874);
    renderApp();
    await page.getByRole('radio', { name: 'Preview' }).click();
    const end = (name: string | RegExp) => Math.round(rect(sim().getByRole('switch', { name }).element().closest('label')!).right);
    const email = sim().getByRole('button', { name: 'Update', exact: true });
    await expect.element(email).toBeVisible();
    expect(Math.round(rect(email.element()).right)).toBe(end(/Two Factor/));
    await sim().getByRole('tab', { name: 'subscription' }).click();
    const card = sim().getByRole('button', { name: 'Update', exact: true });
    await expect.element(card).toBeVisible();
    expect(Math.round(rect(card.element()).right)).toBe(end(/Automatic Payments/));
  });

  test('plan cards are three across, or full width one per row: never two and one', async () => {
    renderApp();
    await sim().getByRole('tab', { name: 'subscription' }).click();
    const cards = () => sim().getByRole('group', { name: 'Plans' }).getByRole('button').elements().map((el) => rect(el));
    await expect.poll(() => new Set(cards().map((r) => Math.round(r.top))).size).toBe(1);
    for (const width of [834, 600, 402]) {
      await page.viewport(width, 1000);
      // Under 48em the tool shows the settings or the preview, one at a time.
      if (width < 768 && !page.getByRole('radio', { name: 'Preview' }).query()?.matches(':checked')) {
        await page.getByRole('radio', { name: 'Preview' }).click();
      }
      // The view stays on subscription through every layout change.
      await expect.element(sim().getByRole('tab', { name: 'subscription' })).toHaveAttribute('aria-selected', 'true');
      await expect.poll(() => new Set(cards().map((r) => Math.round(r.top))).size).toBe(width === 834 ? 1 : 3);
      if (width !== 834) {
        const group = rect(sim().getByRole('group', { name: 'Plans' }).element());
        for (const r of cards()) expect(Math.round(r.width)).toBe(Math.round(group.width));
      }
    }
  });

  test('on tablets the sections fill the width; on desktop they stop at 768px', async () => {
    renderApp();
    const accordion = () => sim().getByRole('button', { name: 'Avatar' }).element().closest('h2')!.parentElement!;
    await expect.element(sim().getByRole('button', { name: 'Avatar' })).toBeVisible();
    expect(Math.round(rect(accordion()).width)).toBe(768);
    await page.viewport(834, 1112);
    await expect.poll(() => Math.round(rect(accordion()).width)).toBe(834 - 2 * 24);
  });
});
