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
const showSubscription = () => sim().getByRole('radio', { name: 'subscription' }).click();
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

  test('automatic payments save with their own button', async () => {
    renderApp();
    await showSubscription();
    await sim().getByText('Automatic Payments', { exact: true }).click();
    await sim().getByRole('button', { name: 'Save Changes' }).nth(1).click();
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
    await sim().getByText('premium active').hover();
    await expect
      .poll(() => page.getByRole('tooltip').query()?.textContent ?? '')
      .toMatch(/^Your plan will renew in \d+ days?\. To make changes, go to the subscription section\.$/);
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
