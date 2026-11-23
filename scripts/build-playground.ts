/**
 * Builds the config tool's component playground data (apps/config/src/components-page/playground.json) from the
 * manifest: for each component, its category and summary, the props with a set of values (size, tone… with their
 * defaults) and the on/off props worth a switch (isDisabled, showValue…). The playground turns these into controls.
 *
 * Runs after build-manifest (`npm run manifest`), so it stays in step with the components.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST = path.join(ROOT, 'public/themis-manifest.json');
const OUT = path.join(ROOT, 'apps/config/src/components-page/playground.json');

interface ManifestProp {
  type: string;
  source?: string;
  values?: (string | number)[];
  default?: unknown;
}
interface ManifestComponent {
  name: string;
  category: string;
  summary: string;
  props: Record<string, ManifestProp>;
}

// State props that a switch shows off well. Left out: ones the person drives by using the component (isSelected,
// isOpen, isExpanded, isAdvancedOpen), ones that only make sense in code (isDecorative, isRowHeader), and behavior
// that changes nothing you can see (isReadOnly, isRequired, allowsEmptyCollection, isWheelDisabled…).
const SKIP = new Set([
  'as',
  'role',
  'isOpen',
  'isExpanded',
  'isSelected',
  'isAdvancedOpen',
  'isDecorative',
  'isRowHeader',
  'isReadOnly',
  'isRequired',
  'isPending',
  'isEntering',
  'isExiting',
  'allowsEmptyCollection',
  'isWheelDisabled',
  'isKeyboardDismissDisabled',
  'isDismissable',
]);
/** A documented default, when it's one of the values (some are explained in words instead, e.g. "'p' for body"). */
const literalDefault = (prop: ManifestProp) => {
  const raw = typeof prop.default === 'string' ? prop.default.replace(/^'(.*)'$/, '$1') : prop.default;
  return prop.values?.some((v) => String(v) === String(raw)) ? raw : null;
};
const isSwitch = (name: string, prop: ManifestProp) =>
  prop.type === 'boolean' && /^(is|show|hide|allows)[A-Z]/.test(name) && !SKIP.has(name);

const { components } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) as { components: ManifestComponent[] };
const out = Object.fromEntries(
  components.map((c) => [
    c.name,
    {
      category: c.category,
      summary: c.summary,
      enums: Object.fromEntries(
        Object.entries(c.props)
          // Themis's own design props: not the HTML and ARIA attributes every element has, nor `as` or `role`.
          .filter(([name, prop]) => prop.source === 'themis' && prop.values && prop.values.length > 0 && !SKIP.has(name))
          .map(([name, prop]) => [name, { values: prop.values!, default: literalDefault(prop) }]),
      ),
      booleans: Object.entries(c.props)
        .filter(([name, prop]) => isSwitch(name, prop))
        .map(([name]) => name)
        .sort(),
      // Invalid shows an example error message on components that take one (a checkbox shows nothing without it).
      hasErrorMessage: 'errorMessage' in c.props,
    },
  ]),
);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
console.log(`✓ playground: ${components.length} component(s) → ${path.relative(ROOT, OUT)}`);
