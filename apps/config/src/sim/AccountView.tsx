import * as stylex from '@stylexjs/stylex';
import { type FormEvent, useId, useRef, useState } from 'react';
import { Form } from 'react-aria-components';
import { Accordion, Avatar, Button, Icon, Modal, Select, SelectItem, Switch, Text, TextArea, TextInput } from 'themis-ds';

import { font as fontTheme } from '../../../../src/tokens/fontTheme.stylex';
import { spacing } from '../../../../src/tokens/spacing.stylex';
import { font } from '../../../../src/tokens/typography.stylex';
import { checkDisplayName, checkEmail, type SimData } from './simData';
import { showInvalidToast, simToast, type UpdateSimData } from './useSimData';

const ROLES = [
  { id: 'designer', name: 'Designer' },
  { id: 'engineer', name: 'Engineer' },
  { id: 'manager', name: 'Manager' },
];

const BIO_LIMIT = 500;
/** The page container is phone-sized (the Settings Sim page is the query container). */
const PHONE = '@container (max-width: 40rem)';
// Photos are shrunk to this size before they're stored, so they fit in the browser's storage.
const AVATAR_SIZE = 160;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

interface ViewProps {
  data: SimData;
  update: UpdateSimData;
}

/** The "account" view (Figma 1936:11209): avatar, profile, login, privacy and the danger zone. */
export function AccountView({ data, update }: ViewProps) {
  return (
    <>
      <AvatarSection data={data} update={update} />
      <ProfileSection data={data} update={update} />
      <LoginSection data={data} update={update} />
      <Accordion title="Privacy" defaultExpanded headingLevel={2}>
        <div {...stylex.props(styles.stack)}>
          <Switch
            labelPosition="left"
            description="Allow other users to view your profile"
            isSelected={data.publicProfile}
            onChange={(on) => update({ publicProfile: on }, { description: on ? 'Your profile is public.' : 'Your profile is private.' })}
            xstyle={styles.setting}
          >
            Public Profile
          </Switch>
          <Switch
            labelPosition="left"
            description="Allow other users to discover your profile via username or email search"
            isSelected={data.discoverable}
            onChange={(on) =>
              update({ discoverable: on }, { description: on ? 'People can find you by username or email.' : 'People can’t find you in search.' })
            }
            xstyle={styles.setting}
          >
            Discoverable Profile
          </Switch>
        </div>
      </Accordion>
      <DangerZone />
    </>
  );
}

