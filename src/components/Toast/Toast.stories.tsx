import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import {
  createToastQueue,
  Toast,
  type ToastOptions,
  type ToastPlacement,
  ToastPreview,
  ToastRegion,
  type ToastTone,
} from './Toast';
import docs from './Toast.docs';

/** Heading line + message line + Figma's padding (xs top and bottom) and gap (xs): 72px on mobile. */
const headingHeight = (toast: HTMLElement) => {
  const lh = (id: string | null) => parseFloat(getComputedStyle(document.getElementById(id!)!).lineHeight);
  return Math.round(lh(toast.getAttribute('aria-labelledby')) + lh(toast.getAttribute('aria-describedby')) + 24);
};

const TONES: ToastTone[] = ['info', 'brand', 'success', 'warning', 'danger'];
const PLACEMENTS: ToastPlacement[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];

/** A button that shows toasts in its own queue and region, so stories don't share toasts. */
function Demo({
  options,
  placement,
  label = 'Show toast',
  children,
}: {
  options: ToastOptions | (() => ToastOptions);
  placement?: ToastPlacement;
  label?: string;
  children?: ReactNode;
}) {
  const [queue] = useState(() => createToastQueue());
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      {children}
      <Button onPress={() => queue.show(typeof options === 'function' ? options() : options)}>{label}</Button>
      <ToastRegion queue={queue} placement={placement} />
    </div>
  );
}

const meta = {
  title: 'Feedback/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary }, story: { inline: false, height: '320px' } },
  },
  args: {
    tone: 'info',
    title: 'Changes saved',
    description: 'Your profile is up to date.',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
    title: { control: 'text' },
    description: { control: 'text' },
    icon: { control: 'boolean' },
    action: { control: false },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Use the controls to change the preview, then press the button to show it as a real toast in the bottom right.
 * In an app: `toast.show({ title, description, tone })`, plus one `<ToastRegion />` near the root.
 */
export const Playground: Story = {
  render: (args) => (
    <Demo options={args}>
      <ToastPreview id="playground" {...args} />
    </Demo>
  ),
};

/** Interaction test: the toast appears in a "Notifications" landmark, is announced, and × closes it. */
export const ShowAndClose: Story = {
  tags: ['test-only', '!autodocs'],
  render: (args) => <Demo options={{ ...args, timeout: null, onClose: onCloseSpy }} />,
  play: async ({ canvas }) => {
    onCloseSpy.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));
    const region = await canvas.findByRole('region', { name: /notification/i });
    const toast = await canvas.findByRole('alertdialog', { name: 'Info: Changes saved' });
    await expect(region).toContainElement(toast);
    await expect(toast).toHaveAccessibleDescription('Your profile is up to date.');
    await expect(toast.querySelector('[role="alert"]')).not.toBeNull();
    // Figma: 72px with a heading on mobile (two lines, xs padding and gap).
    await expect(Math.round(toast.getBoundingClientRect().height)).toBe(headingHeight(toast));
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull());
    await expect(onCloseSpy).toHaveBeenCalledTimes(1);
  },
};
const onCloseSpy = fn();

/** Interaction test: the action runs and closes the toast; toasts with an action keep their × even if asked not to. */
export const WithAction: Story = {
  args: { tone: 'danger', title: 'Project deleted', description: 'Moved to the bin.' },
  render: (args) => (
    <Demo options={{ ...args, showCloseButton: false, action: { label: 'Undo', onAction: onActionSpy } }} label="Delete project" />
  ),
  play: async ({ canvas }) => {
    onActionSpy.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Delete project' }));
    const toast = await canvas.findByRole('alertdialog', { name: 'Error: Project deleted' });
    // No timeout (danger + action), so the close button can't be hidden.
    await expect(canvas.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    await expect(Math.round(toast.getBoundingClientRect().height)).toBe(headingHeight(toast));
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(onActionSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull());
  },
};
const onActionSpy = fn();

/** Interaction test: info, brand, success and warning toasts close by themselves after 5 seconds. */
export const ClosesAfterFiveSeconds: Story = {
  tags: ['test-only', '!autodocs'],
  args: { tone: 'success', title: undefined, description: 'Invite sent.' },
  render: (args) => <Demo options={{ ...args, timeout: 1000, showCloseButton: false }} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));
    // Without a heading, the message names the toast.
    const toast = await canvas.findByRole('alertdialog', { name: 'Success: Invite sent.' });
    await expect(Math.round(toast.getBoundingClientRect().height)).toBe(48);
    // It closes by itself, so the × may be hidden.
    await expect(canvas.queryByRole('button', { name: 'Close' })).toBeNull();
    const shownAt = Date.now();
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull(), { timeout: 8000 });
    // The 1000ms asked for is raised to the 5 second minimum.
    await expect(Date.now() - shownAt).toBeGreaterThanOrEqual(4500);
  },
};

