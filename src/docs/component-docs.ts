/**
 * The Themis component documentation contract.
 *
 * Every component ships a `<Name>.docs.ts` that default-exports `defineComponentDocs({...})`.
 * That one object is the single source of truth, consumed by:
 *   - Storybook  → rendered on the component's Docs page (see .storybook/blocks/ThemisDocsPage.tsx)
 *   - AI agents  → via Storybook's MCP endpoint and /themis-manifest.json
 *   - Figma      → /themis-manifest.json (scripts/build-manifest.ts) feeds the Figma sync
 *
 * Write it for a reader who has never seen the component: plain sentences, no jargon,
 * concrete alternatives. Every field is plain JSON-serialisable data — no JSX, no functions.
 */

export type ComponentStatus = 'draft' | 'beta' | 'stable' | 'deprecated';

export type FigmaPropertyType = 'VARIANT' | 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP';

export interface FigmaPropertyMapping {
  /** Exact property name in the Figma component set, e.g. "Variant" or "Is disabled". */
  figmaProperty: string;
  type: FigmaPropertyType;
  /**
   * For VARIANT properties: code value → Figma option name, e.g. { primary: 'Primary' }.
   * Omit when names match 1:1.
   */
  values?: Record<string, string>;
}

/**
 * One way the coded component differs from its Figma component, so the two can be kept in line.
 *
 * - `update-figma`: Figma can show it; change the Figma component to match code, then delete the entry.
 * - `annotate-figma`: Figma can't show it (behavior, motion, keyboard, responsive). Add a note to the Figma
 *   component and keep the entry, with `done` set, since it still documents the behavior.
 */
export interface FigmaDifference {
  /** The part or behavior it's about, e.g. "Box size" or "Row hover". */
  topic: string;
  /** What the Figma component shows today. */
  figma: string;
  /** What the code does, and why. */
  code: string;
  action: 'update-figma' | 'annotate-figma';
  /** The date (YYYY-MM-DD) the Figma annotation was added. Only for `annotate-figma`. */
  done?: string;
}

export interface ComponentDocs {
  /** Display name; must match the React export and the Figma component set name. */
  name: string;
  status: ComponentStatus;
  /** Storybook sidebar group / Figma page, e.g. "Actions", "Forms", "Overlays". */
  category: string;
  /** One sentence: what it is and what it's for. Shown first everywhere. */
  summary: string;
  /** The React Aria Components primitive this is built on (null only if none fits — explain in `notes`). */
  base: { package: 'react-aria-components'; component: string; docsUrl: string } | null;

  usage: {
    whenToUse: string[];
    /** Each entry names the component to use instead, so readers (and agents) can redirect. */
    whenNotToUse: { scenario: string; useInstead?: string }[];
  };

  /** Named visual parts, outermost first. Names match Figma layer names. */
  anatomy: { part: string; description: string; required: boolean }[];

  /** Meaning of each value of each visual prop — *why* you'd pick it, not what it looks like. */
  variants: Record<string, Record<string, string>>;

  accessibility: {
    /** What React Aria provides for free (so nobody re-implements it). */
    providedByBase: string[];
    keyboard: { keys: string; action: string }[];
    /** Obligations on the *consumer*, e.g. "Icon-only buttons need aria-label". */
    requirements: string[];
  };

  guidelines: { do: string[]; dont: string[] };

  content?: { guidance: string[] };

  /** Token ids (from src/tokens/tokens.json) this component consumes. */
  tokens: string[];

  /**
   * What the component animates and when. Durations and easings name token ids from `tokens`,
   * so designers can match prototypes (Figma can't bind transitions to variables).
   */
  motion?: {
    trigger: string;
    property: string;
    duration: string;
    easing: string;
    reducedMotion: string;
  }[];

  figma: {
    /** Component set key, filled in once the Figma library is published. */
    componentKey: string | null;
    /** Link to the component set node in the Figma file. */
    url: string | null;
    /** React prop name → Figma component property. */
    properties: Record<string, FigmaPropertyMapping>;
    /** Where code and Figma differ, and what to do about it in Figma. Empty when they match. */
    differences?: FigmaDifference[];
  };

  related?: string[];
  notes?: string[];
}

/** Identity helper that gives authors type-checking and autocomplete. */
export function defineComponentDocs<const T extends ComponentDocs>(docs: T): T {
  return docs;
}
