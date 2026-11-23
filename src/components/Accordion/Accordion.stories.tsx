import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Accordion, AccordionGroup } from './Accordion';
import docs from './Accordion.docs';

const FAQ = [
  { id: 'shipping', title: 'How long does shipping take?', body: 'Orders arrive in 3–5 working days. You\'ll get a tracking link by email.' },
  { id: 'returns', title: 'Can I return an item?', body: 'Yes, within 30 days. Start a return from your order page.' },
  { id: 'payment', title: 'Which payment methods do you accept?', body: 'Cards, Apple Pay and Google Pay.' },
];

const meta = {
  title: 'Disclosure/Accordion',
  component: Accordion,
  subcomponents: { AccordionGroup },
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 500 }}>{Story()}</div>],
  args: {
    title: 'How long does shipping take?',
    children: 'Orders arrive in 3–5 working days. You\'ll get a tracking link by email.',
    onExpandedChange: fn(),
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [2, 3, 4, 5, 6] },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single accordion. Use the controls to explore every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Interaction test: clicking the header opens and closes the content and calls `onExpandedChange`. */
export const OpensOnClick: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const header = canvas.getByRole('button', { name: 'How long does shipping take?' });
    await expect(header).toHaveAttribute('aria-expanded', 'false');
    await expect(header.closest('h3')).not.toBeNull();
    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(true);
    await expect(canvas.getByText(/Orders arrive/)).toBeVisible();
    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.getByText(/Orders arrive/)).not.toBeVisible());
    await expect(getComputedStyle(header).cursor).toBe('pointer');
  },
};

/** Interaction test: Enter and Space toggle it, and the focus ring sits inside the header. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    const header = canvas.getByRole('button');
    await user.tab();
    await expect(header).toHaveFocus();
    // The ring is drawn inside the header (on its ::before, above the header's fill), so it never overlaps neighbors.
    const ring = getComputedStyle(header, '::before');
    await expect(ring.outlineStyle).toBe('dashed');
    await expect(ring.zIndex).toBe('1');
    await expect(parseFloat(ring.top)).toBeGreaterThan(0);
    await user.keyboard('{Enter}');
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    await expect(header).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Starts open with `defaultExpanded`. */
export const Open: Story = {
  args: { defaultExpanded: true },
};

/** Long headers wrap onto more lines; the chevron stays at the end. */
export const LongTitle: Story = {
  args: {
    title: 'What happens to my subscription if I change my billing country or currency part-way through a period?',
    defaultExpanded: true,
  },
};

/** `tone="danger"` gives the header the error color, for a section of destructive actions. */
export const DangerTone: Story = {
  args: {
    tone: 'danger',
    title: 'Danger Zone',
    children: 'Deleting your account removes all your data. This action cannot be undone.',
    defaultExpanded: true,
  },
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-themis-part="surface"]')!;
    // The header uses the theme's error color (light demo: #AF0E0E).
    await expect(getComputedStyle(surface).backgroundColor).toBe('rgb(175, 14, 14)');
  },
};

/** Disabled accordions can't be opened or closed, and use the fixed system colors. */
export const Disabled: Story = {
  render: (args) => (
    <AccordionGroup defaultExpandedKeys={['returns']}>
      <Accordion {...args} id="shipping" isDisabled>
        {args.children}
      </Accordion>
      <Accordion {...args} id="returns" title="Can I return an item?" isDisabled>
        Yes, within 30 days. Start a return from your order page.
      </Accordion>
    </AccordionGroup>
  ),
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Can I return an item?' })).toHaveAttribute('aria-expanded', 'true');
    for (const header of canvas.getAllByRole('button')) {
      await expect(getComputedStyle(header).cursor).toBe('not-allowed');
      const before = header.getAttribute('aria-expanded');
      await userEvent.click(header, { pointerEventsCheck: 0 });
      await expect(header).toHaveAttribute('aria-expanded', before);
    }
    await expect(args.onExpandedChange).not.toHaveBeenCalled();
  },
};

/** AccordionGroup stacks accordions with spacing.xs between them. Several can be open at once by default. */
export const Group: Story = {
  render: () => (
    <AccordionGroup defaultExpandedKeys={['shipping']}>
      {FAQ.map((item) => (
        <Accordion key={item.id} id={item.id} title={item.title}>
          {item.body}
        </Accordion>
      ))}
    </AccordionGroup>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Can I return an item?' }));
    const open = canvas.getAllByRole('button').filter((b) => b.getAttribute('aria-expanded') === 'true');
    await expect(open).toHaveLength(2);
  },
};

/** `allowsMultipleExpanded={false}`: opening one accordion closes the others. */
export const OneAtATime: Story = {
  render: () => (
    <AccordionGroup allowsMultipleExpanded={false} defaultExpandedKeys={['shipping']}>
      {FAQ.map((item) => (
        <Accordion key={item.id} id={item.id} title={item.title}>
          {item.body}
        </Accordion>
      ))}
    </AccordionGroup>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Can I return an item?' }));
    await expect(canvas.getByRole('button', { name: 'Can I return an item?' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: 'How long does shipping take?' })).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Controlled: the parent owns which items are open through `expandedKeys` and `onExpandedChange`. */
export const ControlledGroup: Story = {
  render: function Render() {
    const [open, setOpen] = useState<Set<string | number>>(new Set(['payment']));
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <AccordionGroup expandedKeys={open} onExpandedChange={(keys) => setOpen(new Set(keys))}>
          {FAQ.map((item) => (
            <Accordion key={item.id} id={item.id} title={item.title}>
              {item.body}
            </Accordion>
          ))}
        </AccordionGroup>
        <span>Open: {[...open].join(', ') || 'none'}</span>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Which payment methods do you accept?' }));
    await expect(canvas.getByText('Open: none')).toBeInTheDocument();
  },
};

/** Open, closed and disabled, mirroring the Figma "Accordion" frame, in each color theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [],
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16, display: 'grid', gap: 12, maxWidth: 500 }}>
            <strong>{theme}</strong>
            <AccordionGroup defaultExpandedKeys={['open', 'open-disabled']}>
              <Accordion {...args} id="open" title="Accordion Header">
                Accordion content
              </Accordion>
              <Accordion {...args} id="closed" title="Accordion Header">
                Accordion content
              </Accordion>
              <Accordion {...args} id="open-disabled" title="Accordion Header" isDisabled>
                Accordion content
              </Accordion>
              <Accordion {...args} id="closed-disabled" title="Accordion Header" isDisabled>
                Accordion content
              </Accordion>
            </AccordionGroup>
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
