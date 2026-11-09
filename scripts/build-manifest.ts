/**
 * Builds public/themis-manifest.json — the machine-readable contract for Figma and AI tooling.
 *
 * For every src/components/<Name>/ it combines:
 *   - <Name>.docs.ts      (usage, anatomy, a11y, guidelines, Figma property mapping)
 *   - <Name>.tsx          (props, types, defaults, JSDoc — via react-docgen-typescript)
 *   - src/tokens/tokens.json (resolved values for every token the component references)
 *
 * It also validates the contract, failing the build when docs drift from code:
 *   - every component folder has a .docs.ts and a .stories.tsx
 *   - every token id in `tokens` exists
 *   - every key in `figma.properties` is a real prop
 *
 * Storybook serves the result at /themis-manifest.json; the npm package ships it as
 * `themis-ds/manifest.json`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { withCustomConfig } from 'react-docgen-typescript';

import type { ComponentDocs } from '../src/docs/component-docs';

const ROOT = path.resolve(import.meta.dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'src/components');
const OUT = path.join(ROOT, 'public/themis-manifest.json');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as { version: string };
const tokenData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/tokens/tokens.json'), 'utf8')) as {
  collections: Record<string, { modes: string[]; defaultMode: string }>;
  tokens: { id: string; modes: Record<string, { value: string; aliasOf?: string[] }> }[];
};
const tokenById = new Map(tokenData.tokens.map((t) => [t.id, t]));

const parser = withCustomConfig(path.join(ROOT, 'tsconfig.json'), {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  savePropValueAsString: true,
  // Keep our own props and React Aria's documented ones; drop global DOM attributes/events.
  propFilter: (prop) => !['GlobalDOMAttributes', 'GlobalDOMEvents'].includes(prop.parent?.name ?? ''),
});

const errors: string[] = [];
const components = [];

for (const name of fs.readdirSync(COMPONENTS_DIR).sort()) {
  const dir = path.join(COMPONENTS_DIR, name);
  if (!fs.statSync(dir).isDirectory()) continue;
  const file = (suffix: string) => path.join(dir, `${name}${suffix}`);

  for (const suffix of ['.tsx', '.docs.ts', '.stories.tsx']) {
    if (!fs.existsSync(file(suffix))) errors.push(`${name}: missing ${name}${suffix}`);
  }
  if (!fs.existsSync(file('.docs.ts')) || !fs.existsSync(file('.tsx'))) continue;

  const docs = (await import(pathToFileURL(file('.docs.ts')).href)).default as ComponentDocs;
  const parsed = parser.parse(file('.tsx')).find((c) => c.displayName === name);
  if (!parsed) {
    errors.push(`${name}: could not find exported component "${name}" in ${name}.tsx`);
    continue;
  }

  const props = Object.fromEntries(
    Object.values(parsed.props)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => [
        p.name,
        {
          type: p.type.raw ?? p.type.name,
          values: p.type.name === 'enum' ? (p.type.value as { value: string }[]).map((v) => v.value.replace(/^"|"$/g, '')) : undefined,
          required: p.required,
          default: p.defaultValue?.value,
          description: p.description || undefined,
          source: p.parent?.fileName.includes('node_modules') ? 'react-aria-components' : 'themis',
        },
      ]),
  );

  for (const prop of Object.keys(docs.figma.properties)) {
    if (!(prop in props)) errors.push(`${name}: figma.properties.${prop} is not a prop of ${name}`);
  }
  const tokens = docs.tokens.map((id) => {
    const t = tokenById.get(id);
    if (!t) errors.push(`${name}: unknown token "${id}" (see src/tokens/tokens.json)`);
    return { id, modes: t?.modes ?? {} };
  });

  components.push({
    ...docs,
    import: { package: 'themis-ds', named: name },
    storybook: { id: `${docs.category}-${docs.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), docsPath: `/docs/${docs.category}-${docs.name}--docs`.toLowerCase() },
    props,
    tokens,
  });
}

if (errors.length) {
  console.error(`✗ manifest: ${errors.length} problem(s)\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      $schema: 'themis-manifest/v1',
      name: 'themis-ds',
      version: pkg.version,
      generatedAt: new Date().toISOString(),
      tokens: tokenData,
      components,
    },
    null,
    2,
  ),
);
console.log(`✓ manifest: ${components.length} component(s), ${tokenData.tokens.length} tokens → public/themis-manifest.json`);
