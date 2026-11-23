import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Tooltip, type TooltipPlacement, TooltipTrigger } from './Tooltip';
import { Icon } from '../Icon';
import docs from './Tooltip.docs';

const PLACEMENTS: TooltipPlacement[] = ['top', 'bottom', 'left', 'right', 'top start', 'top end', 'bottom start', 'bottom end'];

const center = { display: 'grid', placeItems: 'center', minHeight: 260 } as const;

const meta = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  subcomponents: { TooltipTrigger },
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary }, story: { inline: false, height: '300px' } },
  },
  args: { children: 'Copy link', placement: 'top' },
  argTypes: {
    placement: { control: 'select', options: PLACEMENTS },
    title: { control: 'text' },
    children: { control: 'text' },
  },
  render: (args) => (
    <div style={center}>
      <TooltipTrigger>
        <IconButton aria-label="Copy link" variant="outline">
          <Icon name="copy" />
        </IconButton>
        <Tooltip {...args} />
      </TooltipTrigger>
    </div>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover or focus the button. Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Open from the start, so you can see it without hovering. */
export const Open: Story = {
  args: { title: 'Copy link', children: 'Anyone with the link can view this page.' },
  render: (args) => (
    <div style={center}>
      <TooltipTrigger defaultOpen>
        <Button variant="outline" iconLeft={<Icon name="copy" />}>
          Share
        </Button>
        <Tooltip {...args} />
      </TooltipTrigger>
    </div>
  ),
};

/**
 * Interaction test: keyboard focus shows it at once and links it to the trigger; Escape hides it.
 * Measures Figma's box (40px for one line) and the 4px gap between the trigger and the arrow tip.
 */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const trigger = canvas.getByRole('button', { name: 'Copy link' });
    await expect(trigger).toHaveFocus();
    const tooltip = await canvas.findByRole('tooltip');
    await expect(tooltip).toHaveTextContent('Copy link');
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    // Wait for the 4px entry slide to finish before measuring.
    await waitFor(() => expect(getComputedStyle(tooltip).transform).toBe('none'), { timeout: 3000 });
    const box = tooltip.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(tooltip.lastElementChild!).lineHeight);
    await expect(Math.round(box.height)).toBe(Math.round(lineHeight + 16));
    const arrow = tooltip.querySelector('svg')!.getBoundingClientRect();
    // Arrow: 8px outside the box, base 4px inside, and the tip 4px above the trigger.
    await expect(Math.round(arrow.bottom - box.bottom)).toBe(8);
    await expect(Math.round(trigger.getBoundingClientRect().top - box.bottom)).toBe(12);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('tooltip')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/** Interaction test: hovering shows it after the delay, and the pointer can move onto the tooltip without it closing. */
export const Hover: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Copy link' });
    // React Aria only treats hover as intentional once the pointer has been used on the page.
    await userEvent.click(document.body);
    await userEvent.hover(trigger);
    const tooltip = await canvas.findByRole('tooltip', {}, { timeout: 2000 });
    await userEvent.unhover(trigger);
    await userEvent.hover(tooltip);
    await new Promise((r) => setTimeout(r, 700));
    await expect(canvas.getByRole('tooltip')).toBeInTheDocument();
    await userEvent.unhover(tooltip);
    await waitFor(() => expect(canvas.queryByRole('tooltip')).toBeNull(), { timeout: 2000 });
  },
};

/** Long text wraps at 320px. */
export const LongText: Story = {
  args: {
    title: 'Sync paused',
    children: 'Changes on this device will upload when you reconnect. Nothing you have already saved is affected.',
  },
  render: Open.render,
  play: async ({ canvas }) => {
    const tooltip = await canvas.findByRole('tooltip');
    await expect(Math.round(tooltip.getBoundingClientRect().width)).toBe(320);
  },
};

/**
 * Every placement, each open, mirroring the Figma "Tooltip" frame. The arrow always points at the middle of the
 * trigger; with start/end placements the box lines up with the trigger's edge.
 */
export const Placements: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '120px 220px', padding: '96px 160px' }}>
      {PLACEMENTS.map((placement) => (
        <div key={placement} style={{ display: 'grid', placeItems: 'center' }}>
          <TooltipTrigger defaultOpen>
            <Button variant="outline">{placement}</Button>
            <Tooltip {...args} placement={placement} title={placement.includes(' ') ? 'Tooltip Heading' : undefined}>
              Some extra info
            </Tooltip>
          </TooltipTrigger>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const tooltips = await canvas.findAllByRole('tooltip');
    await expect(tooltips).toHaveLength(8);
    await document.fonts.ready;
    const offsets = () =>
      tooltips.map((tooltip) => {
        const t = document.querySelector(`[aria-describedby~="${tooltip.id}"]`)!.getBoundingClientRect();
        const a = tooltip.querySelector('svg')!.getBoundingClientRect();
        const vertical = a.height > a.width;
        const off = vertical ? a.top + a.height / 2 - (t.top + t.height / 2) : a.left + a.width / 2 - (t.left + t.width / 2);
        return `${tooltip.dataset.placement}: ${Math.abs(off) < 1 ? 'ok' : off.toFixed(1)}`;
      });
    // Every corner is rounded, and every arrow points at the middle of its trigger.
    for (const tooltip of tooltips) await expect(getComputedStyle(tooltip).borderBottomLeftRadius).not.toBe('0px');
    await waitFor(() => expect(offsets().filter((o) => !o.endsWith('ok'))).toEqual([]));
  },
};

/** Border width "none": the tooltip keeps its outline (border/width/mandatory, 1px there), as in Figma. */
export const NoBorderWidth: Story = {
  tags: ['!autodocs'],
  render: (args) => (
    <ThemeProvider modes={{ borderWidth: 'none' }}>
      <div style={{ padding: '24px 24px 120px' }}>
        <TooltipTrigger defaultOpen>
          <Button variant="outline">Share</Button>
          <Tooltip {...args} placement="bottom start">
            Some extra info
          </Tooltip>
        </TooltipTrigger>
      </div>
    </ThemeProvider>
  ),
  play: async ({ canvas }) => {
    const tooltip = await canvas.findByRole('tooltip');
    await expect(getComputedStyle(tooltip).borderTopWidth).toBe('1px');
    await expect(getComputedStyle(tooltip.querySelector('svg path:last-of-type')!).strokeWidth).toBe('1px');
  },
};

/** Open in each color theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: '24px 24px 120px', display: 'flex', gap: 24, alignItems: 'center' }}>
            <strong>{theme}</strong>
            <TooltipTrigger defaultOpen>
              <Button variant="outline">Share</Button>
              <Tooltip {...args} placement="bottom start" title="Tooltip Heading">
                Some extra info
              </Tooltip>
            </TooltipTrigger>
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
