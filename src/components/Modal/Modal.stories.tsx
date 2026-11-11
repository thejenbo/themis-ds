import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';
import { Modal, ModalTrigger } from './Modal';
import docs from './Modal.docs';

const meta = {
  title: 'Overlays/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary }, story: { inline: false, height: '420px' } },
  },
  args: {
    title: 'Invite teammates',
    children: 'People you invite can see and edit every project in this workspace.',
    isOpen: true,
    onOpenChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    tone: { control: 'inline-radio', options: ['brand', 'danger'] },
    children: { control: 'text' },
    actions: { control: false },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const twoActions = (
  <>
    <Button variant="outline" slot="close">
      Cancel
    </Button>
    <Button slot="close">Send invites</Button>
  </>
);

/** Open by default so you can explore it. Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = { args: { actions: twoActions } };

/** Interaction test: a trigger button opens it, focus moves inside, Escape closes it and focus returns. */
export const OpenAndClose: Story = {
  tags: ['test-only', '!autodocs'],
  args: { isOpen: undefined },
  render: (args) => (
    <ModalTrigger>
      <Button>Invite teammates</Button>
      <Modal {...args} actions={twoActions} />
    </ModalTrigger>
  ),
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    const trigger = canvas.getByRole('button', { name: 'Invite teammates' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Invite teammates' });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true), { timeout: 3000 });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 3000 });
    await expect(trigger).toHaveFocus();
    // A button with slot="close" closes it too.
    await user.click(trigger);
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 3000 });
  },
};

/** No actions: a close button appears in the header. */
export const WithCloseButton: Story = {
  play: async ({ args }) => {
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

/** One action, no line above it. */
export const SingleAction: Story = {
  args: { hideActionBorder: true, actions: <Button slot="close">Got it</Button>, children: 'Your changes are saved automatically.', title: 'Autosave is on' },
};

/** Without a title, the modal needs `aria-label`. The close button sits at the top right of the content. */
export const WithoutTitle: Story = {
  args: { title: undefined, 'aria-label': 'Welcome', children: 'Welcome to Themis! Take a look around.' } as never,
  play: async () => {
    await expect(await screen.findByRole('dialog', { name: 'Welcome' })).toBeInTheDocument();
  },
};

/** small (400px), medium (560px, default) and large (800px). On narrow screens every size shrinks to fit. */
export const Sizes: Story = {
  args: { isOpen: undefined },
  render: (args) => (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <ModalTrigger key={size}>
          <Button variant="outline">{size}</Button>
          <Modal {...args} size={size} title={`A ${size} modal`} actions={twoActions} />
        </ModalTrigger>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'small' }));
    const dialog = await screen.findByRole('dialog');
    await expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(400);
  },
};

/**
 * Destructive confirmation: `tone="danger"` gives an error header, makes it an alert dialog and stops clicks
 * outside from closing it. Pair it with a danger-tone primary button that names the action.
 */
export const Danger: Story = {
  args: {
    tone: 'danger',
    size: 'small',
    title: 'Delete project?',
    children: '“Website redesign” and its 24 files will be deleted for everyone. You can\'t undo this.',
    actions: (
      <>
        <Button variant="outline" tone="neutral" slot="close">
          Cancel
        </Button>
        <Button tone="danger" slot="close">
          Delete project
        </Button>
      </>
    ),
  },
  play: async () => {
    await expect(await screen.findByRole('alertdialog', { name: 'Delete project?' })).toBeInTheDocument();
  },
};

/** Long content scrolls inside the modal; the header and actions stay in view. */
export const LongContent: Story = {
  args: {
    title: 'Terms of service',
    actions: twoActions,
    children: (
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} style={{ margin: '0 0 12px' }}>
            {i + 1}. These terms explain how you can use the service and what we expect from you.
          </p>
        ))}
      </>
    ),
  },
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Terms of service' });
    const box = dialog.getBoundingClientRect();
    await expect(box.bottom).toBeLessThanOrEqual(window.innerHeight);
    // The actions stay inside the visible modal; the content scrolls instead.
    const action = within(dialog).getByRole('button', { name: 'Send invites' }).getBoundingClientRect();
    await expect(action.bottom).toBeLessThanOrEqual(box.bottom);
    const content = dialog.querySelector('p')!.parentElement!;
    await expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
  },
};

/** Controlled with `isOpen` and `onOpenChange`; `actions` can be a function that receives `close`. */
export const Controlled: Story = {
  args: { isOpen: undefined },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [sent, setSent] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <Button onPress={() => setOpen(true)}>Invite teammates</Button>
        <span>{sent ? 'Invites sent.' : 'No invites sent yet.'}</span>
        <Modal
          {...args}
          isOpen={open}
          onOpenChange={setOpen}
          actions={(close) => (
            <>
              <Button variant="outline" onPress={close}>
                Cancel
              </Button>
              <Button
                onPress={() => {
                  setSent(true);
                  close();
                }}
              >
                Send invites
              </Button>
            </>
          )}
        />
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Invite teammates' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Send invites' }));
    await expect(canvas.getByText('Invites sent.')).toBeInTheDocument();
  },
};

/** Opened inside a ThemeProvider, the modal keeps that provider's theme. */
export const InDarkTheme: Story = {
  args: { actions: twoActions },
  render: (args) => (
    <ThemeProvider modes={{ colorTheme: 'dark demo' }}>
      <div style={{ padding: 16, minHeight: 360 }}>
        <Modal {...args} />
      </div>
    </ThemeProvider>
  ),
  play: async () => {
    const dialog = await screen.findByRole('dialog');
    await expect(dialog.closest('[data-themis-colortheme="dark demo"]')).not.toBeNull();
  },
};