/** The photo (or initials) and the online dot. Changes here save straight away. */
function AvatarSection({ data, update }: ViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const hasImage = data.avatar != null;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      simToast.show({ tone: 'danger', title: 'Image not uploaded', description: 'Choose an image file, such as a JPEG or PNG.' });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      simToast.show({ tone: 'danger', title: 'Image not uploaded', description: 'Choose an image under 10 MB.' });
      return;
    }
    try {
      update({ avatar: await shrinkImage(file) }, { description: hasImage ? 'Avatar image updated.' : 'Avatar image uploaded.' });
    } catch {
      simToast.show({ tone: 'danger', title: 'Image not uploaded', description: 'That image couldn’t be read. Try another one.' });
    }
  };

  return (
    <Accordion title="Avatar" defaultExpanded headingLevel={2}>
      <div {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.row, styles.avatarRow, styles.endOnMobile)}>
          <Avatar
            name={data.displayName || 'Themis'}
            initials={data.displayName ? undefined : 'T'}
            src={data.avatar ?? undefined}
            size="lg"
            status={data.onlineIndicator ? 'online' : undefined}
          />
          <div {...stylex.props(styles.imageButtons, styles.pushEnd)}>
            <Button
              variant="outline"
              iconLeft={<Icon name="upload" />}
              aria-label={hasImage ? 'Update Image' : 'Upload Image'}
              onPress={() => fileRef.current?.click()}
            >
              <ImageLabel verb={hasImage ? 'Update' : 'Upload'} />
            </Button>
            {hasImage && (
              <Button
                variant="outline"
                tone="danger"
                iconLeft={<Icon name="trash" />}
                aria-label="Delete Image"
                onPress={() => setConfirmingDelete(true)}
              >
                <ImageLabel verb="Delete" />
              </Button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        <Switch
          labelPosition="left"
          description="Show other users when I'm online"
          isSelected={data.onlineIndicator}
          onChange={(on) =>
            update({ onlineIndicator: on }, { description: on ? 'Others can see when you’re online.' : 'Others can’t see when you’re online.' })
          }
          xstyle={styles.setting}
        >
          Online Indicator
        </Switch>
      </div>
      <Modal
        title="Delete image?"
        tone="danger"
        size="small"
        isOpen={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        actions={(close) => (
          <>
            <Button
              tone="danger"
              iconLeft={<Icon name="trash" />}
              onPress={() => {
                close();
                update({ avatar: null }, { description: 'Avatar image deleted. Your initials show instead.' });
              }}
            >
              Yes, Delete Image
            </Button>
            <Button variant="outline" tone="neutral" iconLeft={<Icon name="x" />} slot="close">
              No, Close
            </Button>
          </>
        )}
      >
        <Text variant="body-base">Your avatar will show your initials instead. You can upload a new image at any time.</Text>
      </Modal>
    </Accordion>
  );
}

/** "Update Image", or just "Update" when the row is too narrow for both buttons' full labels. */
function ImageLabel({ verb }: { verb: string }) {
  return (
    <>
      {verb}
      <span {...stylex.props(styles.imageWord)}>Image</span>
    </>
  );
}

function ProfileSection({ data, update }: ViewProps) {
  const [displayName, setDisplayName] = useState(data.displayName);
  const [role, setRole] = useState(data.role);
  const [bio, setBio] = useState(data.bio);
  // Errors show once Save has been tried, then update as the fields change.
  const [submitted, setSubmitted] = useState(false);
  const nameError = submitted ? checkDisplayName(displayName) : null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (checkDisplayName(displayName)) return showInvalidToast();
    const name = displayName.trim();
    setDisplayName(name);
    update({ displayName: name, role, bio: bio.trim() }, { title: 'Profile saved', description: `Your profile now shows as ${name}.` });
    setSubmitted(false);
  };

  return (
    <Accordion title="Profile" defaultExpanded headingLevel={2}>
      <Form onSubmit={onSubmit} validationBehavior="aria" {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.twoColumns)}>
          <TextInput
            label="Display Name"
            placeholder="How others see you"
            value={displayName}
            onChange={setDisplayName}
            isInvalid={nameError != null}
            errorMessage={nameError}
          />
          <Select label="Role" placeholder="Choose a role" value={role} onChange={(key) => setRole(key == null ? null : String(key))}>
            {ROLES.map((r) => (
              <SelectItem key={r.id} id={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </Select>
        </div>
        <TextArea label="Bio" placeholder="A line or two about you" characterLimit={BIO_LIMIT} value={bio} onChange={setBio} />
        <div {...stylex.props(styles.actions)}>
          <Button type="submit" iconLeft={<Icon name="check" />}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Accordion>
  );
}

function LoginSection({ data, update }: ViewProps) {
  const [editing, setEditing] = useState(false);
  return (
    <Accordion title="Login" defaultExpanded headingLevel={2}>
      <div {...stylex.props(styles.stack)}>
        <div {...stylex.props(styles.row, styles.endOnMobile)}>
          <div {...stylex.props(styles.beside)}>
            {/* Figma "Settings Sim - Account": type/label/base, then the address in type/input/base. */}
            <Text variant="label">Email</Text>
            <p {...stylex.props(styles.emailValue)}>{data.email}</p>
          </div>
          <Button variant="outline" iconLeft={<Icon name="mail" />} onPress={() => setEditing(true)} xstyle={styles.pushEnd}>
            Update
          </Button>
        </div>
        <Switch
          labelPosition="left"
          description="Sends a code to your email address to verify your identity on login"
          isSelected={data.twoFactor}
          onChange={(on) =>
            update({ twoFactor: on }, { description: on ? 'Two factor authentication is on.' : 'Two factor authentication is off.' })
          }
          xstyle={styles.setting}
        >
          Two Factor Authentication
        </Switch>
      </div>
      <EmailModal isOpen={editing} onOpenChange={setEditing} email={data.email} update={update} />
    </Accordion>
  );
}

function EmailModal({
  isOpen,
  onOpenChange,
  email,
  update,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  update: UpdateSimData;
}) {
  const formId = useId();
  const [value, setValue] = useState(email);
  const [submitted, setSubmitted] = useState(false);
  const error = submitted ? checkEmail(value) : null;
  const open = (next: boolean) => {
    if (next) {
      setValue(email);
      setSubmitted(false);
    }
    onOpenChange(next);
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (checkEmail(value)) return showInvalidToast();
    if (update({ email: value.trim() }, { title: 'Email updated', description: `We’ll use ${value.trim()} from now on.` })) onOpenChange(false);
  };
  return (
    <Modal
      title="Update Email"
      size="small"
      isOpen={isOpen}
      onOpenChange={open}
      actions={
        <Button type="submit" form={formId} iconLeft={<Icon name="check" />}>
          Update
        </Button>
      }
      showCloseButton
    >
      <Form id={formId} onSubmit={onSubmit} validationBehavior="aria">
        <TextInput label="Email" type="email" autoFocus value={value} onChange={setValue} isInvalid={error != null} errorMessage={error} />
      </Form>
    </Modal>
  );
}

function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  return (
    <Accordion title="Danger Zone" tone="danger" defaultExpanded headingLevel={2}>
      <div {...stylex.props(styles.spread, styles.dangerRow)}>
        <div {...stylex.props(styles.beside)}>
          <Text variant="body-medium-bold">Delete Account</Text>
          <Text variant="caption">This action cannot be undone</Text>
        </div>
        <Button tone="danger" iconLeft={<Icon name="trash" />} aria-label="Delete Forever" onPress={() => setConfirming(true)}>
          Delete
          <span {...stylex.props(styles.foreverWord)}>Forever</span>
        </Button>
      </div>
      {/* Figma 2424:37704 */}
      <Modal
        title="Are you sure?"
        tone="danger"
        size="small"
        isOpen={confirming}
        onOpenChange={setConfirming}
        actions={(close) => (
          <>
            <Button
              tone="danger"
              iconLeft={<Icon name="trash" />}
              onPress={() => {
                close();
                simToast.show({
                  tone: 'danger',
                  title: 'Account deletion failed',
                  description: 'Your account could not be deleted because this is just a demo :-)',
                });
              }}
            >
              Yes, Delete Account
            </Button>
            <Button variant="outline" tone="neutral" iconLeft={<Icon name="x" />} slot="close">
              No, Close
            </Button>
          </>
        )}
      >
        <Text variant="body-base">After your account is deleted, your account data will be inaccessible permanently. This cannot be undone.</Text>
      </Modal>
    </Accordion>
  );
}

/** Crops the image to a square and shrinks it to AVATAR_SIZE, as a JPEG data URL. */
async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  canvas
    .getContext('2d')!
    .drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}

const styles = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: spacing.md },
  row: { display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  // On phones, buttons sit at the end of their row, lined up with the switches.
  endOnMobile: { justifyContent: { default: null, [PHONE]: 'space-between' } },
  // …and stay there when they wrap onto a line of their own.
  pushEnd: { marginInlineStart: { default: null, [PHONE]: 'auto' } },
  // A query container, so the buttons can shorten their labels before they wrap.
  avatarRow: { containerType: 'inline-size' },
  imageButtons: { display: 'flex', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  // "Image" goes when the row is narrower than the avatar and both full-length buttons.
  imageWord: { marginInlineStart: '0.25em', display: { default: null, '@container (max-width: 27rem)': 'none' } },
  // Text beside a button: it takes the room the button leaves and wraps there, so the button stays on the same line.
  // Only below 10rem of text does the button drop to a line of its own.
  beside: { flex: '1 1 10rem', minWidth: 0 },
  // A query container, so "Delete Forever" can shorten to "Delete" before it wraps.
  dangerRow: { containerType: 'inline-size' },
  foreverWord: { marginInlineStart: '0.25em', display: { default: null, '@container (max-width: 26rem)': 'none' } },
  emailValue: {
    margin: 0,
    overflowWrap: 'anywhere',
    fontFamily: fontTheme.familyBody,
    fontSize: font.sizeInput,
    lineHeight: font.lineHeightInput,
    fontWeight: font.weightRegular,
  },
  spread: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  setting: { justifyContent: 'space-between', width: '100%' },
  twoColumns: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: spacing.sm },
  actions: { display: 'flex', justifyContent: 'flex-end' },
});
