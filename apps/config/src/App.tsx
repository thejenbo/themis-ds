import * as stylex from '@stylexjs/stylex';
import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { Button, Modal, Text, type ThemeSettings, ThemeProvider, type ThemisConfig, ToastRegion } from 'themis-ds';

import { border as borderWidth } from '../../../src/tokens/borderWidth.stylex';
import { color } from '../../../src/tokens/colorTheme.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { AppHeader, type Page } from './AppHeader';
import { ExportModal } from './ExportModal';
import { initialConfig } from './initial-config';
import { loadSaved, save } from './storage';
import { ThemeSettingsForm } from './SettingsPanel';
import { SettingsSim } from './SettingsSim';
import { ThemeNameField, ThemePicker } from './ThemeBar';

/** A theme being named. New and duplicated themes aren't in the file until the name is confirmed. */
type Naming =
  | { mode: 'new' | 'duplicate'; name: string; theme: ThemeSettings; original: ThemeSettings; error?: string }
  | { mode: 'rename'; name: string; from: string; error?: string };

/** What a new theme starts from: the light theme the tool opens with. */
const NEW_THEME: ThemeSettings = initialConfig.themes.light!;

const pageFromHash = (): Page => (window.location.hash === '#docs' ? 'docs' : 'simulator');

/**
 * The config tool: a sample app wearing the selected theme, and the sidebar to change it. The tool's own chrome uses
 * the Themis config theme; only the preview changes.
 */
