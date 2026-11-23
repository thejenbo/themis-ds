import * as stylex from '@stylexjs/stylex';
import { Children, createContext, isValidElement, type MouseEvent, type ReactElement, type ReactNode, useContext, useEffect, useState } from 'react';
import { useFocusRing, useHover } from 'react-aria';
import { Button, type ButtonRenderProps, type Key, type SortDescriptor } from 'react-aria-components';

import { border as borderWidth } from '../../tokens/borderWidth.stylex';
import { color } from '../../tokens/colorTheme.stylex';
import { font as fontTheme } from '../../tokens/fontTheme.stylex';
import { duration, easing } from '../../tokens/motion.stylex';
import { color as primitive } from '../../tokens/primitives.stylex';
import { border as radius } from '../../tokens/radius.stylex';
import { spacing } from '../../tokens/spacing.stylex';
import { font } from '../../tokens/typography.stylex';
import { focusRing } from '../../utils/focus-ring';
import { racStyles } from '../../utils/stylex-rac';
import { fieldStyles } from '../TextInput/field-base';
import { Icon } from '../Icon';

export type { SortDescriptor };

interface TableContextValue {
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;
  onRowAction?: (key: Key) => void;
  columnCount: number;
}
const TableContext = createContext<TableContextValue>({ columnCount: 1 });

interface RowContextValue {
  id?: Key;
  setActionFocused: (focused: boolean) => void;
}
const RowContext = createContext<RowContextValue>({ setActionFocused: () => {} });

export interface TableProps {
  /** `TableHeader` and `TableBody`. */
  children: ReactNode;
  /** Names the table for screen readers ("Projects"). Use this or `aria-labelledby`. */
  'aria-label'?: string;
  /** The id of a visible heading that names the table. Use this or `aria-label`. */
  'aria-labelledby'?: string;
  /** The id of text that describes the table, read after its name. */
  'aria-describedby'?: string;
  /** The current sort: which `Column` (by `id`) and which direction. Sortable columns show it. */
  sortDescriptor?: SortDescriptor;
  /** Called with the new sort when a sortable heading is pressed: ascending first, then descending. Sort your rows in it. */
  onSortChange?: (descriptor: SortDescriptor) => void;
  /**
   * Called with a row's `id` when the row is clicked, or when its row header button is pressed (keyboard users Tab
   * to it). Rows then tint on hover and show the pointer cursor; a read-only table has no row hover. Each row needs
   * an `id` and a `Cell` with `isRowHeader`.
   */
  onRowAction?: (key: Key) => void;
  /**
   * Drop the frame's border, for a table inside something that already has a border, such as an Accordion or a
   * Modal. The rounded corners and the lines between rows stay. Figma: Table `border` off.
   */
  hideBorder?: boolean;
  /** Layout-only StyleX overrides for the outer frame (margin, width, grid placement). Do not restyle colors. */
  xstyle?: stylex.StyleXStyles;
}

/**
 * Rows of data in columns, with optional sorting and a row action. A plain HTML table: screen readers use their own
 * table commands, and keyboard users Tab only to what they can act on (sortable headings, each row's action and
 * controls in cells such as an ActionMenu). Columns size to their content; on narrow screens the table scrolls
 * sideways inside its rounded border.
 */
export function Table({ children, sortDescriptor, onSortChange, onRowAction, hideBorder = false, xstyle, ...labeling }: TableProps) {
  const header = Children.toArray(children).find(
    (c): c is ReactElement<TableHeaderProps> => isValidElement(c) && c.type === TableHeader,
  );
  const columnCount = Math.max(1, Children.toArray(header?.props.children).filter(isValidElement).length);
  return (
    <div {...stylex.props(styles.frame, hideBorder && styles.frameBorderless, xstyle)}>
      <TableContext.Provider value={{ sortDescriptor, onSortChange, onRowAction, columnCount }}>
        <table {...labeling} {...stylex.props(styles.table)}>
          {children}
        </table>
      </TableContext.Provider>
    </div>
  );
}

export interface TableHeaderProps {
  /** The `Column`s, in order. */
  children: ReactNode;
}

/** The brand-colored header row. */
export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead>
      <tr {...stylex.props(styles.headerRow)}>{children}</tr>
    </thead>
  );
}

export interface ColumnProps {
  /** Identifies the column in `sortDescriptor`. Required for sortable columns. */
  id?: Key;
  /** The column's heading. Screen readers read it with every cell in the column. */
  children: ReactNode;
  /** Makes the heading a button that sorts by this column: ascending first, then descending. */
  allowsSorting?: boolean;
  /**
   * Hide the heading visually but keep it for screen readers, e.g. "Actions" above a column of ⋮ menus.
   * The column then shrinks to fit its content unless you give it a `width`.
   */
  hideLabel?: boolean;
  /** A fixed width for the column, as a CSS length (`'12rem'`, `'30%'`) or pixels. By default columns size to their content. */
  width?: string | number;
}

/**
 * A column heading. With `allowsSorting` it holds a button that sorts by the column: an arrow shows the order, and
 * hovering or focusing an unsorted heading shows a faint arrow. The heading tells screen readers the sort order.
 */
