import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useEffect } from 'react';

import { addStylesheet } from '../../theme/add-stylesheet';
import { color as system } from '../../tokens/system.stylex';
import { font } from '../../tokens/typography.stylex';

/** The languages Code and CodeBlock color. Anything else is shown as plain text. */
export type CodeLanguage = 'json' | 'tsx' | 'text';

type TokenKind = 'comment' | 'string' | 'number' | 'keyword' | 'function' | 'property' | 'parameter' | 'text';

/*
 * A small highlighter, enough for the snippets a design system shows (theme files, component usage), rather than a
 * full parser: each rule is tried at the current position, longest-first by order, and anything unmatched is text.
 */
const JSON_RULES: [TokenKind, RegExp][] = [
  ['property', /"(?:\\.|[^"\\])*"(?=\s*:)/y],
  ['string', /"(?:\\.|[^"\\])*"/y],
  ['number', /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b/y],
];

const KEYWORDS =
  'const|let|var|function|return|if|else|for|of|in|while|import|from|export|default|new|typeof|await|async|class|extends|interface|type|as';
const TSX_RULES: [TokenKind, RegExp][] = [
  ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
  ['string', /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y],
  // JSX tag names, after < or </ (Monokai colors tags like keywords).
  ['keyword', /(?<=<\/?)[A-Za-z][\w.]*/y],
  // JSX attributes, before =.
  ['function', /[A-Za-z][\w-]*(?==[{"'])/y],
  ['number', /\b\d+(?:\.\d+)?\b|\b(?:true|false|null|undefined)\b/y],
  ['keyword', new RegExp(`\\b(?:${KEYWORDS})\\b`, 'y')],
  ['function', /[A-Za-z_$][\w$]*(?=\s*\()/y],
  ['property', /\b[A-Z][\w$]*\b/y],
];

function tokenize(code: string, language: CodeLanguage): [TokenKind, string][] {
  const rules = language === 'json' ? JSON_RULES : language === 'tsx' ? TSX_RULES : [];
  const tokens: [TokenKind, string][] = [];
  let text = '';
  let i = 0;
  outer: while (i < code.length) {
    for (const [kind, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0].length > 0) {
        if (text) tokens.push(['text', text]);
        text = '';
        tokens.push([kind, m[0]]);
        i += m[0].length;
        continue outer;
      }
    }
    // Skip a whole word at once, so a rule never matches from the middle of one.
    const word = /[\w$]+|[^]/y;
    word.lastIndex = i;
    const w = word.exec(code)![0];
    text += w;
    i += w.length;
  }
  if (text) tokens.push(['text', text]);
  return tokens;
}

/** The code, colored with the Monokai tokens (system/color.code.*). */
export function highlight(code: string, language: CodeLanguage): ReactNode {
  if (language === 'text') return code;
  return tokenize(code, language).map(([kind, value], i) =>
    kind === 'text' ? (
      value
    ) : (
      <span key={i} {...stylex.props(kindStyles[kind])}>
        {value}
      </span>
    ),
  );
}

const SPACE_MONO = 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap';

/** Code is always in Space Mono (font/family/code), whatever the theme, so it loads it from Google Fonts once. */
export function useCodeFont(load: boolean) {
  useEffect(() => {
    if (load) addStylesheet(SPACE_MONO);
  }, [load]);
}

export const codeStyles = stylex.create({
  // Monokai colors on black, in every theme. Space Mono, with the system monospace font while it loads.
  base: {
    fontFamily: `${font.familyCode}, ui-monospace, SFMono-Regular, Menlo, monospace`,
    fontWeight: font.weightRegular,
    backgroundColor: system.codeBackground,
    color: system.codeText,
    // Ligatures and contextual alternates would change what people copy and read.
    fontVariantLigatures: 'none',
  },
});

const kindStyles = stylex.create({
  comment: { color: system.codeComment, fontStyle: 'italic' },
  string: { color: system.codeString },
  number: { color: system.codeNumber },
  keyword: { color: system.codeKeyword },
  function: { color: system.codeFunction },
  property: { color: system.codeProperty },
  parameter: { color: system.codeParameter },
});
