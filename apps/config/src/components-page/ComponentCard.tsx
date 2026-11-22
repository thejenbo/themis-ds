import * as stylex from '@stylexjs/stylex';
import { Component, memo, type ReactNode, useState } from 'react';
import { Button, Heading, Select, SelectItem, Switch, Text, TextInput } from 'themis-ds';

import { spacing } from '../../../../src/tokens/spacing.stylex';
import type { ComponentEntry, Control } from './registry';
import { Sandbox } from './Sandbox';

/**
 * One component on the components page: what it's for, the component itself on a stage, and controls for its design
 * props. The card and controls are in the config tool's style; the component is in a sandbox with the theme being
 * edited. Memoized: a theme change re-renders only the sandbox.
 */
export const ComponentCard = memo(function ComponentCard({ entry }: { entry: ComponentEntry }) {
  const [values, setValues] = useState<Record<string, unknown>>(() => Object.fromEntries(entry.controls.map((c) => [c.prop, c.initial])));
  const [overlayOpen, setOverlayOpen] = useState(false);
  const set = (prop: string, value: unknown) => setValues((v) => ({ ...v, [prop]: value }));
  const { Story } = entry;

  return (
    <div {...stylex.props(styles.body)}>
      <div {...stylex.props(styles.intro)}>
        <Heading level={3} size="sm">
          {entry.name}
        </Heading>
        <Text variant="body-base" xstyle={styles.summary}>
          {entry.summary}
        </Text>
      </div>
      <Sandbox name={entry.name}>
        <StoryBoundary name={entry.name}>
          {entry.isOverlay ? (
            <>
              <Button onPress={() => setOverlayOpen(true)}>Open {entry.name.toLowerCase()}</Button>
              <Story {...values} isOpen={overlayOpen} onOpenChange={setOverlayOpen} />
            </>
          ) : (
            <Story {...values} />
          )}
        </StoryBoundary>
      </Sandbox>
      {entry.controls.length > 0 && (
        <div {...stylex.props(styles.controls)} role="group" aria-label={`${entry.name} properties`}>
          {entry.controls.map((control) => (
            <ControlField key={control.prop} control={control} value={values[control.prop]} onChange={(v) => set(control.prop, v)} />
          ))}
        </div>
      )}
    </div>
  );
});

function ControlField({ control, value, onChange }: { control: Control; value: unknown; onChange: (value: unknown) => void }) {
  if (control.kind === 'boolean') {
    return (
      <Switch size="micro" isSelected={Boolean(value)} onChange={onChange} xstyle={styles.switch}>
        {control.label}
      </Switch>
    );
  }
  if (control.kind === 'text') {
    return <TextInput label={control.label} value={String(value ?? '')} onChange={onChange} />;
  }
  // A select for every set of values. Options are keyed by their label (values can be undefined or numbers).
  const keyOf = (v: unknown) => control.options.find((o) => o.value === v)?.label ?? 'none';
  const valueOf = (key: unknown) => control.options.find((o) => o.label === key)?.value;
  return (
    <Select label={control.label} value={keyOf(value)} onChange={(k) => onChange(valueOf(k))}>
      {control.options.map((o) => (
        <SelectItem key={o.label} id={o.label}>
          {o.label}
        </SelectItem>
      ))}
    </Select>
  );
}

/** A story that throws (e.g. a combination of props it doesn't support) shows a note instead of taking the page down. */
class StoryBoundary extends Component<{ name: string; children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    if (this.state.error)
      return (
        <Text variant="caption">
          {this.props.name} can’t show these settings: {this.state.error.message}
        </Text>
      );
    return this.props.children;
  }
}

const styles = stylex.create({
  body: { display: 'flex', flexDirection: 'column', gap: spacing.md },
  intro: { display: 'flex', flexDirection: 'column', gap: spacing['2xs'] },
  summary: { maxWidth: '40rem' },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
    gap: `${spacing.sm} ${spacing.md}`,
    alignItems: 'end',
  },
  switch: { alignSelf: 'center' },
});
