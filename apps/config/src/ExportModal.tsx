import * as stylex from '@stylexjs/stylex';
import { Button, Icon, Modal, Text, type ThemisConfig, toast } from 'themis-ds';

import { border as borderWidth } from '../../../src/tokens/borderWidth.stylex';
import { color } from '../../../src/tokens/colorTheme.stylex';
import { border as radius } from '../../../src/tokens/radius.stylex';
import { spacing } from '../../../src/tokens/spacing.stylex';

const FILE_NAME = 'themis.theme.json';

interface ExportModalProps {
  config: ThemisConfig;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/** The theme file, ready to copy or download. Put it in your project and pass a theme to `<ThemeProvider theme>`. */
export function ExportModal({ config, isOpen, onOpenChange }: ExportModalProps) {
  const json = `${JSON.stringify(config, null, 2)}\n`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      toast.show({ tone: 'success', description: 'Theme file copied.' });
    } catch {
      toast.show({ tone: 'danger', description: 'Couldn’t copy. Select the text and copy it instead.' });
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = FILE_NAME;
    a.click();
    URL.revokeObjectURL(url);
    toast.show({ tone: 'success', description: `Downloaded ${FILE_NAME}.` });
  };

  return (
    <Modal
      title="Export theme file"
      size="large"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showCloseButton
      actions={
        <>
          <Button variant="outline" iconLeft={<Icon name="copy" />} onPress={copy}>
            Copy
          </Button>
          <Button onPress={download}>Download</Button>
        </>
      }
    >
      <div {...stylex.props(styles.body)}>
        <Text variant="body-base">
          Save this as <code>{FILE_NAME}</code> in your project, then pass a theme to{' '}
          <code>{'<ThemeProvider theme={config.themes.light}>'}</code>.
        </Text>
        <pre {...stylex.props(styles.code)} tabIndex={0} aria-label="Theme file">
          {json}
        </pre>
      </div>
    </Modal>
  );
}

const styles = stylex.create({
  body: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  code: {
    margin: 0,
    maxHeight: '50vh',
    overflow: 'auto',
    padding: spacing.sm,
    borderWidth: borderWidth.widthSm,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: radius.radiusMd,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.8125rem',
    lineHeight: 1.5,
    whiteSpace: 'pre',
  },
});