/** Up to 3 toasts at once, 8px apart, newest nearest the edge. Press the button a few times. */
export const Stacking: Story = {
  render: (args) => {
    let n = 0;
    return <Demo options={() => ({ ...args, timeout: null, title: `Upload ${++n} finished` })} label="Show another toast" />;
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Show another toast' });
    for (let i = 0; i < 4; i++) {
      await userEvent.click(button);
      await canvas.findByRole('alertdialog', { name: `Info: Upload ${i + 1} finished` });
    }
    const toasts = canvas.getAllByRole('alertdialog');
    await expect(toasts).toHaveLength(3);
    const [newest, , oldest] = toasts.map((t) => t.getBoundingClientRect());
    await expect(canvas.getAllByRole('alertdialog')[0]).toHaveAccessibleName('Info: Upload 4 finished');
    // Bottom placement: the newest is lowest, 24px from the bottom and right edges.
    await expect(newest!.top).toBeGreaterThan(oldest!.top);
    await expect(Math.round(window.innerHeight - newest!.bottom)).toBe(24);
    await expect(Math.round(window.innerWidth - newest!.right)).toBe(24);
    const [a, b] = toasts.slice(0, 2).map((t) => t.getBoundingClientRect());
    await expect(Math.round(a!.top - b!.bottom)).toBe(8);
    // Closing one shows the waiting toast.
    await userEvent.click(canvas.getAllByRole('button', { name: 'Close' })[0]!);
    await canvas.findByRole('alertdialog', { name: 'Info: Upload 1 finished' });
  },
};

/** Each placement, 24px from the screen edges. On screens under 768px toasts are full width at the top or bottom. */
export const Placements: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {PLACEMENTS.map((placement) => (
        <Demo key={placement} placement={placement} label={placement} options={{ ...args, title: placement, timeout: null }} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'top-left' }));
    const toast = await canvas.findByRole('alertdialog', { name: 'Info: top-left' });
    const box = toast.getBoundingClientRect();
    await expect(Math.round(box.top)).toBe(24);
    await expect(Math.round(box.left)).toBe(24);
    await expect(Math.round(box.width)).toBe(500);
  },
};

/** Every tone with and without a heading, icon, action and close button, mirroring the Figma "Toast" frame. */
export const Gallery: Story = {
  tags: ['!autodocs'],
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 500px)', gap: 16 }}>
      {TONES.map((tone) => (
        <div key={tone} style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <ToastPreview id={`${tone}-1`} {...args} tone={tone} title="Toast Heading" description="A friendly reminder :-)" icon={false} />
          <ToastPreview id={`${tone}-2`} {...args} tone={tone} title="Toast Heading" description="A friendly reminder :-)" icon />
          <ToastPreview id={`${tone}-3`} {...args} tone={tone} title={undefined} description="A friendly reminder :-)" showCloseButton={false} />
          <ToastPreview
            id={`${tone}-4`}
            {...args}
            tone={tone}
            title="Toast Heading"
            description="A friendly reminder :-)"
            icon
            action={{ label: 'Action', onAction: () => {} }}
          />
          <ToastPreview
            id={`${tone}-5`}
            {...args}
            tone={tone}
            title={undefined}
            description="A friendly reminder :-)"
            icon
            action={{ label: 'Action', onAction: () => {} }}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const toasts = canvas.getAllByRole('alertdialog').slice(0, 5);
    const heights = toasts.map((t) => Math.round(t.getBoundingClientRect().height));
    // Figma (mobile): 72, 72, 48, 72, 48. One-line toasts are at least 48px, or as tall as the action plus padding.
    const button = toasts[4]!.querySelector('button')!.getBoundingClientRect().height;
    const h = headingHeight(toasts[0]!);
    await expect(heights).toEqual([h, h, 48, h, Math.max(48, Math.round(button + 16))]);
    // One line with an action: the × is centred on the message, not at the top of the row.
    const middle = (el: Element) => { const r = el.getBoundingClientRect(); return Math.round(r.top + r.height / 2); };
    const oneLine = toasts[4]!;
    const message = document.getElementById(oneLine.getAttribute('aria-labelledby')!)!;
    await expect(middle(oneLine.querySelector('button[aria-label="Close"]')!)).toBe(middle(message));
  },
};

/** Each tone in each colour theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, 500px)' }}>
            <strong style={{ gridColumn: '1 / -1' }}>{theme}</strong>
            {TONES.map((tone) => (
              <ToastPreview
                key={tone}
                id={`${theme}-${tone}`.replace(/\W/g, '-')}
                {...args}
                tone={tone}
                title="Toast Heading"
                action={{ label: 'Action', onAction: () => {} }}
              />
            ))}
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
