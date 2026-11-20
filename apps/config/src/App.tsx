import * as stylex from '@stylexjs/stylex';
import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Modal,
  SegmentedControl,
  SegmentedControlItem,
  Text,
  type ThemeSettings,
  ThemeProvider,
  type ThemisConfig,
  ToastRegion,
} from 'themis-ds';

import { luminance, parseHex } from '../../../src/theme/color-math';
import { border as borderWidth } from '../../../src/tokens/borderWidth.stylex';
import { color } from '../../../src/tokens/colorTheme.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { AppHeader, type Page } from './AppHeader';
import { DrawerHandle, MAX_SHARE, MIN_SHARE } from './DrawerHandle';
import { ExportModal } from './ExportModal';
import { initialConfig } from './initial-config';
import { type ColorFormats, loadColorFormats, loadPreviewShare, loadSaved, save, saveColorFormats, savePreviewShare } from './storage';
import { ThemeSettingsForm } from './SettingsPanel';
import { SettingsSim, type SimView } from './SettingsSim';
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

/**
 * How the tool is laid out for the window's width:
 * - `desktop` (64em and up): the settings in a sidebar on the left, the preview beside them.
 * - `tablet` (48em to 64em): the preview on top, the settings under it as tabs, Export beside the theme.
 * - `mobile` (under 48em, Figma 2443:14356): one column, settings or preview (a switch under the theme), Export
 *   pinned to the bottom.
 * 48em is the breakpoint the type scale uses too.
 */
type Layout = 'mobile' | 'tablet' | 'desktop';
const WIDE = '(min-width: 64em)';
const MEDIUM = '(min-width: 48em)';
const currentLayout = (): Layout => (matchMedia(WIDE).matches ? 'desktop' : matchMedia(MEDIUM).matches ? 'tablet' : 'mobile');

