import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import type { SortDescriptor } from './Table';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { ThemeProvider } from '../../theme/ThemeProvider';
import { collectionModes } from '../../tokens/themes';
import { ActionMenu, ActionMenuItem, ActionMenuTrigger } from '../ActionMenu';
import { IconButton } from '../IconButton';
import { Cell, Column, Row, Table, TableBody, TableHeader } from './Table';
import { Icon } from '../Icon';
import docs from './Table.docs';

interface Project {
  id: string;
  name: string;
  updated: string;
  owner: string;
}

const PROJECTS: Project[] = [
  { id: 'web', name: 'Website redesign', updated: '2026-11-02', owner: 'Priya Natarajan' },
  { id: 'app', name: 'Mobile app onboarding', updated: '2026-10-18', owner: 'Tomás Herrera' },
  { id: 'brand', name: 'Brand refresh', updated: '2026-11-09', owner: 'Ama Owusu' },
  { id: 'docs', name: 'Help centre', updated: '2026-09-27', owner: 'Lena Fischer' },
  { id: 'billing', name: 'Billing settings', updated: '2026-10-30', owner: 'Kenji Watanabe' },
];

const formatDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function RowActions({ project }: { project: Project }) {
  return (
    <ActionMenuTrigger>
      <IconButton aria-label={`Actions for ${project.name}`} variant="subtle" size="micro">
        <Icon name="ellipsis-vertical" />
      </IconButton>
      <ActionMenu placement="bottom end">
        <ActionMenuItem>Rename</ActionMenuItem>
        <ActionMenuItem>Duplicate</ActionMenuItem>
        <ActionMenuItem isDanger>Delete</ActionMenuItem>
      </ActionMenu>
    </ActionMenuTrigger>
  );
}

/** A sortable projects table, with an actions menu per row. */
function ProjectsTable({ projects = PROJECTS, withActions = true, ...props }: Partial<React.ComponentProps<typeof Table>> & { projects?: Project[]; withActions?: boolean }) {
  const [sort, setSort] = useState<SortDescriptor>({ column: 'updated', direction: 'descending' });
  const rows = useMemo(() => {
    const key = sort.column as keyof Project;
    const sorted = [...projects].sort((a, b) => a[key].localeCompare(b[key]));
    return sort.direction === 'descending' ? sorted.reverse() : sorted;
  }, [projects, sort]);
  return (
    <Table aria-label="Projects" sortDescriptor={sort} onSortChange={setSort} {...props}>
      <TableHeader>
        <Column id="name" allowsSorting>
          Project
        </Column>
        <Column id="updated" allowsSorting>
          Updated
        </Column>
        <Column id="owner">Owner</Column>
        {withActions && (
          <Column id="actions" hideLabel>
            Actions
          </Column>
        )}
      </TableHeader>
      <TableBody>
        {rows.map((project) => (
          <Row key={project.id} id={project.id}>
            <Cell isRowHeader>{project.name}</Cell>
            <Cell>{formatDate(project.updated)}</Cell>
            <Cell>{project.owner}</Cell>
            {withActions && (
              <Cell>
                <RowActions project={project} />
              </Cell>
            )}
          </Row>
        ))}
      </TableBody>
    </Table>
  );
}

