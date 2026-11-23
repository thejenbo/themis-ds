import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { ActionMenu, ActionMenuItem, ActionMenuTrigger } from './ActionMenu';
import { Icon } from '../Icon';
import docs from './ActionMenu.docs';

/** The first argument of the last call to a mock (React Aria also passes a second, undefined argument). */
const lastActionKey = (mock: unknown) => (mock as { mock: { lastCall?: unknown[] } }).mock.lastCall?.[0];

/** Placeholder icons until the icon library exists. */

const items = (
  <>
    <ActionMenuItem id="rename" icon={<Icon name="heart" />}>
      Rename
    </ActionMenuItem>
    <ActionMenuItem id="duplicate" icon={<Icon name="copy" />}>
      Duplicate
    </ActionMenuItem>
    <ActionMenuItem id="archive" icon={<Icon name="folder" />} isDisabled>
      Archive
    </ActionMenuItem>
    <ActionMenuItem id="delete" icon={<Icon name="trash" />} isDanger>
      Delete
    </ActionMenuItem>
  </>
);

const meta = {
  title: 'Overlays/ActionMenu',
  component: ActionMenu,
  subcomponents: { ActionMenuTrigger, ActionMenuItem },
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary }, story: { inline: false, height: '280px' } },
  },
  args: { children: items, onAction: fn(), placement: 'bottom start' },
  argTypes: {
    placement: { control: 'inline-radio', options: ['bottom start', 'bottom end', 'top start', 'top end'] },
    children: { control: false },
  },
  render: (args) => (
    <div style={{ minHeight: 240 }}>
      <ActionMenuTrigger>
        <IconButton aria-label="Actions for Website redesign" variant="subtle" size="micro">
          <Icon name="ellipsis-vertical" />
        </IconButton>
        <ActionMenu {...args} />
      </ActionMenuTrigger>
    </div>
  ),
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Press the ⋮ button. Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Open from the start, mirroring the Figma "Action Menu Trigger" (opened) frame. */
export const Open: Story = {
  render: (args) => (
    <div style={{ minHeight: 240 }}>
      <ActionMenuTrigger defaultOpen>
        <IconButton aria-label="Actions for Website redesign" variant="subtle" size="micro">
          <Icon name="ellipsis-vertical" />
        </IconButton>
        <ActionMenu {...args} />
      </ActionMenuTrigger>
    </div>
  ),
  play: async () => {
    const menu = await screen.findByRole('menu');
    const items = await screen.findAllByRole('menuitem');
    // Figma: 32px items (on mobile; the label line grows on desktop), 4px apart.
    const line = parseFloat(getComputedStyle(items[0]!).lineHeight);
    await expect(Math.round(items[0]!.getBoundingClientRect().height)).toBe(Math.round(line + 8));
    await expect(Math.round(items[1]!.getBoundingClientRect().top - items[0]!.getBoundingClientRect().bottom)).toBe(4);
    await expect(menu).toBeInTheDocument();
  },
};

/** Interaction test: pressing the trigger opens the menu, choosing an action runs it and focus returns to the trigger. */
export const RunsAnAction: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Actions for Website redesign' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // While its menu is open, the trigger keeps its State Layer but not the press shrink.
    const surface = trigger.querySelector('[data-themis-part="surface"]')!;
    // Both waits cover a fade, which can run long when the whole suite is busy.
    await waitFor(() => expect(getComputedStyle(surface, '::before').opacity).toBe('1'), { timeout: 3000 });
    await expect(getComputedStyle(surface).transform).toBe('none');
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Duplicate' }));
    await expect(lastActionKey(args.onAction)).toBe('duplicate');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull(), { timeout: 3000 });
    await expect(trigger).toHaveFocus();
  },
};

/** Interaction test: keyboard opens it, arrows skip disabled items, typing jumps, Escape closes. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const rename = await screen.findByRole('menuitem', { name: 'Rename' });
    await waitFor(() => expect(rename).toHaveFocus());
    // Keyboard focus: highlighted and the dashed ring.
    await expect(getComputedStyle(rename, '::before').outlineStyle).toBe('dashed');
    // brand-tint: the brand color (#7406EB in light demo) at 7% opacity.
    await expect(getComputedStyle(rename, '::after').backgroundColor).toMatch(/^rgba\(116, 6, 235, 0\.07\d*\)$/);
    await waitFor(() => expect(getComputedStyle(rename, '::after').opacity).toBe('1'));
    await user.keyboard('{ArrowDown}{ArrowDown}');
    // Archive is disabled, so focus goes from Duplicate to Delete.
    await expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await user.keyboard('r');
    await expect(rename).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await expect(canvas.getByRole('button', { name: 'Actions for Website redesign' })).toHaveFocus();
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};

/** Disabled items use the "on background" disabled text color and can't be chosen. */
export const DisabledItem: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Actions for Website redesign' }));
    const archive = await screen.findByRole('menuitem', { name: 'Archive' });
    await expect(archive).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(archive).cursor).toBe('not-allowed');
    await userEvent.click(archive, { pointerEventsCheck: 0 });
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};

/** Next to a primary Button: "Save" plus a menu of other ways to save. */
export const WithButton: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 200 }}>
      <Button>Save</Button>
      <ActionMenuTrigger>
        <Button variant="outline">More</Button>
        <ActionMenu {...args}>
          <ActionMenuItem id="save-as">Save as…</ActionMenuItem>
          <ActionMenuItem id="export">Export PDF</ActionMenuItem>
        </ActionMenu>
      </ActionMenuTrigger>
    </div>
  ),
};

/** Open in each color theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16, minHeight: 240, display: 'grid', alignContent: 'start', gap: 8 }}>
            <strong>{theme}</strong>
            <ActionMenuTrigger defaultOpen>
              <IconButton aria-label={`Actions (${theme})`} variant="subtle" size="micro">
                <Icon name="ellipsis-vertical" />
              </IconButton>
              <ActionMenu {...args} />
            </ActionMenuTrigger>
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
