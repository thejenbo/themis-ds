import { type ComponentType, createElement, type ReactElement } from 'react';

import playground from './playground.json';

/**
 * Every Themis component for the components page, from Storybook "for free": each one's Playground story (rendered
 * here, outside Storybook, so it takes the theme being edited), and controls for its design props from
 * playground.json (generated from the manifest by `npm run manifest`).
 */

export type Control =
  | { kind: 'enum'; prop: string; label: string; options: { value: unknown; label: string }[]; initial: unknown }
  | { kind: 'boolean'; prop: string; label: string; initial: boolean }
  | { kind: 'text'; prop: string; label: string; initial: string };

export interface ComponentEntry {
  name: string;
  category: string;
  summary: string;
  // The story takes any of the component's props as overrides.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Story: ComponentType<any>;
  controls: Control[];
  /** The story opens an overlay (Modal): the page shows a button to open it instead. */
  isOverlay: boolean;
}

interface PlaygroundData {
  category: string;
  summary: string;
  enums: Record<string, { values: (string | number)[]; default: unknown }>;
  booleans: string[];
}

/** The parts of a CSF stories file the page uses. */
type Args = Record<string, unknown>;
type Render = (args: Args, context: StoryContext) => ReactElement;
type Decorator = (Story: () => ReactElement, context: StoryContext) => ReactElement;
interface StoryContext {
  args: Args;
  argTypes: Args;
  parameters: Args;
  globals: Args;
}
interface CsfStory {
  args?: Args;
  render?: Render;
  decorators?: Decorator[];
  tags?: string[];
}
interface CsfMeta extends CsfStory {
  component?: ComponentType<Args>;
  argTypes?: Args;
  parameters?: Args;
}

/**
 * A story as a component that takes args as props, like Storybook's portable stories, but without Storybook's runtime
 * (it brings its whole test library with it): the meta's and story's args, the story's render (or the meta's, or the
 * component), wrapped in their decorators.
 */
function compose(meta: CsfMeta, story: CsfStory) {
  const baseArgs = { ...meta.args, ...story.args };
  const render: Render = story.render ?? meta.render ?? ((args) => createElement(meta.component!, args));
  const decorators = [...(story.decorators ?? []), ...(meta.decorators ?? [])];
  function Story(overrides: Args) {
    const args = { ...baseArgs, ...overrides };
    const context: StoryContext = { args, argTypes: meta.argTypes ?? {}, parameters: meta.parameters ?? {}, globals: {} };
    let element = () => render(args, context);
    for (const decorate of decorators) {
      const inner = element;
      element = () => decorate(inner, context);
    }
    return element();
  }
  return Object.assign(Story, { args: baseArgs, tags: story.tags ?? [] });
}

const storyModules = import.meta.glob<Record<string, unknown>>('../../../../src/components/*/*.stories.tsx', { eager: true });
const data = playground as Record<string, PlaygroundData>;

/** "isDisabled" → "Disabled", "labelPosition" → "Label position", "showValue" → "Show value". */
export const humanize = (prop: string) => {
  const words = prop.replace(/^is(?=[A-Z])/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

// Text props worth a text field when the story sets them (not ids, links or ARIA).
const TEXT_SKIP = /^(aria-|id$|href$|src$|name$|defaultValue$|value$)/;

function controlsFor(entry: PlaygroundData, args: Record<string, unknown>): Control[] {
  const controls: Control[] = [];
  for (const [prop, { values, default: fallback }] of Object.entries(entry.enums)) {
    // `default…` props only apply when the component first appears.
    if (/^default[A-Z]/.test(prop)) continue;
    const numeric = values.every((v) => /^\d+$/.test(String(v)));
    const typed = values.map((v) => (numeric ? Number(v) : v));
    const start = args[prop] ?? (fallback == null ? undefined : numeric ? Number(fallback) : fallback);
    // No default: "none" leaves the prop unset (e.g. an Avatar's status).
    const options = [
      ...(start === undefined ? [{ value: undefined, label: 'none' }] : []),
      ...typed.map((value) => ({ value, label: String(value) })),
    ];
    controls.push({ kind: 'enum', prop, label: humanize(prop), options, initial: start });
  }
  for (const prop of entry.booleans) {
    controls.push({ kind: 'boolean', prop, label: humanize(prop), initial: Boolean(args[prop]) });
  }
  for (const [prop, value] of Object.entries(args)) {
    if (typeof value !== 'string' || TEXT_SKIP.test(prop) || prop in entry.enums || value.length > 120) continue;
    controls.push({ kind: 'text', prop, label: prop === 'children' ? 'Content' : humanize(prop), initial: value });
  }
  return controls;
}

export const COMPONENTS: ComponentEntry[] = Object.entries(storyModules)
  .map(([file, module]): ComponentEntry | null => {
    const name = /\/([^/]+)\.stories\.tsx$/.exec(file)![1]!;
    const entry = data[name];
    if (!entry) return null;
    const { default: meta, ...exports } = module as { default: CsfMeta } & Record<string, CsfStory>;
    // The Playground story, or else the first that isn't only a test.
    const chosen = exports.Playground ?? Object.values(exports).find((s) => s && typeof s === 'object' && !s.tags?.includes('test-only'));
    if (!meta || !chosen) return null;
    const Story = compose(meta, chosen);
    const args = Story.args;
    return {
      name,
      category: entry.category,
      summary: entry.summary,
      Story,
      controls: controlsFor(entry, args),
      isOverlay: args.isOpen === true,
    };
  })
  .filter((c): c is ComponentEntry => c !== null)
  .sort((a, b) => a.name.localeCompare(b.name));
