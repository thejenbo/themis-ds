import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import {
  Accordion,
  ActionMenu,
  ActionMenuItem,
  ActionMenuTrigger,
  Button,
  Cell,
  Chip,
  Heading,
  Icon,
  IconButton,
  Row,
  SegmentedControl,
  SegmentedControlItem,
  Switch,
  Table,
  TableBody,
  Text,
  ToggleButton,
} from 'themis-ds';

import { color } from '../../../../src/tokens/colorTheme.stylex';
import { font as fontTheme } from '../../../../src/tokens/fontTheme.stylex';
import { border as radius } from '../../../../src/tokens/radius.stylex';
import { spacing } from '../../../../src/tokens/spacing.stylex';
import { font } from '../../../../src/tokens/typography.stylex';
import { PaymentModal } from './PaymentModal';
import {
  type Billing,
  formatDate,
  monthlyPrice,
  nextRenewal,
  pastStatements,
  type PlanId,
  planOf,
  PLANS,
  type SimData,
} from './simData';
import { simToast, type UpdateSimData } from './useSimData';

interface ViewProps {
  data: SimData;
  update: UpdateSimData;
}

/** The "subscription" view (Figma 2422:36732): plan, payment method and statements. */
export function SubscriptionView({ data, update }: ViewProps) {
  return (
    <>
      <PlanSection data={data} update={update} />
      <PaymentSection data={data} update={update} />
      <StatementsSection email={data.email} />
    </>
  );
}

/** What the plan's caption says about the next renewal. */
export function renewalText(data: SimData): string {
  if (data.plan === 'basic') return 'Free, with nothing to renew';
  const date = formatDate(nextRenewal());
  return data.autoPay ? `Renews automatically on ${date}` : `Payment due on ${date}`;
}

function PlanSection({ data, update }: ViewProps) {
  const [plan, setPlan] = useState<PlanId>(data.plan);
  const [billing, setBilling] = useState<Billing>(data.billing);
  const current = planOf(data.plan);

  const save = () => {
    if (plan === data.plan && billing === data.billing) {
      simToast.show({ tone: 'info', description: 'No changes to save.' });
      return;
    }
    const chosen = planOf(plan);
    update(
      { plan, billing },
      {
        title: 'Plan updated',
        description: plan === 'basic' ? 'You’re on Basic, the free plan.' : `You’re on ${chosen.name}, billed ${billing}.`,
      },
    );
  };

  return (
    <Accordion title="Plan" defaultExpanded headingLevel={2}>
      <div {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.planSummary)}>
          <div {...stylex.props(styles.inline)}>
            <Heading level={3} size="base">
              {current.name}
            </Heading>
            <Chip tone="success" variant="solid">
              active
            </Chip>
          </div>
          <Text variant="caption">{renewalText(data)}</Text>
        </div>
        <SegmentedControl aria-label="Billing" selectedKey={billing} onSelectionChange={(key) => setBilling(key as Billing)}>
          <SegmentedControlItem id="monthly">Monthly</SegmentedControlItem>
          <SegmentedControlItem id="yearly">
            Yearly <span {...stylex.props(styles.saving)}>(save 20%)</span>
          </SegmentedControlItem>
        </SegmentedControl>
        <div role="group" aria-label="Plans" {...stylex.props(styles.plans)}>
          {PLANS.map((p) => (
            <div key={p.id} {...stylex.props(styles.planWrap)}>
              <ToggleButton
                isSelected={plan === p.id}
                // One plan is always chosen: the chosen card can't be turned off, so it shows no hover or press.
                isDeselectable={false}
                onChange={() => setPlan(p.id)}
                size="medium"
                xstyle={styles.planButton}
              >
                <span {...stylex.props(styles.planCard, plan !== p.id && styles.planCardIdle)}>
                  <span {...stylex.props(styles.planName)}>{p.name}</span>
                  <span {...stylex.props(styles.price)}>
                    <span {...stylex.props(styles.priceAmount)}>{monthlyPrice(p, billing)}</span>
                    <span {...stylex.props(styles.caption)}>{billing === 'yearly' && p.monthly > 0 ? 'per month, billed yearly' : 'per month'}</span>
                  </span>
                  <span {...stylex.props(styles.blurb)}>{p.blurb}</span>
                </span>
              </ToggleButton>
              {p.id === data.plan && (
                <Chip aria-hidden="true" xstyle={styles.yourPlan}>
                  your plan
                </Chip>
              )}
            </div>
          ))}
        </div>
        <div {...stylex.props(styles.actions)}>
          <Button iconLeft={<Icon name="check" />} onPress={save}>
            Save Changes
          </Button>
        </div>
      </div>
    </Accordion>
  );
}

