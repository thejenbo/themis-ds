import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

/** The name Storybook goes by here: in the sidebar, the browser tab and link previews (see main.ts managerHead). */
export const SITE_NAME = 'Themis Docs';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: SITE_NAME,
    brandUrl: './',
    brandTarget: '_self',
  }),
});

/*
 * Storybook writes the tab title as "<page> ⋅ Storybook" (or just "Storybook") whenever the page changes, and that
 * suffix can't be configured. Swap it for the site name each time the title changes.
 */
const rename = () => {
  const renamed = document.title.replace(/(^|\s)Storybook$/, `$1${SITE_NAME}`);
  if (renamed !== document.title) document.title = renamed;
};
rename();
new MutationObserver(rename).observe(document.querySelector('title') ?? document.head, { childList: true, subtree: true, characterData: true });
