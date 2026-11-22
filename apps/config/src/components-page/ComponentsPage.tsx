import * as stylex from '@stylexjs/stylex';
import { memo, useMemo, useState } from 'react';
import { Text, TextInput, type ThemeSettings } from 'themis-ds';

import { spacing } from '../../../../src/tokens/spacing.stylex';
import { ComponentCard } from './ComponentCard';
import { COMPONENTS } from './registry';
import { SandboxTheme } from './Sandbox';

/**
 * The components page: every Themis component, live, with controls for its design props. The page itself is in the
 * config tool's own style; each component sits in a sandbox that takes the theme being edited. Loaded on demand (it
 * brings the stories with it).
 */
export default function ComponentsPage({ theme }: { theme: ThemeSettings }) {
  return (
    // The theme reaches the sandboxes through context, so a theme change re-renders only them, not the cards.
    <SandboxTheme.Provider value={theme}>
      <ComponentList />
    </SandboxTheme.Provider>
  );
}

const ComponentList = memo(function ComponentList() {
  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? COMPONENTS.filter((c) => `${c.name} ${c.category}`.toLowerCase().includes(q)) : COMPONENTS;
  }, [query]);

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.content)}>
        <TextInput label="Find a component" type="search" placeholder="Button, inputs…" value={query} onChange={setQuery} xstyle={styles.search} />
        {shown.map((entry) => (
          <ComponentCard key={entry.name} entry={entry} />
        ))}
        {shown.length === 0 && <Text variant="body-base">No components match “{query.trim()}”.</Text>}
      </div>
    </div>
  );
});

const styles = stylex.create({
  // As the Settings Sim: 16px sides on phones, 24px on tablets, 64px beside the desktop sidebar.
  page: {
    paddingBlock: { default: `${spacing.md} ${spacing.md}`, '@media (min-width: 64em)': `${spacing.md} ${spacing.xl}` },
    paddingInline: { default: spacing.sm, '@media (min-width: 48em)': spacing.md, '@media (min-width: 64em)': spacing['2xl'] },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    maxWidth: { default: 'none', '@media (min-width: 64em)': '48rem' },
  },
  search: { maxWidth: '20rem' },
});
