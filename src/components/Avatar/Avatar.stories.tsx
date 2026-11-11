import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { Avatar, type AvatarSize, type AvatarVariant } from './Avatar';
import docs from './Avatar.docs';
// Bug, the designer's dog, exported from the Figma "Avatar" image variant (224px, 4× the largest avatar).
import PHOTO from './bug.jpg';

const SIZES: AvatarSize[] = ['xl', 'lg', 'md', 'sm', 'xs'];
const VARIANTS: AvatarVariant[] = ['solid', 'outline'];

const row = (children: React.ReactNode) => <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>{children}</div>;

const meta = {
  title: 'Data display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    themis: docs,
    docs: { description: { component: docs.summary } },
  },
  args: { name: 'Taylor Brooks', size: 'md', variant: 'solid' },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    variant: { control: 'inline-radio', options: VARIANTS },
    status: { control: 'inline-radio', options: [undefined, 'online'] },
    src: { control: 'text' },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Use the controls for every prop, and the toolbar to switch themes and radius modes. */
export const Playground: Story = {};

/** Every size: initials, with a status, and with a photo, mirroring the Figma "Avatar" frame. */
export const Gallery: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {VARIANTS.flatMap((variant) => [
        row(SIZES.map((size) => <Avatar key={size} {...args} variant={variant} size={size} name={`Taylor Brooks ${variant} ${size}`} initials="T" />)),
        row(SIZES.map((size) => <Avatar key={size} {...args} variant={variant} size={size} name={`Taylor ${variant} ${size}`} initials="T" status="online" />)),
        row(SIZES.map((size) => <Avatar key={size} {...args} variant={variant} size={size} name={`Bug ${variant} ${size}`} src={PHOTO} />)),
        row(SIZES.map((size) => <Avatar key={size} {...args} variant={variant} size={size} name={`Bug online ${variant} ${size}`} src={PHOTO} status="online" />)),
      ])}
    </div>
  ),
  play: async ({ canvas }) => {
    const sizes = { xs: 24, sm: 32, md: 40, lg: 48, xl: 56 };
    for (const variant of VARIANTS) {
      for (const [size, px] of Object.entries(sizes)) {
        // Outline and solid avatars are the same size: the border is drawn inside.
        const avatar = canvas.getByRole('img', { name: `Taylor Brooks ${variant} ${size}` });
        await expect(avatar.getBoundingClientRect().width).toBe(px);
        await expect(avatar.getBoundingClientRect().height).toBe(px);
        // The dot's centre is on the rounded corner's curve.
        const withDot = canvas.getByRole('img', { name: `Taylor ${variant} ${size}, online` });
        const box = withDot.getBoundingClientRect();
        const dot = withDot.querySelector('[data-themis-part="status"]')!.getBoundingClientRect();
        const r = Math.min(parseFloat(getComputedStyle(withDot).borderTopLeftRadius), px / 2);
        const expected = box.right - r * (1 - Math.SQRT1_2);
        await expect(Math.abs(dot.left + dot.width / 2 - expected)).toBeLessThan(0.6);
        await expect(Math.abs(dot.top + dot.height / 2 - (box.bottom - r * (1 - Math.SQRT1_2)))).toBeLessThan(0.6);
      }
    }
  },
};

/** Initials come from the name: first letters of the first and last words. Or pass `initials`. */
export const Initials: Story = {
  render: (args) =>
    row(
      <>
        <Avatar {...args} name="Taylor Brooks" />
        <Avatar {...args} name="Bug" />
        <Avatar {...args} name="Ana María de la Cruz" />
        <Avatar {...args} name="Design team" initials="DS" />
      </>,
    ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Taylor Brooks' })).toHaveTextContent('TB');
    await expect(canvas.getByRole('img', { name: 'Bug' })).toHaveTextContent('B');
    await expect(canvas.getByRole('img', { name: 'Ana María de la Cruz' })).toHaveTextContent('AC');
    await expect(canvas.getByRole('img', { name: 'Design team' })).toHaveTextContent('DS');
  },
};

/** With a photo: it fills the avatar, and the outline variant draws its border on top. Meet Bug. */
export const Photo: Story = {
  args: { name: 'Bug', src: PHOTO, size: 'xl', status: 'online' },
  render: (args) => row(VARIANTS.map((variant) => <Avatar key={variant} {...args} variant={variant} />)),
  play: async ({ canvas }) => {
    const [solid] = canvas.getAllByRole('img', { name: 'Bug, online' });
    // The photo is decorative inside the labelled avatar, and fills it.
    const img = solid!.querySelector('img')!;
    await expect(img).toHaveAttribute('alt', '');
    await expect(img.getBoundingClientRect().width).toBe(56);
  },
};

/** Interaction test: a photo that fails to load falls back to the initials. */
export const BrokenPhoto: Story = {
  tags: ['test-only', '!autodocs'],
  args: { src: 'data:image/png;base64,broken', name: 'Taylor Brooks' },
  play: async ({ canvas }) => {
    const avatar = canvas.getByRole('img', { name: 'Taylor Brooks' });
    await waitFor(() => expect(avatar.querySelector('img')).toBeNull());
    await expect(avatar).toHaveTextContent('TB');
  },
};

/** Next to a visible name, `isDecorative` hides the avatar from screen readers so the name isn't read twice. */
export const WithName: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', font: '16px sans-serif' }}>
      <Avatar {...args} isDecorative status="online" />
      <span>Taylor Brooks (online)</span>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('img')).toBeNull();
  },
};

/** Every variant in each colour theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <strong>{theme}</strong>
            {VARIANTS.map((variant) => (
              <Avatar key={variant} {...args} variant={variant} status="online" name={`${theme} ${variant}`} initials="TB" />
            ))}
            <Avatar {...args} variant="outline" src={PHOTO} name={`Bug (${theme})`} />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
