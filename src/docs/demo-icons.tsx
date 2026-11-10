/**
 * Stand-in icons for stories until the icon library exists. Components accept any ReactNode as an icon.
 * Not exported from the package.
 */
export function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
      <path d="M12 20s-7-4.4-9.3-9A5.1 5.1 0 0 1 12 5.6 5.1 5.1 0 0 1 21.3 11C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5 9.5 18 20 6" />
    </svg>
  );
}