const meta = {
  title: 'Data display/Table',
  component: Table,
  subcomponents: { TableHeader, Column, TableBody, Row, Cell },
  tags: ['autodocs'],
  parameters: { themis: docs, docs: { description: { component: docs.summary } } },
  args: { 'aria-label': 'Projects', children: null },
  argTypes: { children: { control: false } },
  render: () => <ProjectsTable />,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click "Project" or "Updated" to sort. Tab moves through the sort buttons, then each row's actions menu. */
export const Playground: Story = {};

/** Interaction test: Tab reaches the sort buttons; pressing one sorts, and the heading announces the order. */
export const Sorting: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const projectHeading = canvas.getByRole('columnheader', { name: 'Project' });
    const updatedHeading = canvas.getByRole('columnheader', { name: 'Updated' });
    const project = canvas.getByRole('button', { name: 'Project' });
    await expect(updatedHeading).toHaveAttribute('aria-sort', 'descending');
    await expect(projectHeading).not.toHaveAttribute('aria-sort');
    // An unsorted sortable heading shows a faint arrow and turns brand-hover on hover.
    const hint = project.querySelector('[aria-hidden="true"]')!;
    await expect(getComputedStyle(hint).opacity).toBe('0');
    await userEvent.hover(project);
    await waitFor(() => expect(getComputedStyle(hint).opacity).toBe('0.6'));
    await waitFor(() => expect(getComputedStyle(project).backgroundColor).toBe('rgb(108, 5, 218)'));
    await userEvent.unhover(project);
    // Keyboard: the first Tab stop is the first sort button; Enter sorts.
    const user = userEvent.setup();
    await user.click(document.body);
    await user.tab();
    await expect(project).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(project, '::before').outlineStyle).toBe('dashed'));
    await user.keyboard('{Enter}');
    await expect(projectHeading).toHaveAttribute('aria-sort', 'ascending');
    await expect(updatedHeading).not.toHaveAttribute('aria-sort');
    const firstRow = () => canvas.getAllByRole('row')[1]!;
    await expect(firstRow()).toHaveTextContent('Billing settings');
    await user.keyboard('{Enter}');
    await expect(projectHeading).toHaveAttribute('aria-sort', 'descending');
    await expect(firstRow()).toHaveTextContent('Website redesign');
  },
};

/** With `onRowAction`, rows tint on hover and open on click. Keyboard users Tab to each row's name and press Enter. */
export const RowAction: Story = {
  args: { onRowAction: fn() },
  render: (args) => <ProjectsTable withActions={false} onRowAction={args.onRowAction} />,
  play: async ({ args, canvas }) => {
    const row = canvas.getByRole('row', { name: /Brand refresh/ });
    await expect(getComputedStyle(row).cursor).toBe('pointer');
    await userEvent.hover(row);
    await waitFor(() => expect(getComputedStyle(row).backgroundColor).toMatch(/^rgba\(116, 6, 235, 0\.07\d*\)$/));
    // Clicking anywhere on the row runs the action, not only the name.
    await userEvent.click(canvas.getByText('Ama Owusu'));
    await expect(args.onRowAction).toHaveBeenLastCalledWith('brand');
    // Keyboard: after the sort buttons, Tab reaches each row's name button; the whole row shows the ring.
    const user = userEvent.setup();
    await user.click(document.body);
    await user.tab();
    await user.tab();
    await user.tab();
    const name = canvas.getByRole('button', { name: 'Brand refresh' });
    await expect(name).toHaveFocus();
    const nameCell = name.closest('th')!;
    await waitFor(() => expect(getComputedStyle(nameCell, '::after').borderTopStyle).toBe('dashed'));
    await expect(getComputedStyle(row.lastElementChild!, '::after').borderRightStyle).toBe('dashed');
    await user.keyboard('{Enter}');
    await expect(args.onRowAction).toHaveBeenCalledTimes(2);
    await expect(args.onRowAction).toHaveBeenLastCalledWith('brand');
  },
};

