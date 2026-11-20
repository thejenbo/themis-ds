/**
 * The simulator's pretend account: what the forms edit, kept in this browser so it's still there on the next visit.
 * Like the rest of the tool's storage, reads and writes may fail (private windows, full storage); `saveSimData` says
 * whether it worked so the page can show an error toast.
 */

export type PlanId = 'basic' | 'growth' | 'premium';
export type Billing = 'monthly' | 'yearly';

export interface Card {
  brand: string;
  last4: string;
  /** MM/YY */
  expiry: string;
  name: string;
  zip: string;
}

export interface SimData {
  displayName: string;
  role: string | null;
  bio: string;
  onlineIndicator: boolean;
  /** A small JPEG data URL, or null for the initials. */
  avatar: string | null;
  email: string;
  twoFactor: boolean;
  publicProfile: boolean;
  discoverable: boolean;
  plan: PlanId;
  billing: Billing;
  card: Card;
  autoPay: boolean;
}

export const DEFAULT_SIM_DATA: SimData = {
  displayName: '',
  role: null,
  bio: '',
  onlineIndicator: true,
  avatar: null,
  email: 'someone@themis.design',
  twoFactor: true,
  publicProfile: true,
  discoverable: true,
  plan: 'premium',
  billing: 'monthly',
  card: { brand: 'Visa', last4: '4242', expiry: '12/28', name: '', zip: '' },
  autoPay: true,
};

const KEY = 'themis-config:sim';

export function loadSimData(): SimData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SIM_DATA;
    const data = JSON.parse(raw) as Partial<SimData>;
    return { ...DEFAULT_SIM_DATA, ...data, card: { ...DEFAULT_SIM_DATA.card, ...data.card } };
  } catch {
    return DEFAULT_SIM_DATA;
  }
}

/** Saves the data; false if the browser wouldn't store it. */
export function saveSimData(data: SimData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export interface Plan {
  id: PlanId;
  name: string;
  /** Dollars per month, billed monthly. Yearly billing takes 20% off. */
  monthly: number;
  blurb: string;
}

export const PLANS: readonly Plan[] = [
  { id: 'basic', name: 'Basic', monthly: 0, blurb: 'Best for personal use' },
  { id: 'growth', name: 'Growth', monthly: 10, blurb: 'Best for small teams' },
  { id: 'premium', name: 'Premium', monthly: 17, blurb: 'Best for large teams' },
];

export const planOf = (id: PlanId) => PLANS.find((p) => p.id === id)!;

/** The price per month, as shown: "$17", or "$13.60" with yearly's 20% off. */
export function monthlyPrice(plan: Plan, billing: Billing): string {
  const price = billing === 'yearly' ? plan.monthly * 0.8 : plan.monthly;
  return `$${Number.isInteger(price) ? price : price.toFixed(2)}`;
}

// Billing happens on the 4th of the month, as in Figma.
const BILLING_DAY = 4;

/** The next billing date after `today`. */
export function nextRenewal(today = new Date()): Date {
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), BILLING_DAY);
  return today.getDate() < BILLING_DAY ? thisMonth : new Date(today.getFullYear(), today.getMonth() + 1, BILLING_DAY);
}

/** Whole days from `today` to `date`. */
export function daysUntil(date: Date, today = new Date()): number {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((date.getTime() - start.getTime()) / 86_400_000);
}

/** The last five billing dates, newest first. */
export function pastStatements(today = new Date()): Date[] {
  const next = nextRenewal(today);
  return [1, 2, 3, 4, 5].map((n) => new Date(next.getFullYear(), next.getMonth() - n, BILLING_DAY));
}

export const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Validation: loose, common-sense checks. Each returns an error message, or null when the value is fine.

export function checkDisplayName(value: string): string | null {
  const name = value.trim();
  if (!name) return 'Enter a display name.';
  if (name.length > 50) return 'Keep it to 50 characters or fewer.';
  return null;
}

export function checkEmail(value: string): string | null {
  if (!value.trim()) return 'Enter an email address.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Enter an email address like name@example.com.';
}

export function checkCardName(value: string): string | null {
  return value.trim().length >= 2 ? null : 'Enter the name on the card.';
}

const digits = (value: string) => value.replace(/[\s-]/g, '');

export function checkCardNumber(value: string): string | null {
  const number = digits(value);
  if (!number) return 'Enter the card number.';
  return /^\d{13,19}$/.test(number) ? null : 'Card numbers are 13 to 19 digits.';
}

export function checkExpiry(value: string, today = new Date()): string | null {
  const match = /^\s*(\d{1,2})\s*\/\s*(\d{2})\s*$/.exec(value);
  if (!match) return 'Use MM/YY, like 08/29.';
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return 'Months go from 01 to 12.';
  if (year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1)) return 'This card has expired.';
  return null;
}

export function checkSecurityCode(value: string): string | null {
  return /^\d{3,4}$/.test(value.trim()) ? null : 'Enter the 3 or 4 digits.';
}

export function checkZip(value: string): string | null {
  return /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(value.trim()) ? null : 'Enter a zip or postal code.';
}

/** The card's brand, from its first digits. */
export function cardBrand(value: string): string {
  const number = digits(value);
  if (/^4/.test(number)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'Amex';
  if (/^6/.test(number)) return 'Discover';
  return 'Card';
}

/** "4/29" → "04/29". */
export function normaliseExpiry(value: string): string {
  const [month = '', year = ''] = value.split('/').map((part) => part.trim());
  return `${month.padStart(2, '0')}/${year}`;
}

export const cardLast4 = (value: string) => digits(value).slice(-4);
