import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';
import docs from './Tabs.docs';

const text = { font: '16px sans-serif', margin: 0 } as const;

const projectTabs = (
  <>
    <TabList aria-label="Project sections">
      <Tab id="overview">Overview</Tab>
      <Tab id="activity">Activity</Tab>
      <Tab id="settings">Settings</Tab>
      <Tab id="billing" isDisabled>
        Billing
      </Tab>
    </TabList>
    <TabPanel id="overview">
      <p style={text}>The project is on track: 12 of 15 tasks done.</p>
    </TabPanel>
    <TabPanel id="activity">
      <p style={text}>Taylor updated the brief 2 hours ago.</p>
    </TabPanel>
    <TabPanel id="settings">
      <p style={text}>Notifications are on for this project.</p>
    </TabPanel>
    <TabPanel id="billing">
      <p style={text}>Billing is managed by your organization.</p>
    </TabPanel>
  </>
);

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  subcomponents: { TabList, Tab, TabPanel },
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  args: { children: projectTabs, onSelectionChange: fn() },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls for every prop, and the toolbar to switch themes. */
export const Playground: Story = {};

/** Interaction test: clicking a tab selects it, shows its panel and moves the indicator; disabled tabs can't be selected. */
export const SelectsOnClick: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ args, canvas }) => {
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const activity = canvas.getByRole('tab', { name: 'Activity' });
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    // Figma: 8px + one line + 8px (40px on mobile), and selecting doesn't change the height.
    const height = Math.round(parseFloat(getComputedStyle(overview).lineHeight) + 16);
    await expect(Math.round(overview.getBoundingClientRect().height)).toBe(height);
    await userEvent.click(activity);
    await expect(activity).toHaveAttribute('aria-selected', 'true');
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith('activity');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Taylor updated the brief');
    await expect(Math.round(activity.getBoundingClientRect().height)).toBe(height);
    // The brand indicator now sits at the bottom of the selected tab.
    await waitFor(() => {
      const line = activity.querySelector('.react-aria-SelectionIndicator') ?? activity.lastElementChild!;
      const a = activity.getBoundingClientRect();
      const l = line.getBoundingClientRect();
      expect(Math.round(l.bottom)).toBe(Math.round(a.bottom));
      expect(Math.round(l.left)).toBe(Math.round(a.left));
      expect(Math.round(l.height)).toBe(4);
    }, { timeout: 3000 }); // the indicator slides; give it time under a loaded test run
    // Hover shows a pale brand indicator under tabs that aren't selected (border-brand-hover).
    await userEvent.hover(overview);
    const hover = overview.querySelectorAll('[aria-hidden="true"]')[0] as HTMLElement;
    await waitFor(() => expect(getComputedStyle(hover).opacity).toBe('1'), { timeout: 3000 });
    await expect(getComputedStyle(hover).backgroundColor).toBe('rgb(200, 155, 247)'); // border-brand-hover, light demo
    await expect(getComputedStyle(hover).borderTopLeftRadius).not.toBe('0px');
    await userEvent.unhover(overview);
    await expect(getComputedStyle(activity).cursor).toBe('default');
    await expect(getComputedStyle(overview).cursor).toBe('pointer');
    const billing = canvas.getByRole('tab', { name: 'Billing' });
    await expect(getComputedStyle(billing).cursor).toBe('not-allowed');
    await userEvent.click(billing, { pointerEventsCheck: 0 });
    await expect(activity).toHaveAttribute('aria-selected', 'true');
  },
};

/** Interaction test: arrow keys move and select, skipping disabled tabs; Tab moves into the panel. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    await expect(overview).toHaveFocus();
    // The ring hugs the label and stays clear of the indicator bar below it.
    const label = overview.firstElementChild!.firstElementChild as HTMLElement;
    await expect(getComputedStyle(label).outlineStyle).toBe('dashed');
    const ringBottom = label.getBoundingClientRect().bottom + 4;
    const bar = overview.lastElementChild!.getBoundingClientRect();
    await expect(ringBottom).toBeLessThan(bar.top);
    await user.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    // Billing is disabled, so End stops at Settings.
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
    await user.tab();
    await expect(canvas.getByRole('tabpanel')).toHaveFocus();
  },
};

/** Controlled with `selectedKey` and `onSelectionChange`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [tab, setTab] = useState<Key>('settings');
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <Tabs {...args} selectedKey={tab} onSelectionChange={setTab} />
        <span style={text}>Selected: {String(tab)}</span>
      </div>
    );
  },
};

/** `isFullWidth`: the tabs share the row equally, 24px apart, labels at the start, the indicator across each share. */
export const FullWidth: Story = {
  args: {
    children: (
      <>
        <TabList aria-label="Theme settings">
          <Tab id="colors">Colors</Tab>
          <Tab id="borders">Borders</Tab>
          <Tab id="fonts">Fonts</Tab>
        </TabList>
        <TabPanel id="colors">
          <p style={text}>Six colors, all passing.</p>
        </TabPanel>
        <TabPanel id="borders">
          <p style={text}>Medium width, medium radius.</p>
        </TabPanel>
        <TabPanel id="fonts">
          <p style={text}>Playfair Display and Montserrat.</p>
        </TabPanel>
      </>
    ),
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <Tabs {...args} isFullWidth />
    </div>
  ),
  play: async ({ canvas }) => {
    const widths = canvas.getAllByRole('tab').map((tab) => tab.getBoundingClientRect().width);
    for (const w of widths) await expect(w).toBeCloseTo(widths[0]!, 1);
    // Together with the 24px gaps, they fill the row.
    const list = canvas.getByRole('tablist');
    await expect(Math.abs(widths.reduce((a, b) => a + b, 0) + 2 * 24 - list.getBoundingClientRect().width)).toBeLessThan(1);
    // The selected indicator spans the whole tab.
    const tab = canvas.getByRole('tab', { name: 'Colors' });
    await waitFor(() => expect(tab.lastElementChild!.getBoundingClientRect().width).toBeCloseTo(widths[0]!, 1));
  },
};

/** When the tabs don't fit, the row scrolls sideways. */
export const ManyTabs: Story = {
  args: {
    children: (
      <>
        <TabList aria-label="Months">
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'].map((m) => (
            <Tab key={m} id={m}>
              {m}
            </Tab>
          ))}
        </TabList>
        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'].map((m) => (
          <TabPanel key={m} id={m}>
            <p style={text}>Report for {m}.</p>
          </TabPanel>
        ))}
      </>
    ),
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Tabs {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole('tablist');
    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
  },
};

/** Each color theme, with the second tab hovered in the gallery below. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16, display: 'grid', gap: 24 }}>
            <strong>{theme}</strong>
            <Tabs {...args} />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
