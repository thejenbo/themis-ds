# Changelog

All notable changes to Themis are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/). Until 1.0, minor versions (0.x.0) may include breaking changes; they're
listed under **Changed** or **Removed** with what to do.

## [Unreleased]

### Added

- Theme files: a JSON format (`themis.theme.json`, version 1) holding named themes, each with six colours, a border
  width, a radius and Google Fonts. `<ThemeProvider theme={config.themes.light}>` applies one; the fonts load
  automatically (`loadFonts={false}` to opt out). A JSON Schema ships as `themis-ds/theme.schema.json`.
- The colour rules behind every Themis theme, in code: `deriveColorTokens` works out all 27 colour tokens from six
  colours (hovers 7% darker, tints at 7%, muted text at 6:1, …), matching the Figma themes.
- `parseThemisConfig` (checks a theme file and lists every problem), `themeVariables`, `googleFontsHref`, and
  `rateThemeColors` / `contrastLevel` for AAA / AA / AA Large / Fail contrast ratings.
- Accordion `tone="danger"`: an error-coloured header for a section of destructive actions, as in Figma.
- `SelectSeparator` and `ComboBoxSeparator`: a 1px divider between groups of options.
- `SelectItem` / `ComboBoxItem` `icon`: a decorative icon before the label.
- Select options with `onAction` (such as "Add new theme") run the action instead of becoming the value.
- A "themis config" mode for radius (2/2/4/6px) and border width (1/2/3/3px), used by the config tool's own UI.
  It isn't a theme-file choice: `THEME_RADII` and `THEME_BORDER_WIDTHS` list the ones that are.
- `<ThemeProvider theme>` treats a theme's missing border width or radius as `medium`, so it no longer picks up an
  outer provider's.

### Changed

- Primitives: `orange/500` is `#A35104`, as in Figma (the export was stale; components already used it).

## [0.1.0] - 2026-11-17

The first release: the base of the design system, matched to the Themis Figma library.

### Added

**Foundations**

- Design tokens exported from Figma variables (DTCG) and built into StyleX variables: colour themes, fonts,
  typography (mobile and desktop), spacing, radius, border width, shadows, motion and system colours.
- `ThemeProvider`: switch each token collection's mode independently (colour theme, font theme, radius, border width,
  shadows), and nest providers.
- Shared interaction behaviour: a black-and-white dashed focus ring shown for keyboard focus only, 44px touch targets
  on touch screens, a 0.96 press shrink, hover tints from the State Layer tokens, and reduced-motion support.
- Contrast checking for every text-on-surface pair (`npm run contrast`), targeting WCAG AA.

**Components (33)**

- Actions: Button, IconButton, ToggleButton.
- Inputs: Checkbox, ComboBox, NumberInput, RadioGroup, Select, Slider, TextArea, TextInput, UnitInput.
- Selection: SegmentedControl, Switch.
- Colour: ColorArea, ColorField, ColorPicker, ColorPickerSwatch, ColorRangeSlider, ColorSlider, ColorSwatch.
- Data display: Avatar, Chip, Icon, Table.
- Disclosure: Accordion. Navigation: Tabs. Feedback: Toast. Overlays: ActionMenu, Modal, Tooltip.
- Typography: Heading, Text.

All are built on React Aria Components, styled with StyleX tokens, and documented in Storybook with interaction and
accessibility tests.

**Icons**

- `Icon`: 27 icons from Lucide, drawn from Lucide's shape data. Lines follow the border width (capped per size), and
  with radius `none` they turn sharp, including hand-drawn sharp versions of settings, copy, heart, folder, trash and
  triangle-alert. Five sizes, 12–32px.

**Documentation and tooling**

- Storybook with a docs page per component (usage, anatomy, accessibility, tokens, motion and how code differs from
  Figma).
- `themis-manifest.json`: a machine-readable description of every component's props, tokens and Figma mapping,
  shipped as `themis-ds/manifest.json`.
- Figma Code Connect templates for every Figma component (Heading and Text are text styles there), so Dev Mode shows
  Themis code.

[0.1.0]: https://github.com/thejenbo/themis-ds/releases/tag/v0.1.0
