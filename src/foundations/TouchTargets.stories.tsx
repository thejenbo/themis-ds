import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Button, type ButtonSize } from '../components/Button';

interface TouchPlaygroundProps {
  /** Draw every button's invisible touch area (shown on all devices here, touch screens only in real use). */
  showTouchAreas: boolean;
  /** Button size to stack. */
  size: ButtonSize;
  /** Vertical gap between the buttons, in px. */
  gap: number;
}

/** Three stacked buttons with an adjustable gap, for checking whether touch areas overlap. */
function TouchPlayground({ showTouchAreas, size, gap }: TouchPlaygroundProps) {
  return (
    <div
      data-themis-show-touch={showTouchAreas ? '' : undefined}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap, padding: 24 }}
    >
      <Button size={size}>Edit</Button>
      <Button size={size} variant="outline">Duplicate</Button>
      <Button size={size} variant="subtle">Archive</Button>
    </div>
  );
}

const meta = {
  title: 'Foundations/Touch targets',
  component: TouchPlayground,
  args: { showTouchAreas: true, size: 'micro', gap: 8 },
  argTypes: {
    size: { control: 'inline-radio', options: ['micro', 'small', 'medium'] },
    gap: { control: { type: 'range', min: 0, max: 32, step: 2 } },
  },
} satisfies Meta<typeof TouchPlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Red boxes are the touch areas. Overlapping boxes mean a tap between two buttons could hit either.
 * Raise the gap until they stop overlapping, or follow the spacing rule below.
 */
export const Playground: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Edit' });
    const area = getComputedStyle(button, '::after');
    await expect(area.display).toBe('block');
    await expect(parseFloat(area.height)).toBeGreaterThanOrEqual(44);
  },
};

/** Recommended gaps between stacked buttons: no overlapping touch areas at any size. */
export const SpacingRule: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 24 }}>
      <TouchPlayground showTouchAreas size="micro" gap={24} />
      <TouchPlayground showTouchAreas size="small" gap={16} />
      <TouchPlayground showTouchAreas size="medium" gap={8} />
    </div>
  ),
};
