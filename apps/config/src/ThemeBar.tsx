import * as stylex from '@stylexjs/stylex';
import { type RefObject, useEffect, useRef } from 'react';
import {
  ActionMenu,
  ActionMenuItem,
  ActionMenuTrigger,
  Icon,
  IconButton,
  Select,
  SelectItem,
  SelectSeparator,
  type ThemeSettings,
  TextInput,
  Tooltip,
  TooltipTrigger,
} from 'themis-ds';

import { font } from '../../../src/tokens/typography.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';
import { ThemeDots } from './ThemeDots';

const ADD_THEME = '__add-theme__';

interface ThemePickerProps {
  themes: Record<string, ThemeSettings>;
  selected: string;
  onSelect: (name: string) => void;
  onAdd: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** Where focus goes back to after naming a theme. */
  selectRef: RefObject<HTMLDivElement | null>;
}

/** Figma "Theme" row: switch theme (with "Add new theme" at the end), and the current theme's actions. */
export function ThemePicker({ themes, selected, onSelect, onAdd, onRename, onDuplicate, onDelete, selectRef }: ThemePickerProps) {
  const names = Object.keys(themes);
  return (
    <div {...stylex.props(styles.row)}>
      <div ref={selectRef} {...stylex.props(styles.grow)}>
        <Select label="Theme" value={selected} onChange={(key) => key != null && onSelect(String(key))}>
          {[
            ...names.map((name) => (
              <SelectItem key={name} id={name} textValue={name} icon={<ThemeDots colors={themes[name]!.colors} />}>
                {name}
              </SelectItem>
            )),
            <SelectSeparator key="separator" />,
            <SelectItem key={ADD_THEME} id={ADD_THEME} icon={<Icon name="plus" />} onAction={onAdd}>
              Add new theme
            </SelectItem>,
          ]}
        </Select>
      </div>
      <ActionMenuTrigger>
        <TooltipTrigger>
          <IconButton aria-label={`Actions for the ${selected} theme`} variant="outline" size="medium" xstyle={styles.button}>
            <Icon name="ellipsis-vertical" />
          </IconButton>
          <Tooltip>Theme actions</Tooltip>
        </TooltipTrigger>
        <ActionMenu placement="bottom end">
          <ActionMenuItem id="rename" onAction={onRename}>
            Rename…
          </ActionMenuItem>
          <ActionMenuItem id="duplicate" onAction={onDuplicate}>
            Duplicate
          </ActionMenuItem>
          <ActionMenuItem id="add" onAction={onAdd}>
            Add new theme
          </ActionMenuItem>
          {/* A theme file needs at least one theme. */}
          <ActionMenuItem id="delete" isDanger isDisabled={names.length < 2} onAction={onDelete}>
            Delete…
          </ActionMenuItem>
        </ActionMenu>
      </ActionMenuTrigger>
    </div>
  );
}

interface ThemeNameFieldProps {
  label: string;
  value: string;
  error?: string;
  confirmLabel: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Figma "New theme name": replaces the theme row while naming a new, duplicated or renamed theme.
 * Enter confirms, Escape cancels; the ✓ stays enabled so an empty or taken name shows its error.
 */
export function ThemeNameField({ label, value, error, confirmLabel, onChange, onConfirm, onCancel }: ThemeNameFieldProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Focus the field when it opens, and again when ✓ finds a problem, so the name can be fixed straight away.
  useEffect(() => {
    ref.current?.querySelector('input')?.focus();
  }, [error]);
  return (
    <div ref={ref} {...stylex.props(styles.row)}>
      <TextInput
        label={label}
        placeholder="e.g. high contrast"
        value={value}
        onChange={onChange}
        isInvalid={error != null}
        errorMessage={error}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onConfirm();
          if (e.key === 'Escape') onCancel();
        }}
        xstyle={styles.grow}
      />
      <TooltipTrigger>
        <IconButton aria-label={confirmLabel} size="medium" onPress={onConfirm} xstyle={styles.button}>
          <Icon name="check" />
        </IconButton>
        <Tooltip>{confirmLabel}</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <IconButton aria-label="Cancel" variant="outline" size="medium" onPress={onCancel} xstyle={styles.button}>
          <Icon name="x" />
        </IconButton>
        <Tooltip>Cancel</Tooltip>
      </TooltipTrigger>
    </div>
  );
}

const styles = stylex.create({
  // Buttons line up with the box, not the label, and stay put when an error appears under the field.
  row: { display: 'flex', alignItems: 'flex-start', gap: spacing.xs },
  grow: { flexGrow: 1, minWidth: 0 },
  button: { flexShrink: 0, marginBlockStart: `calc(${font.lineHeightLabel} + ${spacing['2xs']})` },
});