export function Column({ id, children, allowsSorting = false, hideLabel = false, width }: ColumnProps) {
  const { sortDescriptor, onSortChange } = useContext(TableContext);
  const direction = id != null && sortDescriptor?.column === id ? sortDescriptor.direction : undefined;
  const label = <span {...stylex.props(hideLabel && fieldStyles.visuallyHidden)}>{children}</span>;
  return (
    <th
      scope="col"
      aria-sort={direction}
      style={{ width: width ?? (hideLabel ? '1px' : undefined) }}
      {...stylex.props(styles.headerCell, allowsSorting && styles.headerCellSortable)}
    >
      {allowsSorting ? (
        <Button
          onPress={() => id != null && onSortChange?.({ column: id, direction: direction === 'ascending' ? 'descending' : 'ascending' })}
          {...racStyles<ButtonRenderProps>((s) => [
            styles.sortButton,
            s.isHovered && styles.sortButtonHovered,
            focusRing.base,
            s.isFocusVisible && focusRing.visible,
            s.isFocusVisible && focusRing.inset,
            s.isFocusVisible && styles.squareRing,
          ])}
        >
          {(s) => (
            <>
              {label}
              <span
                aria-hidden="true"
                {...stylex.props(
                  styles.sortIcon,
                  direction == null && styles.sortHint,
                  direction == null && (s.isHovered || s.isFocusVisible) && styles.sortHintShown,
                )}
              >
                <Icon name={direction === 'descending' ? 'arrow-down' : 'arrow-up'} />
              </span>
            </>
          )}
        </Button>
      ) : (
        label
      )}
    </th>
  );
}

export interface TableBodyProps {
  /** The `Row`s. */
  children?: ReactNode;
  /**
   * Shown in one full-width row when there are no rows.
   * @default 'No results'
   */
  emptyText?: ReactNode;
}

/** The rows. Shows `emptyText` when there are none. */
export function TableBody({ children, emptyText = 'No results' }: TableBodyProps) {
  const { columnCount } = useContext(TableContext);
  const hasRows = Children.toArray(children).some(isValidElement);
  return (
    <tbody>
      {hasRows ? (
        children
      ) : (
        <tr>
          <td colSpan={columnCount} {...stylex.props(styles.cell, styles.empty)}>
            {emptyText}
          </td>
        </tr>
      )}
    </tbody>
  );
}

export interface RowProps {
  /** Identifies the row; passed to the table's `onRowAction`. */
  id?: Key;
  /** The `Cell`s, one per column. */
  children: ReactNode;
}

/**
 * A row of `Cell`s, 56px, with a brand-colored line below every row but the last. When the table has an
 * `onRowAction`, the row tints on hover (brand-tint), shows the pointer cursor, and runs the action when clicked
 * anywhere that isn't another control.
 */
export function Row({ id, children }: RowProps) {
  const { onRowAction } = useContext(TableContext);
  const actionable = onRowAction != null && id != null;
  const { hoverProps, isHovered } = useHover({ isDisabled: !actionable });
  const [actionFocused, setActionFocused] = useState(false);
  const onClick = (e: MouseEvent<HTMLTableRowElement>) => {
    const target = e.target as Element;
    // Leave clicks to other controls (the ⋮ menu, links) and to menus portalled out of the row.
    if (!e.currentTarget.contains(target) || target.closest('a, button, input, select, textarea, [role="menuitem"]')) return;
    onRowAction?.(id!);
  };
  return (
    <RowContext.Provider value={{ id, setActionFocused }}>
      <tr
        {...hoverProps}
        onClick={actionable ? onClick : undefined}
        data-focus-visible={actionFocused || undefined}
        {...stylex.props(
          // The row's focus ring is drawn by its cells (see `rowRing`), because browsers lay out a ::before on a
          // <tr> as an extra cell. They draw it while this marked row has data-focus-visible.
          stylex.defaultMarker(),
          styles.row,
          actionable && styles.rowActionable,
          actionable && isHovered && styles.rowHovered,
        )}
      >
        {children}
      </tr>
    </RowContext.Provider>
  );
}

export interface CellProps {
  /** The cell's content: text, or a control such as an ActionMenu trigger. */
  children?: ReactNode;
  /**
   * Marks the cell that names its row (usually the first), so screen readers read it with the row's other cells.
   * When the table has an `onRowAction`, this cell's content becomes the row's action button.
   */
  isRowHeader?: boolean;
}

/** One value in a row. */
export function Cell({ children, isRowHeader = false }: CellProps) {
  const { onRowAction } = useContext(TableContext);
  const { id, setActionFocused } = useContext(RowContext);
  const sx = stylex.props(styles.cell, styles.rowRing);
  if (!isRowHeader) return <td {...sx}>{children}</td>;
  return (
    <th scope="row" {...sx}>
      {onRowAction != null && id != null ? (
        <RowActionButton onPress={() => onRowAction(id)} onFocusVisibleChange={setActionFocused}>
          {children}
        </RowActionButton>
      ) : (
        children
      )}
    </th>
  );
}

