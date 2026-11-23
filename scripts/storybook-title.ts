/**
 * After `storybook build`: names the built Storybook "Themis Docs" in its static HTML. Storybook always writes the
 * title as "<name> - Storybook", and link previews (Slack, iMessage…) read this HTML without running scripts. While
 * browsing, .storybook/manager.ts keeps the tab title in step.
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve(import.meta.dirname, '../storybook-static/index.html');
const html = fs.readFileSync(file, 'utf8');
const titled = html.replace(/<title>[^<]*<\/title>/, '<title>Themis Docs</title>');
if (titled === html && !html.includes('<title>Themis Docs</title>')) throw new Error('storybook-title: no <title> found in storybook-static/index.html');
fs.writeFileSync(file, titled);
console.log('✓ storybook-static/index.html titled "Themis Docs"');