/** Interaction test: without `onRowAction`, rows don't tint and keep the default cursor. */
export const ReadOnlyRows: Story = {
  tags: ['test-only', '!autodocs'],
  render: () => <ProjectsTable withActions={false} />,
  play: async ({ canvas }) => {
    const row = canvas.getByRole('row', { name: /Brand refresh/ });
    await userEvent.hover(row);
    await expect(getComputedStyle(row).cursor).toBe('auto');
    await expect(getComputedStyle(row).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(canvas.queryByRole('button', { name: 'Brand refresh' })).toBeNull();
  },
};

/** Interaction test: Figma sizes and borders. */
export const Measurements: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: 'Projects' });
    const frame = getComputedStyle(table.parentElement!);
    await expect(frame.borderTopWidth).toBe('2px');
    await expect(frame.borderTopLeftRadius).not.toBe('0px');
    const [header, ...rows] = canvas.getAllByRole('row');
    await expect(Math.round(header!.getBoundingClientRect().height)).toBe(56);
    await expect(Math.round(rows[0]!.getBoundingClientRect().height)).toBe(58); // 56 + the line (mandatory: 2px in medium)
    await expect(getComputedStyle(rows[0]!).borderBottomWidth).toBe('2px');
    await expect(getComputedStyle(rows.at(-1)!).borderBottomWidth).toBe('0px');
    const headerCell = canvas.getByRole('columnheader', { name: 'Owner' });
    await expect(getComputedStyle(headerCell).fontWeight).toBe('600');
    await expect(getComputedStyle(canvas.getByText('Lena Fischer')).fontWeight).toBe('400');
    await expect(getComputedStyle(canvas.getByRole('rowheader', { name: 'Help centre' })).fontWeight).toBe('400');
    await expect(getComputedStyle(headerCell).paddingLeft).toBe('16px');
    // The actions heading is hidden but read out.
    await expect(canvas.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
  },
};

/** Interaction test: Tab stops are only things you can act on: the sort buttons, then each row's actions menu. */
export const Keyboard: Story = {
  tags: ['test-only', '!autodocs'],
  play: async ({ canvas }) => {
    const user = userEvent.setup();
    await user.tab();
    await expect(canvas.getByRole('button', { name: 'Project' })).toHaveFocus();
    await user.tab();
    await expect(canvas.getByRole('button', { name: 'Updated' })).toHaveFocus();
    await user.tab();
    await expect(document.activeElement).toHaveAccessibleName('Actions for Brand refresh');
    // Plain cells aren't focusable.
    for (const cell of canvas.getAllByRole('cell')) await expect(cell).not.toHaveAttribute('tabindex');
  },
};

/** No rows: one full-width "No results" row. */
export const Empty: Story = {
  render: () => <ProjectsTable projects={[]} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No results')).toHaveAttribute('colspan', '4');
  },
};

/** On a narrow screen the table scrolls sideways inside its border instead of squashing columns. */
export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <ProjectsTable />
    </div>
  ),
  play: async ({ canvas }) => {
    const frame = canvas.getByRole('table').parentElement!;
    await expect(frame.scrollWidth).toBeGreaterThan(frame.clientWidth);
  },
};

/** Each border-width mode. With "none", the table's frame and row lines keep a 1px mandatory border. */
export const BorderWidths: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'grid', gap: 24, padding: 24 }}>
      {collectionModes.borderWidth.map((mode) => (
        <ThemeProvider key={mode} modes={{ borderWidth: mode }}>
          <ProjectsTable aria-label={`Projects (border width ${mode})`} projects={PROJECTS.slice(0, 3)} />
        </ThemeProvider>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const none = canvas.getByRole('table', { name: 'Projects (border width none)' });
    await expect(getComputedStyle(none.parentElement!).borderTopWidth).toBe('1px');
    await expect(getComputedStyle(none.parentElement!).borderBottomWidth).toBe('1px');
    await expect(getComputedStyle(canvas.getAllByRole('row', { name: /Brand refresh/ })[0]!).borderBottomWidth).not.toBe('0px');
  },
};

/** Each colour theme. */
export const ThemeMatrix: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'grid', gap: 24, padding: 24 }}>
      {collectionModes.colorTheme.map((theme) => (
        <ThemeProvider key={theme} modes={{ colorTheme: theme }}>
          <div style={{ padding: 16 }}>
            <ProjectsTable aria-label={`Projects (${theme})`} projects={PROJECTS.slice(0, 3)} />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