export function App() {
  // Pick up where you left off in this browser, or start from the Themis demo themes.
  const [saved] = useState(loadSaved);
  const [config, setConfig] = useState<ThemisConfig>(saved?.config ?? initialConfig);
  const [selected, setSelected] = useState<string>(saved?.selected ?? Object.keys(initialConfig.themes)[0]!);
  const [naming, setNaming] = useState<Naming | null>(null);
  const [dialog, setDialog] = useState<'export' | 'delete' | 'discard' | 'start-over' | null>(null);
  const [page, setPage] = useState<Page>(pageFromHash);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Save shortly after each change (not on every slider step).
  useEffect(() => {
    const timer = setTimeout(() => save({ config, selected }), 300);
    return () => clearTimeout(timer);
  }, [config, selected]);

  const names = Object.keys(config.themes);
  const draft = naming && naming.mode !== 'rename' ? naming : null;

  // A theme that's still being named isn't saved yet, so ask before the page is closed or reloaded.
  useEffect(() => {
    if (!draft) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [draft != null]);
  // While a new theme is being named, the sidebar and preview show it.
  const theme = draft ? draft.theme : config.themes[selected]!;
  // The preview follows a step behind while a slider or field is changing, so they stay quick to use.
  const previewTheme = useDeferredValue(theme);

  const focusThemeSelect = () => requestAnimationFrame(() => selectRef.current?.querySelector('button')?.focus());

  const updateTheme = (next: ThemeSettings) => {
    if (draft) setNaming({ ...draft, theme: next });
    else setConfig((c) => ({ ...c, themes: { ...c.themes, [selected]: next } }));
  };

  const startNew = () => setNaming({ mode: 'new', name: '', theme: structuredClone(NEW_THEME), original: NEW_THEME });
  const startDuplicate = () => {
    const copy = structuredClone(config.themes[selected]!);
    setNaming({ mode: 'duplicate', name: uniqueName(`${selected} copy`, names), theme: copy, original: structuredClone(copy) });
  };
  const startRename = () => setNaming({ mode: 'rename', name: selected, from: selected });

  const confirmName = () => {
    if (!naming) return;
    const name = naming.name.trim();
    const taken = names.includes(name) && !(naming.mode === 'rename' && name === naming.from);
    const error = !name ? 'Enter a name for the theme.' : taken ? `There’s already a theme called “${name}”.` : undefined;
    if (error) return setNaming({ ...naming, error });

    if (naming.mode === 'rename') {
      // Rebuild the object so the renamed theme keeps its place in the file.
      setConfig((c) => ({
        ...c,
        themes: Object.fromEntries(Object.entries(c.themes).map(([key, value]) => [key === naming.from ? name : key, value])),
      }));
    } else {
      setConfig((c) => ({ ...c, themes: { ...c.themes, [name]: naming.theme } }));
    }
    setSelected(name);
    setNaming(null);
    focusThemeSelect();
  };

  const cancelNaming = () => {
    if (draft && JSON.stringify(draft.theme) !== JSON.stringify(draft.original)) return setDialog('discard');
    setNaming(null);
    focusThemeSelect();
  };

  const deleteSelected = () => {
    const index = names.indexOf(selected);
    const next = names[index + 1] ?? names[index - 1]!;
    setConfig((c) => ({ ...c, themes: Object.fromEntries(Object.entries(c.themes).filter(([key]) => key !== selected)) }));
    setSelected(next);
    focusThemeSelect();
  };

  return (
    <ThemeProvider modes={{ colorTheme: 'themis config', fontTheme: 'themis', borderWidth: 'themis config', radius: 'themis config' }} xstyle={styles.app}>
      <AppHeader page={page} isExportDisabled={draft != null} onExport={() => setDialog('export')} />
      <div {...stylex.props(styles.body)}>
        <main {...stylex.props(styles.preview)} aria-label={`Preview of the ${draft ? 'new' : selected} theme`}>
          <ThemeProvider theme={previewTheme} xstyle={styles.previewTheme}>
            {page === 'simulator' ? (
              <SettingsSim />
            ) : (
              <div {...stylex.props(styles.placeholder)}>
                <Text variant="body-large">The docs view is coming soon.</Text>
              </div>
            )}
          </ThemeProvider>
        </main>
        <aside {...stylex.props(styles.sidebar)} aria-label="Theme settings">
          <div {...stylex.props(styles.themeBar)}>
            {naming ? (
              <ThemeNameField
                label={naming.mode === 'rename' ? 'Theme name' : 'New theme name'}
                confirmLabel={naming.mode === 'rename' ? 'Rename theme' : 'Create theme'}
                value={naming.name}
                error={naming.error}
                onChange={(name) => setNaming({ ...naming, name, error: undefined })}
                onConfirm={confirmName}
                onCancel={cancelNaming}
              />
            ) : (
              <ThemePicker
                themes={config.themes}
                selected={selected}
                onSelect={setSelected}
                onAdd={startNew}
                onRename={startRename}
                onDuplicate={startDuplicate}
                onDelete={() => setDialog('delete')}
                onStartOver={() => setDialog('start-over')}
                selectRef={selectRef}
              />
            )}
          </div>
          <div {...stylex.props(styles.settings)}>
            <ThemeSettingsForm theme={theme} onChange={updateTheme} />
          </div>
        </aside>
      </div>

      <ExportModal config={config} isOpen={dialog === 'export'} onOpenChange={(open) => setDialog(open ? 'export' : null)} />

      <Modal
        title={`Delete the ${selected} theme?`}
        tone="danger"
        size="small"
        isOpen={dialog === 'delete'}
        onOpenChange={(open) => setDialog(open ? 'delete' : null)}
        actions={(close) => (
          <>
            <Button variant="outline" slot="close">
              Cancel
            </Button>
            <Button
              tone="danger"
              onPress={() => {
                close();
                deleteSelected();
              }}
            >
              Delete
            </Button>
          </>
        )}
      >
        <Text variant="body-base">Its colours, borders and fonts will be removed from the theme file.</Text>
      </Modal>

      <Modal
        title="Discard this theme?"
        tone="danger"
        size="small"
        isOpen={dialog === 'discard'}
        onOpenChange={(open) => setDialog(open ? 'discard' : null)}
        actions={(close) => (
          <>
            <Button variant="outline" slot="close">
              Keep editing
            </Button>
            <Button
              tone="danger"
              onPress={() => {
                close();
                setNaming(null);
                focusThemeSelect();
              }}
            >
              Discard
            </Button>
          </>
        )}
      >
        <Text variant="body-base">Your changes to this theme will be lost.</Text>
      </Modal>

      <Modal
        title="Start over?"
        tone="danger"
        size="small"
        isOpen={dialog === 'start-over'}
        onOpenChange={(open) => setDialog(open ? 'start-over' : null)}
        actions={(close) => (
          <>
            <Button variant="outline" slot="close">
              Cancel
            </Button>
            <Button
              tone="danger"
              onPress={() => {
                close();
                setConfig(initialConfig);
                setSelected(Object.keys(initialConfig.themes)[0]!);
                focusThemeSelect();
              }}
            >
              Start over
            </Button>
          </>
        )}
      >
        <Text variant="body-base">All your themes will be replaced with the starting light and dark themes. Export first to keep them.</Text>
      </Modal>

      <ToastRegion />
    </ThemeProvider>
  );
}

/** "dark copy", or "dark copy 2" if that's taken. */
function uniqueName(base: string, taken: string[]) {
  let name = base;
  for (let n = 2; taken.includes(name); n++) name = `${base} ${n}`;
  return name;
}

const styles = stylex.create({
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
  },
  // Figma: the preview fills the width, the sidebar is 350px on the right. Each scrolls on its own.
  body: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 21.875rem',
    flexGrow: 1,
    minHeight: 0,
  },
  preview: { overflowY: 'auto' },
  // A faint brand tint behind the simulator, so its components stand out (even with borders set to none).
  // Decorative and only in this tool: the components themselves still sit on the plain background colour.
  previewTheme: { minHeight: '100%', backgroundColor: `color-mix(in srgb, ${color.brand} 7%, ${color.background})` },
  placeholder: { padding: spacing['2xl'] },
  sidebar: {
    overflowY: 'auto',
    backgroundColor: color.background,
    borderInlineStartWidth: borderWidth.widthSm,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: color.brand,
  },
  // Sticks to the top of the sidebar, with the 1px line under it (Figma "Line 7").
  themeBar: {
    position: 'sticky',
    insetBlockStart: 0,
    zIndex: 1,
    padding: spacing.md,
    paddingBlockEnd: spacing.lg,
    backgroundColor: color.background,
    '::after': {
      content: "''",
      position: 'absolute',
      insetInline: spacing.md,
      insetBlockEnd: 0,
      height: '1px',
      backgroundColor: color.border,
    },
  },
  settings: { padding: spacing.md, paddingBlockStart: spacing.lg },
});
