import * as stylex from '@stylexjs/stylex';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ComboBox, ComboBoxItem, type FontChoice } from 'themis-ds';

import { color } from '../../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../../src/tokens/fontTheme.stylex';
import { spacing } from '../../../../src/tokens/spacing.stylex';
import { font } from '../../../../src/tokens/typography.stylex';
import { loadFontPreviews, previewFontFamily } from './font-previews';
import { fontChoiceFor, type GoogleFont, loadGoogleFonts, searchFonts } from './google-fonts';

const fontFamily = (choice: FontChoice) => (typeof choice === 'string' ? choice : choice.family);

interface FontFieldProps {
  label: string;
  value: FontChoice;
  onChange: (choice: FontChoice) => void;
}

/**
 * Picks a font from every Google Fonts family: type to search (names starting with what's typed come first, then
 * names containing it, most popular first), or open the list for the most popular ones. Each option shows its name in
 * that font, and says what kind of font it is; the box shows the chosen font in its own face.
 */
export function FontField({ label, value, onChange }: FontFieldProps) {
  const family = fontFamily(value);
  const [fonts, setFonts] = useState<GoogleFont[] | null>(null);
  const [inputValue, setInputValue] = useState(family);
  // What the list is filtered by: what's been typed, or nothing when the list is opened from the caret or arrow keys.
  const [query, setQuery] = useState('');
  // Set when an option is chosen, so the list closing doesn't put the old name back.
  const chose = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let live = true;
    void loadGoogleFonts().then((all) => live && setFonts(all));
    return () => {
      live = false;
    };
  }, []);
  // Follow the value when it changes from outside (another theme chosen, a file imported).
  useEffect(() => setInputValue(family), [family]);

  const items = useMemo(() => {
    const current: GoogleFont = fonts?.find((f) => f.family === family) ?? { family, category: '', weights: [] };
    const found = searchFonts(fonts ?? [], query);
    // Unfiltered, the current font leads the list (it may not be among the most popular).
    if (query.trim()) return found;
    return found.some((f) => f.family === family) ? found : [current, ...found];
  }, [fonts, query, family]);

  // While the list is open, show each listed name in its own font (tiny subsets; see font-previews.ts). Waits for a
  // pause in typing, so it doesn't fetch for every keystroke.
  useEffect(() => {
    if (!isOpen || !fonts) return;
    const timer = setTimeout(() => loadFontPreviews(items), 150);
    return () => clearTimeout(timer);
  }, [isOpen, fonts, items]);

  // The box shows the chosen font in its own face (the theme has loaded it for the preview). While a search is typed,
  // it's back in the tool's font. ComboBox doesn't style its input from outside, so set it on the element directly.
  const wrapRef = useRef<HTMLDivElement>(null);
  const showsChoice = inputValue === family;
  useLayoutEffect(() => {
    const input = wrapRef.current?.querySelector('input');
    if (input) input.style.fontFamily = showsChoice ? `${JSON.stringify(family)}, ${fontTheme.familyBody}` : '';
  }, [showsChoice, family]);

  return (
    <div ref={wrapRef} {...stylex.props(styles.wrap)}>
      <ComboBox
        label={label}
        items={items}
        selectedKey={family}
        inputValue={inputValue}
        onInputChange={(text) => {
          setInputValue(text);
          setQuery(text);
        }}
        onOpenChange={(open, trigger) => {
          setIsOpen(open);
          if (open && trigger !== 'input') setQuery('');
          if (!open) chose.current = false;
        }}
        // Typing is a search, not a value: leaving the box without choosing puts the current font's name back. (The
        // list only holds matches, so React Aria can't do that itself.)
        allowsCustomValue
        onBlur={() => {
          if (chose.current) return;
          setInputValue(family);
          setQuery('');
        }}
        onSelectionChange={(key) => {
          if (key == null) return;
          chose.current = true;
          const chosen = items.find((f) => f.family === key);
          if (chosen && chosen.family !== family) onChange(fonts ? fontChoiceFor(chosen) : chosen.family);
          setInputValue(String(key));
          setQuery('');
        }}
        emptyText="No Google Fonts match."
      >
        {(f: GoogleFont) => (
          <ComboBoxItem id={f.family} textValue={f.family}>
            <span {...stylex.props(styles.option)}>
              <span {...stylex.props(styles.name)} style={{ fontFamily: previewFontFamily(f.family, fontTheme.familyBody) }}>
                {f.family}
              </span>
              {f.category && <span {...stylex.props(styles.category)}>{f.category}</span>}
            </span>
          </ComboBoxItem>
        )}
      </ComboBox>
    </div>
  );
}

const styles = stylex.create({
  wrap: { display: 'flex', flexDirection: 'column' },
  option: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm, width: '100%', minWidth: 0 },
  // A long name gives way (with an ellipsis) so the category always shows.
  name: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  // The kind of font, in muted caption text at the end of the option.
  category: { flexShrink: 0, fontSize: font.sizeCaption, lineHeight: font.lineHeightCaption, color: color.textPlaceholderDefault },
});
