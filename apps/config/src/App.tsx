import * as stylex from '@stylexjs/stylex';
import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, Text, type ThemeSettings, ThemeProvider, type ThemisConfig, ToastRegion } from 'themis-ds';

import { luminance, parseHex } from '../../../src/theme/color-math';
import { border as borderWidth } from '../../../src/tokens/borderWidth.stylex';
import { color } from '../../../src/tokens/colorTheme.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { AppHeader, type Page } from './AppHeader';
import { ExportModal } from './ExportModal';
import { initialConfig } from './initial-config';
import { type ColorFormats, loadColorFormats, loadSaved, save, saveColorFormats } from './storage';
import { ThemeSettingsForm } from './SettingsPanel';
import { SettingsSim } from './SettingsSim';
import { ThemeNameField, ThemePicker } from './ThemeBar';

/** A theme being named. New and duplicated themes aren't in the file until the name is confirmed. */
type Naming =
  | {
      mode: 'new' | 'duplicate';
      name: string;
      theme: ThemeSettings;
      original: ThemeSettings;
      /** The colour codes its fields show; kept under the theme's name once it's confirmed. */
      formats: ColorFormats;
      error?: string;
    }
  | { mode: 'rename'; name: string; from: string; error?: string };

/** What a new theme starts from: the light theme the tool opens with. */
const NEW_THEME: ThemeSettings = initialConfig.themes.light!;

