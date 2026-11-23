import * as stylex from '@stylexjs/stylex';

import { Button } from '../src/components/Button';
import { Checkbox } from '../src/components/Checkbox';
import { Switch } from '../src/components/Switch';
import { TextInput } from '../src/components/TextInput';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { border as radius } from '../src/tokens/radius.stylex';
import { spacing } from '../src/tokens/spacing.stylex';
import { focusRing } from '../src/utils/focus-ring';

/** Backgrounds a theme might put a control on, from easy to hard: the ring has to show on all of them. */
const BACKGROUNDS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Brand purple', value: '#7406EB' },
  { name: 'Yellow', value: '#FFE600' },
  { name: 'Mid gray', value: '#767676' },
];

/** The ring itself, drawn as it is on a focused control, on each background. */
export function RingOnBackgrounds() {
  return (
    <div {...stylex.props(styles.strip)}>
      {BACKGROUNDS.map((b) => (
        <figure key={b.name} {...stylex.props(styles.figure)}>
          <div {...stylex.props(styles.ground)} style={{ backgroundColor: b.value }}>
            <div {...stylex.props(styles.control, focusRing.base, focusRing.visible)} style={{ backgroundColor: b.value }} />
          </div>
          <figcaption {...stylex.props(styles.caption)}>
            {b.name} <span {...stylex.props(styles.hex)}>{b.value}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Real controls to Tab through: the ring shows on each in turn, and not when you click them. */
export function TryIt() {
  return (
    <ThemeProvider xstyle={styles.tryIt}>
      <Button>Save changes</Button>
      <Button variant="outline">Cancel</Button>
      <Checkbox>Remember me</Checkbox>
      <Switch>Notifications</Switch>
      <TextInput label="Name" xstyle={styles.field} />
    </ThemeProvider>
  );
}

const styles = stylex.create({
  strip: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8.5rem, 1fr))', gap: spacing.sm, marginBlock: spacing.md },
  figure: { display: 'flex', flexDirection: 'column', gap: spacing.xs, margin: 0 },
  ground: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '7rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#000000',
    borderRadius: radius.radiusMd,
  },
  // A stand-in control: no fill of its own, so only the ring shows against the background.
  control: { position: 'relative', width: '4.5rem', height: '2.5rem', borderRadius: radius.radiusMd },
  caption: { fontFamily: '"Space Mono", monospace', fontSize: '0.875rem', lineHeight: 1.5, color: '#000000' },
  hex: { display: 'block', fontSize: '0.75rem' },
  tryIt: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: spacing.md,
    padding: spacing.md,
    marginBlock: spacing.md,
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: '#000000',
    borderRadius: radius.radiusMd,
  },
  field: { width: '14rem' },
});