/** The row header's content as a plain-looking button: the keyboard way to run the row action. The row shows its ring. */
function RowActionButton({ children, onPress, onFocusVisibleChange }: { children: ReactNode; onPress: () => void; onFocusVisibleChange: (focused: boolean) => void }) {
  const { focusProps, isFocusVisible } = useFocusRing();
  useEffect(() => onFocusVisibleChange(isFocusVisible), [isFocusVisible, onFocusVisibleChange]);
  return (
    <button type="button" {...focusProps} onClick={onPress} {...stylex.props(styles.rowAction)}>
      {children}
    </button>
  );
}


const styles = stylex.create({
  // Figma "Table": border/width/mandatory in color/border all round, radius md, so the table keeps its edge when
  // the border-width mode is "none". Scrolls sideways when too narrow. Positioned, so absolutely placed content (a
  // visually hidden column label) is placed and clipped within the frame instead of widening the page around it.
  frame: {
    position: 'relative',
    overflowX: 'auto',
    borderStyle: 'solid',
    borderWidth: borderWidth.widthMandatory,
    borderColor: color.border,
    borderRadius: radius.radiusMd,
    backgroundColor: color.background,
  },
  frameBorderless: { borderWidth: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  headerRow: { backgroundColor: color.brand },
  // Figma "Table Header Cell": type/label/base in text-inverse on brand, 16px padding (the row is 56px tall).
  headerCell: {
    paddingBlock: spacing.sm,
    // 16px before every heading, and after the last one: the space between columns and at the edges.
    paddingInlineStart: spacing.sm,
    paddingInlineEnd: { default: 0, ':last-child': spacing.sm },
    textAlign: 'start',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeLabel,
    lineHeight: font.lineHeightLabel,
    fontWeight: font.weightSemibold,
    color: color.textInverse,
  },
  // The sort button fills the heading, so the whole heading is the target and tints on hover.
  headerCellSortable: { paddingBlock: 0, paddingInlineStart: 0, paddingInlineEnd: 0 },
  sortButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: spacing['2xs'],
    boxSizing: 'border-box',
    width: '100%',
    margin: 0,
    paddingBlock: spacing.sm,
    paddingInline: spacing.sm,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    userSelect: 'none',
    transitionProperty: 'background-color',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  // Like a filled button's hover: the fill shifts away from its text, so contrast only goes up.
  sortButtonHovered: { backgroundColor: color.brandHover },
  sortIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', flexShrink: 0 },
  // Unsorted sortable columns: the arrow's space is kept, so headings don't shift; it shows faintly on hover/focus.
  sortHint: {
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  sortHintShown: { opacity: 0.6 },
  // Figma "Table Row": 56px, a border/width/mandatory line in border-brand below every row but the last.
  row: {
    backgroundColor: 'transparent',
    borderBottomStyle: 'solid',
    borderBottomWidth: { default: borderWidth.widthMandatory, ':last-child': 0 },
    borderBottomColor: color.borderBrand,
    transitionProperty: 'background-color',
    transitionDuration: { default: duration.fast, '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: easing.standard,
  },
  rowActionable: { cursor: 'pointer' },
  rowHovered: { backgroundColor: color.brandTint },
  // Body cells use the regular input text style, so the semibold header stands apart (Figma: semibold label).
  cell: {
    position: 'relative',
    paddingBlock: spacing.sm,
    paddingInlineStart: spacing.sm,
    paddingInlineEnd: { default: 0, ':last-child': spacing.sm },
    textAlign: 'start',
    verticalAlign: 'middle',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    fontWeight: font.weightRegular,
    color: color.text,
  },
  // The row header's action button looks like the cell's plain text; the row shows its focus ring.
  rowAction: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    outline: 'none',
  },
  /*
   * The row's focus ring, drawn by its cells: each cell paints its slice on ::after (top and bottom, plus the outer
   * side on the first and last cell), 2px inside the row like the shared inset ring. Black dashes over a white
   * backing (the white background is masked to the border area), so it shows on any theme.
   */
  rowRing: {
    '::after': {
      content: { default: 'none', [stylex.when.ancestor('[data-focus-visible]')]: "''" },
      position: 'absolute',
      zIndex: 1,
      insetBlock: spacing['3xs'],
      insetInlineStart: { default: 0, ':first-child': spacing['3xs'] },
      insetInlineEnd: { default: 0, ':last-child': spacing['3xs'] },
      borderStyle: 'dashed',
      borderColor: primitive.grayscale1000,
      borderBlockWidth: borderWidth.widthFocusRing,
      borderInlineStartWidth: { default: 0, ':first-child': borderWidth.widthFocusRing },
      borderInlineEndWidth: { default: 0, ':last-child': borderWidth.widthFocusRing },
      backgroundColor: { default: primitive.grayscale000, '@media (forced-colors: active)': 'transparent' },
      maskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',
      maskClip: 'content-box, border-box',
      maskComposite: 'exclude',
      pointerEvents: 'none',
    },
  },
  // Headings are square, so the inside focus ring is too.
  squareRing: { '::before': { borderRadius: 0 } },
  // The empty state, like Select's "no results": the option text style in the disabled-on-background color.
  empty: { color: color.textDisabledOnBackground },
});
