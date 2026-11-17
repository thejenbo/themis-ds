import * as stylex from '@stylexjs/stylex';
import {
  Accordion,
  Avatar,
  Button,
  Chip,
  Heading,
  Icon,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectItem,
  Switch,
  Text,
  TextArea,
  TextInput,
} from 'themis-ds';

import { spacing } from '../../../src/tokens/spacing.stylex';

/**
 * "Settings Sim" (Figma 1936:11209): an account settings page built only from Themis components, so every token a
 * theme sets shows up somewhere.
 */
export function SettingsSim() {
  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.content)}>
        <Heading level={1} size="lg">Settings Sim</Heading>
        <div {...stylex.props(styles.toolbar)}>
          <SegmentedControl aria-label="Settings section" defaultSelectedKey="account">
            <SegmentedControlItem id="account">account</SegmentedControlItem>
            <SegmentedControlItem id="subscription">subscription</SegmentedControlItem>
          </SegmentedControl>
          <Chip tone="brand" variant="solid" iconRight={<Icon name="info" />}>
            premium active
          </Chip>
        </div>

        <Accordion title="Profile" defaultExpanded headingLevel={2}>
          <div {...stylex.props(styles.stack)}>
            <div {...stylex.props(styles.row)}>
              <Avatar name="Themis" initials="T" size="lg" status="online" />
              <Button variant="outline">Upload Image</Button>
            </div>
            <Switch labelPosition="left" description="Show other users when I'm online" defaultSelected xstyle={styles.setting}>
              Online Indicator
            </Switch>
            <div {...stylex.props(styles.twoColumns)}>
              <TextInput label="Display Name" placeholder="placeholder" />
              <Select label="Role" placeholder="placeholder">
                <SelectItem id="designer">Designer</SelectItem>
                <SelectItem id="engineer">Engineer</SelectItem>
                <SelectItem id="manager">Manager</SelectItem>
              </Select>
            </div>
            <TextArea label="Bio" placeholder="placeholder" characterLimit={500} />
            <div {...stylex.props(styles.actions)}>
              <Button>Save Changes</Button>
            </div>
          </div>
        </Accordion>

        <Accordion title="Login" defaultExpanded headingLevel={2}>
          <div {...stylex.props(styles.stack)}>
            <div {...stylex.props(styles.row)}>
              <div>
                <Text variant="body-large-bold">Email</Text>
                <Text variant="body-large">someone@themis.design</Text>
              </div>
              <Button variant="outline">Update</Button>
            </div>
            <Switch
              labelPosition="left"
              description="Sends a code to your email address to verify your identity on login"
              defaultSelected
              xstyle={styles.setting}
            >
              Two Factor Authentication
            </Switch>
          </div>
        </Accordion>

        <Accordion title="Privacy" defaultExpanded headingLevel={2}>
          <div {...stylex.props(styles.stack)}>
            <Switch labelPosition="left" description="Allow other users to view your profile" defaultSelected xstyle={styles.setting}>
              Public Profile
            </Switch>
            <Switch
              labelPosition="left"
              description="Allow other users to discover your profile via username or email search"
              defaultSelected
              xstyle={styles.setting}
            >
              Discoverable Profile
            </Switch>
          </div>
        </Accordion>

        <Accordion title="Danger Zone" defaultExpanded headingLevel={2}>
          <div {...stylex.props(styles.spread)}>
            <div>
              <Text variant="body-medium-bold">Delete Account</Text>
              <Text variant="caption">This action cannot be undone</Text>
            </div>
            <Button tone="danger">Delete Forever</Button>
          </div>
        </Accordion>
      </div>
    </div>
  );
}

const styles = stylex.create({
  page: { paddingBlock: `${spacing.md} ${spacing.xl}`, paddingInline: spacing['2xl'] },
  content: { display: 'flex', flexDirection: 'column', gap: spacing.md, maxWidth: '48rem' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  stack: { display: 'flex', flexDirection: 'column', gap: spacing.md },
  row: { display: 'flex', alignItems: 'center', gap: spacing.md },
  spread: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  setting: { justifyContent: 'space-between', width: '100%' },
  twoColumns: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: spacing.sm },
  actions: { display: 'flex', justifyContent: 'flex-end' },
});