function PaymentSection({ data, update }: ViewProps) {
  const [editing, setEditing] = useState(false);
  const { card } = data;
  return (
    <Accordion title="Payment Method" defaultExpanded headingLevel={2}>
      <div {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.inline, styles.cardRow)}>
          <div {...stylex.props(styles.inline, styles.cardDetails)}>
            <span {...stylex.props(styles.brand)}>{card.brand}</span>
            <div>
              <Text variant="body-large-bold">
                <span aria-label={`${card.brand} ending in ${card.last4}`}>{card.last4}</span>
              </Text>
              <Text variant="body-base">Expires {card.expiry}</Text>
            </div>
          </div>
          <Button variant="outline" iconLeft={<Icon name="credit-card" />} onPress={() => setEditing(true)} xstyle={styles.pushEnd}>
            Update
          </Button>
        </div>
        <Switch
          labelPosition="left"
          description="Charge my payment method automatically when my subscription renews"
          isSelected={data.autoPay}
          onChange={(on) =>
            update(
              { autoPay: on },
              { title: 'Payment settings saved', description: on ? 'Your card will be charged when your plan renews.' : 'Automatic payments are off.' },
            )
          }
          xstyle={styles.setting}
        >
          Automatic Payments
        </Switch>
      </div>
      <PaymentModal isOpen={editing} onOpenChange={setEditing} card={card} update={update} />
    </Accordion>
  );
}

const STATEMENT_AMOUNT = '$17';

function StatementsSection({ email }: { email: string }) {
  return (
    <Accordion title="Statements" defaultExpanded headingLevel={2}>
      <Table aria-label="Statements" hideBorder>
        <TableBody>
          {pastStatements().map((date) => {
            const when = formatDate(date);
            return (
              <Row key={date.toISOString()} id={date.toISOString()}>
                <Cell isRowHeader>{when}</Cell>
                <Cell>{STATEMENT_AMOUNT}</Cell>
                <Cell>
                  <div {...stylex.props(styles.rowEnd)}>
                    <ActionMenuTrigger>
                      <IconButton aria-label={`Actions for the ${when} statement`} variant="subtle" size="micro">
                        <Icon name="ellipsis-vertical" />
                      </IconButton>
                      <ActionMenu
                        placement="bottom end"
                        onAction={(key) => {
                          if (key === 'download') {
                            downloadStatement(when);
                            simToast.show({ tone: 'success', description: `Downloaded the ${when} statement.` });
                          } else {
                            simToast.show({ tone: 'success', description: `Sent the ${when} statement to ${email}.` });
                          }
                        }}
                      >
                        <ActionMenuItem id="download" icon={<Icon name="download" size="small" />}>
                          Download
                        </ActionMenuItem>
                        <ActionMenuItem id="email" icon={<Icon name="mail" size="small" />}>
                          Email me a copy
                        </ActionMenuItem>
                      </ActionMenu>
                    </ActionMenuTrigger>
                  </div>
                </Cell>
              </Row>
            );
          })}
        </TableBody>
      </Table>
    </Accordion>
  );
}

/** A plain-text receipt, so Download does something real. */
function downloadStatement(when: string) {
  const text = `Settings Sim statement\n\nDate: ${when}\nPlan: Premium (monthly)\nAmount: ${STATEMENT_AMOUNT}\n\nThis is a demo statement from the Themis config tool.\n`;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `statement-${when.replace(/[ ,]+/g, '-')}.txt` });
  link.click();
  URL.revokeObjectURL(url);
}