function useLayout() {
  const [layout, setLayout] = useState(currentLayout);
  useEffect(() => {
    const queries = [matchMedia(WIDE), matchMedia(MEDIUM)];
    const update = () => setLayout(currentLayout());
    for (const q of queries) q.addEventListener('change', update);
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);
  return layout;
}

const PREVIEW_ID = 'preview';

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
  const layout = useLayout();
  // On mobile, the settings and the preview take turns in the one column.
  const [mobileView, setMobileView] = useState<'settings' | 'preview'>('settings');
  // The simulator's account / subscription view, kept here so it survives the preview remounting on a layout change.
  const [simView, setSimView] = useState<SimView>('account');
  // On tablet, how much of the height the preview has; the settings drawer below it is dragged up and down.
  // Remembered in this browser.
  const [previewShare, setPreviewShare] = useState(() => loadPreviewShare(MIN_SHARE, MAX_SHARE));
  useEffect(() => savePreviewShare(previewShare), [previewShare]);
  const tabletRef = useRef<HTMLDivElement>(null);

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

  // Section headings (and tablet's tabs) stick just below the theme row, whose height changes (the name field, its
  // error message). Set on whatever scrolls them: the sidebar, or mobile's single column.
  const scrollerRef = useRef<HTMLElement>(null);
  const themeBarRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const bar = themeBarRef.current;
    if (!bar) return;
    const place = () => scrollerRef.current?.style.setProperty('--theme-bar-height', `${bar.offsetHeight}px`);
    place();
    const observer = new ResizeObserver(place);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [layout]);

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

  const themeRow = naming ? (
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
  );
  const settings = (
    <div {...stylex.props(styles.settings)}>
      <ThemeSettingsForm
        theme={theme}
        onChange={updateTheme}
        colorFormats={formats}
        onColorFormatsChange={updateFormats}
        layout={layout === 'tablet' ? 'tabs' : 'sections'}
      />
    </div>
  );
  // Export is off while a new theme is being named: it isn't part of the file yet. Full width, except beside the
  // theme on tablet.
  const exportButton = (
    <Button
      size="medium"
      isDisabled={draft != null}
      onPress={() => setDialog('export')}
      xstyle={layout !== 'tablet' && styles.exportButton}
    >
      Export
    </Button>
  );
  const preview = (
    <main
      id={PREVIEW_ID}
      {...stylex.props(styles.preview, layout === 'mobile' && styles.previewMobile)}
      aria-label={`Preview of the ${draft ? 'new' : selected} theme`}
    >
      <ThemeProvider theme={previewTheme} xstyle={[styles.previewTheme, darkBackground && styles.previewThemeDark]}>
        {page === 'simulator' ? (
          <SettingsSim
            lightenBrandArt={darkBrand}
            view={simView}
            onViewChange={setSimView}
            toastPlacement={layout === 'tablet' ? 'top-right' : 'bottom-right'}
          />
        ) : (
          <div {...stylex.props(styles.placeholder)}>
            <Text variant="body-large">The {page} view is coming soon.</Text>
          </div>
        )}
      </ThemeProvider>
    </main>
  );

  return (
    <ThemeProvider modes={{ colorTheme: 'themis config', fontTheme: 'themis', borderWidth: 'themis config', radius: 'themis config' }} xstyle={styles.app}>
      <AppHeader page={page} compact={layout === 'mobile'} besideSidebar={layout === 'desktop'} />
      {layout === 'desktop' && (
        <div {...stylex.props(styles.body)}>
          <aside ref={scrollerRef} {...stylex.props(styles.sidebar)} aria-label="Theme settings">
            <div ref={themeBarRef} {...stylex.props(styles.themeBar)}>
              {themeRow}
            </div>
            {settings}
            <div {...stylex.props(styles.footer)}>{exportButton}</div>
          </aside>
          {preview}
        </div>
      )}
      {layout === 'tablet' && (
        <div
          ref={tabletRef}
          {...stylex.props(styles.bodyTablet)}
          style={{ gridTemplateRows: `minmax(0, ${previewShare * 100}%) minmax(0, 1fr)` }}
        >
          {preview}
          <div {...stylex.props(styles.drawer)}>
            <DrawerHandle value={previewShare} onChange={setPreviewShare} containerRef={tabletRef} controls={PREVIEW_ID} />
            <aside ref={scrollerRef} {...stylex.props(styles.sidebar, styles.sidebarTablet)} aria-label="Theme settings">
              <div ref={themeBarRef} {...stylex.props(styles.themeBar, styles.themeBarTablet)}>
                <div {...stylex.props(styles.grow)}>{themeRow}</div>
                {exportButton}
              </div>
              {settings}
            </aside>
          </div>
        </div>
      )}
      {layout === 'mobile' && (
        <div ref={scrollerRef as React.RefObject<HTMLDivElement>} {...stylex.props(styles.column)}>
          <div ref={themeBarRef} {...stylex.props(styles.themeBar, styles.themeBarMobile)}>
            {themeRow}
            <SegmentedControl
              aria-label="Show"
              size="medium"
              isFullWidth
              selectedKey={mobileView}
              onSelectionChange={(key) => setMobileView(key as 'settings' | 'preview')}
            >
              <SegmentedControlItem id="settings">Settings</SegmentedControlItem>
              <SegmentedControlItem id="preview">Preview</SegmentedControlItem>
            </SegmentedControl>
          </div>
          {mobileView === 'settings' ? (
            <aside aria-label="Theme settings">{settings}</aside>
          ) : (
            preview
          )}
          <div {...stylex.props(styles.footer)}>{exportButton}</div>
        </div>
      )}

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
  // Tablet: the preview on top, the settings under it, each scrolling on its own.
  // The rows come from the drawer's position (40% preview to start).
  bodyTablet: {
    display: 'grid',
    flexGrow: 1,
    minHeight: 0,
  },
  // The settings drawer: a line along its top, the grab handle, then the settings scrolling on their own.
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: color.background,
    borderBlockStartWidth: borderWidth.widthSm,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: color.border,
  },
  // Mobile: one column that scrolls, with the theme row stuck to the top and Export to the bottom.
  column: { display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflowY: 'auto' },
  preview: { overflowY: 'auto' },
  // Mobile: in the column's flow, filling the space between the theme row and Export.
  previewMobile: { overflowY: 'visible', flexGrow: 1 },
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
  // Tablet: the drawer draws the line above; no edge on the side.
  sidebarTablet: { flexGrow: 1, minHeight: 0, borderInlineEndWidth: 0 },
  // Tablet: Export at the end of the theme row, lined up with the select's box.
  themeBarTablet: { display: 'flex', alignItems: 'flex-end', gap: spacing.xs },
  grow: { flexGrow: 1, minWidth: 0 },
  // Mobile: the Settings | Preview switch 16px under the theme.
  themeBarMobile: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
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
