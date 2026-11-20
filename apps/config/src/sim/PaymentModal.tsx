import * as stylex from '@stylexjs/stylex';
import { type FormEvent, useId, useState } from 'react';
import { Form } from 'react-aria-components';
import { Button, Icon, Modal, TextInput } from 'themis-ds';

import { spacing } from '../../../../src/tokens/spacing.stylex';
import {
  type Card,
  cardBrand,
  cardLast4,
  checkCardName,
  checkCardNumber,
  checkExpiry,
  checkSecurityCode,
  checkZip,
  normaliseExpiry,
} from './simData';
import { showInvalidToast, type UpdateSimData } from './useSimData';

const EMPTY = { name: '', number: '', expiry: '', code: '', zip: '' };
type Fields = typeof EMPTY;

const CHECKS: Record<keyof Fields, (value: string) => string | null> = {
  name: checkCardName,
  number: checkCardNumber,
  expiry: checkExpiry,
  code: checkSecurityCode,
  zip: checkZip,
};

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card;
  update: UpdateSimData;
}

/**
 * "Update Payment Method" (Figma 2424:37705). Figma has no expiry field; it's added here, since the page shows the
 * card's expiry. The full number and security code are never stored: only the brand and last four digits.
 */
export function PaymentModal({ isOpen, onOpenChange, card, update }: PaymentModalProps) {
  const formId = useId();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const errors = Object.fromEntries(
    Object.entries(CHECKS).map(([key, check]) => [key, submitted ? check(fields[key as keyof Fields]) : null]),
  ) as Record<keyof Fields, string | null>;

  const open = (next: boolean) => {
    if (next) {
      setFields({ ...EMPTY, name: card.name, zip: card.zip });
      setSubmitted(false);
    }
    onOpenChange(next);
  };
  const field = (key: keyof Fields) => ({
    value: fields[key],
    onChange: (value: string) => setFields((f) => ({ ...f, [key]: value })),
    isInvalid: errors[key] != null,
    errorMessage: errors[key],
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.entries(CHECKS).some(([key, check]) => check(fields[key as keyof Fields]))) return showInvalidToast();
    const next: Card = {
      brand: cardBrand(fields.number),
      last4: cardLast4(fields.number),
      expiry: normaliseExpiry(fields.expiry),
      name: fields.name.trim(),
      zip: fields.zip.trim(),
    };
    const saved = update({ card: next }, { title: 'Payment method updated', description: `We’ll charge your ${next.brand} ending in ${next.last4}.` });
    if (saved) onOpenChange(false);
  };

  return (
    <Modal
      title="Update Payment Method"
      size="small"
      isOpen={isOpen}
      onOpenChange={open}
      showCloseButton
      actions={
        <Button type="submit" form={formId} iconLeft={<Icon name="check" />}>
          Update
        </Button>
      }
    >
      <Form id={formId} onSubmit={onSubmit} validationBehavior="aria" {...stylex.props(styles.form)}>
        <TextInput label="Name on Card" autoComplete="cc-name" autoFocus {...field('name')} />
        <TextInput label="Card Number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" {...field('number')} />
        <div {...stylex.props(styles.row)}>
          <TextInput label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" {...field('expiry')} />
          <TextInput label="Security Code" inputMode="numeric" autoComplete="cc-csc" placeholder="123" {...field('code')} />
          <TextInput label="Zip Code" autoComplete="postal-code" {...field('zip')} />
        </div>
      </Form>
    </Modal>
  );
}

const styles = stylex.create({
  // Figma: 16px between fields.
  form: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  // Figma pairs Security Code and Zip Code; Expiry joins them, so the three take two rows of two.
  row: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: spacing.sm, alignItems: 'start' },
});