const styles = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: spacing.md, alignItems: 'flex-start' },
  inline: { display: 'flex', alignItems: 'center', gap: spacing.xs },
  planSummary: { display: 'flex', flexDirection: 'column', gap: spacing.xs },
  // The "(save 20%)" note: Figma type/button/micro.
  saving: { marginInlineStart: spacing['2xs'], fontSize: font.size2xs, lineHeight: font.lineHeightXs },
  // Figma: three 224px cards 24px apart.
  plans: {
    display: 'grid',
    // Three across, or one per row (full width) when three don't fit: never two and one.
    gridTemplateColumns: { default: 'repeat(3, minmax(0, 1fr))', '@container (max-width: 48rem)': 'minmax(0, 1fr)' },
    gap: spacing.md,
    alignSelf: 'stretch',
    // Room for the "your plan" chip, which sits over the card's top edge.
    paddingBlockStart: spacing.xs,
  },
  planWrap: { position: 'relative', display: 'flex' },
  // A query container, so the card's content can fill the button's width (the button centers its content).
  planButton: { flexGrow: 1, containerType: 'inline-size', borderRadius: radius.radiusMd },
  planCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    // Stacked one per row (full width), the cards are wide and short: less space between their lines.
    gap: { default: spacing.md, '@container sim-page (max-width: 48rem)': spacing.xs },
    width: `calc(100cqw - 2 * ${spacing.sm})`,
    paddingBlock: spacing.xs,
    textAlign: 'start',
    whiteSpace: 'normal',
    fontWeight: font.weightRegular,
  },
  // Figma: cards that aren't chosen have the text color (the outline toggle's label is brand-colored).
  planCardIdle: { color: color.text },
  // Figma type/heading/md.
  planName: { fontFamily: fontTheme.familyHeading, fontSize: font.size2xl, lineHeight: font.lineHeightLg, fontWeight: font.weightBold },
  // 4px under the plan name (pulling back the card's gap).
  price: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: spacing['2xs'],
    marginBlockStart: {
      default: `calc(-1 * ${spacing.md} + ${spacing['2xs']})`,
      '@container sim-page (max-width: 48rem)': `calc(-1 * ${spacing.xs} + ${spacing['2xs']})`,
    },
  },
  // Figma type/body/large.
  priceAmount: { fontSize: font.sizeLg, lineHeight: font.lineHeightMd },
  caption: { fontSize: font.sizeCaption, lineHeight: font.lineHeightCaption },
  // Figma type/body/base.
  blurb: { fontSize: font.sizeSm, lineHeight: font.lineHeightSm },
  // Figma: a neutral chip over the current plan's top edge, 8px in from its end.
  yourPlan: { position: 'absolute', insetBlockStart: `calc(-1 * ${spacing.xs})`, insetInlineEnd: spacing.xs, pointerEvents: 'none' },
  actions: { display: 'flex', justifyContent: 'flex-end', alignSelf: 'stretch' },
  // On phones, Update sits at the end of the row, lined up with the switch.
  // Full width (the section lines things up at the start), so Update can sit at the end on phones.
  cardRow: { alignSelf: 'stretch', gap: spacing.md, flexWrap: 'wrap', justifyContent: { default: null, '@container (max-width: 40rem)': 'space-between' } },
  // The card details take the room Update leaves (the text wraps there), so Update stays beside them.
  cardDetails: { gap: spacing.sm, flex: '1 1 10rem', minWidth: 0 },
  // …and stays there when it wraps onto a line of its own.
  pushEnd: { marginInlineStart: { default: null, '@container (max-width: 40rem)': 'auto' } },
  // Figma: the card brand in a brand-colored block, type/heading/md in the inverse text color.
  brand: {
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
    borderRadius: radius.radiusSm,
    backgroundColor: color.brand,
    color: color.textInverse,
    fontFamily: fontTheme.familyHeading,
    fontSize: font.size2xl,
    lineHeight: font.lineHeightLg,
    fontWeight: font.weightBold,
  },
  setting: { justifyContent: 'space-between', width: '100%' },
  rowEnd: { display: 'flex', justifyContent: 'flex-end' },
});
