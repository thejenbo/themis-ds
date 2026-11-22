/** Adds a stylesheet link (and Google Fonts' preconnects) to the page head, once per URL. */
export function addStylesheet(href: string) {
  if (typeof document === 'undefined' || document.querySelector(`link[data-themis-fonts="${CSS.escape(href)}"]`)) return;
  for (const origin of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
    if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) continue;
    const pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = origin;
    if (origin.includes('gstatic')) pre.crossOrigin = '';
    document.head.appendChild(pre);
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.themisFonts = href;
  document.head.appendChild(link);
}