const PAGES: Page[] = ['simulator', 'components'];
const pageFromHash = (): Page => PAGES.find((p) => `#${p}` === window.location.hash) ?? 'simulator';

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
  // Which colour code (HEX, RGB…) each field shows, per theme. Remembered in this browser, not part of the file.
  const [colorFormats, setColorFormats] = useState(loadColorFormats);
  useEffect(() => saveColorFormats(colorFormats), [colorFormats]);
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
  const { darkBackground, darkBrand } = useMemo(() => simulatorTones(previewTheme.colors), [previewTheme.colors]);

  // Section headings stick just below the theme row, whose height changes (the name field, its error message).
  const sidebarRef = useRef<HTMLElement>(null);
  const themeBarRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const bar = themeBarRef.current;
    if (!bar) return;
    const place = () => sidebarRef.current?.style.setProperty('--theme-bar-height', `${bar.offsetHeight}px`);
    place();
    const observer = new ResizeObserver(place);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  const focusThemeSelect = () => requestAnimationFrame(() => selectRef.current?.querySelector('button')?.focus());

  const updateTheme = (next: ThemeSettings) => {
    if (draft) setNaming({ ...draft, theme: next });
    else setConfig((c) => ({ ...c, themes: { ...c.themes, [selected]: next } }));
  };

  const formats = draft ? draft.formats : (colorFormats[selected] ?? {});
  const updateFormats = (next: ColorFormats) => {
    if (draft) setNaming({ ...draft, formats: next });
    else setColorFormats((f) => ({ ...f, [selected]: next }));
  };

  const startNew = () =>
    setNaming({ mode: 'new', name: '', theme: structuredClone(NEW_THEME), original: NEW_THEME, formats: {} });
  const startDuplicate = () => {
    const copy = structuredClone(config.themes[selected]!);
    setNaming({
      mode: 'duplicate',
      name: uniqueName(`${selected} copy`, names),
      theme: copy,
      original: structuredClone(copy),
      formats: { ...colorFormats[selected] },
    });
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
      setColorFormats(({ [naming.from]: moved, ...rest }) => (moved ? { ...rest, [name]: moved } : rest));
    } else {
      setConfig((c) => ({ ...c, themes: { ...c.themes, [name]: naming.theme } }));
      setColorFormats((f) => ({ ...f, [name]: naming.formats }));
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
    setColorFormats(({ [selected]: _removed, ...rest }) => rest);
    setSelected(next);
    focusThemeSelect();
  };

  return (
    <ThemeProvider modes={{ colorTheme: 'themis config', fontTheme: 'themis', borderWidth: 'themis config', radius: 'themis config' }} xstyle={styles.app}>
      <AppHeader page={page} />
      <div {...stylex.props(styles.body)}>
        <aside ref={sidebarRef} {...stylex.props(styles.sidebar)} aria-label="Theme settings">
          <div ref={themeBarRef} {...stylex.props(styles.themeBar)}>
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
            <ThemeSettingsForm
              theme={theme}
              onChange={updateTheme}
              colorFormats={formats}
              onColorFormatsChange={updateFormats}
            />
          </div>
          {/* Export is off while a new theme is being named: it isn't part of the file yet. */}
          <div {...stylex.props(styles.footer)}>
            <Button size="medium" isDisabled={draft != null} onPress={() => setDialog('export')} xstyle={styles.exportButton}>
              Export
            </Button>
          </div>
        </aside>
        <main {...stylex.props(styles.preview)} aria-label={`Preview of the ${draft ? 'new' : selected} theme`}>
          <ThemeProvider theme={previewTheme} xstyle={[styles.previewTheme, darkBackground && styles.previewThemeDark]}>
            {page === 'simulator' ? (
              <SettingsSim lightenBrandArt={darkBrand} />
            ) : (
              <div {...stylex.props(styles.placeholder)}>
                <Text variant="body-large">The {page} view is coming soon.</Text>
              </div>
            )}
          </ThemeProvider>
        </main>
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
        title="Reset themes?"
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
                setColorFormats({});
                setSelected(Object.keys(initialConfig.themes)[0]!);
                focusThemeSelect();
              }}
            >
              Reset themes
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
  // Figma 2422:35486: the sidebar is 380px on the left, the preview fills the rest. Each scrolls on its own.
  body: {
    display: 'grid',
    gridTemplateColumns: '23.75rem minmax(0, 1fr)',
    flexGrow: 1,
    minHeight: 0,
  },
  preview: { overflowY: 'auto' },
  // Decorative and only in this tool: the components themselves still sit on the plain background colour.
  // A decorative brand tint behind the simulator, so components stand out even with borders off. 7% is enough on
  // light backgrounds; on very dark ones it barely shows, so it goes up to 10%.
  previewTheme: { minHeight: '100%', backgroundColor: `color-mix(in srgb, ${color.brand} 7%, ${color.background})` },
  previewThemeDark: { backgroundColor: `color-mix(in srgb, ${color.brand} 10%, ${color.background})` },
  placeholder: { padding: spacing['2xl'] },
  // A column, so the Export footer sits at the bottom when the settings are short.
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: color.background,
    borderInlineEndWidth: borderWidth.widthSm,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: color.brand,
  },
  // Sticks to the top of the sidebar, with a full-width line under it in the sidebar's border width and colour.
  themeBar: {
    position: 'sticky',
    insetBlockStart: 0,
    // Above the sticky section headings (1), so one pushed up by the next section slides under the row.
    zIndex: 2,
    paddingInline: spacing.md,
    paddingBlockStart: spacing.sm,
    paddingBlockEnd: spacing.md,
    backgroundColor: color.background,
    '::after': {
      content: "''",
      position: 'absolute',
      insetInline: 0,
      insetBlockEnd: 0,
      height: borderWidth.widthSm,
      backgroundColor: color.border,
    },
  },
  // 24px from the line to the first heading's text (Figma 2437:2652), less the sticky heading's own top padding.
  settings: { padding: spacing.md, paddingBlockStart: spacing.sm },
  // Sticks to the bottom of the sidebar, with the same full-width line above it.
  footer: {
    position: 'sticky',
    insetBlockEnd: 0,
    zIndex: 1,
    marginBlockStart: 'auto',
    paddingInline: spacing.md,
    paddingBlock: spacing.sm,
    backgroundColor: color.background,
    '::before': {
      content: "''",
      position: 'absolute',
      insetInline: 0,
      insetBlockStart: 0,
      height: borderWidth.widthSm,
      backgroundColor: color.border,
    },
  },
  exportButton: { width: '100%' },
});

/**
 * How the simulator's decoration adapts to a theme: a stronger page tint on a very dark background (black up to about
 * #3B3B3B), and a lighter brand in the illustration when the brand is dark (e.g. the light demo's #7406EB).
 */
export function simulatorTones(colors: ThemeSettings['colors']) {
  const lum = (hex: string) => {
    try {
      return luminance(parseHex(hex));
    } catch {
      return 1;
    }
  };
  return { darkBackground: lum(colors.background) < 0.05, darkBrand: lum(colors.brand) < 0.18 };
}
