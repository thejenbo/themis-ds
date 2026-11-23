import { defineComponentDocs } from '../../docs/component-docs';

export default defineComponentDocs({
  name: 'ColorPicker',
  status: 'beta',
  category: 'Color',
  summary: 'A color swatch that opens a picker: a saturation × brightness area and a hue slider, with optional advanced sliders and recent colors.',
  base: {
    package: 'react-aria-components',
    component: 'ColorPicker',
    docsUrl: 'https://react-spectrum.adobe.com/react-aria/ColorPicker.html',
  },

  usage: {
    whenToUse: [
      'Choosing any color visually, e.g. a theme or tag color.',
      'Next to a typed color code: use ColorField, which has this picker built in.',
    ],
    whenNotToUse: [
      { scenario: 'Choosing from a fixed set of colors.', useInstead: 'a RadioGroup or swatch list' },
      { scenario: 'Typing an exact code.', useInstead: 'ColorField' },
    ],
  },

  anatomy: [
    { part: 'Swatch button', description: 'A ColorPickerSwatch showing the color (24, 32 or 40px). Opens the picker.', required: true },
    { part: 'Panel', description: 'A popover 4px from the swatch: 24px padding around 280px of content (scrolls when the screen is too short), border/width/lg in color/border, radius lg, the default drop shadow.', required: true },
    { part: 'Area', description: 'ColorArea, saturation (left to right) × brightness (bottom to top), 280px wide at its usual 345:284 proportions.', required: true },
    { part: 'Advanced button', description: 'With `showAdvanced`: a small brand button with the settings icon, under the area on the right. Outline when closed, filled when open.', required: false },
    { part: 'Hue slider', description: 'ColorSlider for hue, no label. Replaced by the advanced sliders when they are open.', required: true },
    { part: 'Advanced sliders', description: 'Saturation, Brightness and Hue ColorSliders with labels, 8px apart.', required: false },
    { part: 'Recent colors', description: 'With `recentColors`: the "Recently used" label, then up to 6 ColorPickerSwatches 8px apart, spanning the panel; unused slots are empty ColorSwatches.', required: false },
  ],

  variants: {
    showAdvanced: {
      false: 'The area and the hue slider only. The default.',
      true: 'Adds the "Advanced" button for Saturation, Brightness and Hue sliders.',
    },
    recentColors: {
      undefined: 'No recent colors. The default.',
      'an array': 'The app\'s recent colors, newest first; the picker shows them and reports finished changes through `onChangeEnd`.',
    },
  },

  accessibility: {
    providedByBase: [
      'The swatch is a button (aria-haspopup, aria-expanded) named by the color\'s description and `aria-label` ("vibrant purple, Background color").',
      'The panel is a dialog: focus moves into it when it opens, Escape or clicking outside closes it, and focus returns to the swatch.',
      'The area and sliders are native sliders, announced with their channel and value; the recent colors are a listbox, and the current color is selected.',
      '"Advanced" is a disclosure button: it announces expanded or collapsed.',
    ],
    keyboard: [
      { keys: 'Enter / Space', action: 'Opens the picker from the swatch; opens or closes the advanced sliders.' },
      { keys: 'Tab', action: 'Moves between the area, the Advanced button, the sliders and the recent colors.' },
      { keys: 'Arrow keys', action: 'Move the area\'s thumb or a slider; move between recent colors.' },
      { keys: 'Escape', action: 'Closes the picker.' },
    ],
    requirements: [
      'Give it an `aria-label` that says what the color is for.',
      'Show the color as text somewhere (e.g. with ColorField) when people need the exact value.',
    ],
  },

  guidelines: {
    do: [
      'Keep the recent colors in your app and add to them from `onChangeEnd`.',
      'Use ColorField when people may want to type or paste a code.',
    ],
    dont: ['Rely on color alone to tell people what they chose; show its name or code too.'],
  },

  tokens: [
    'colorTheme/color.background',
    'colorTheme/color.border',
    'colorTheme/color.text',
    'borderWidth/border.width.lg',
    'radius/border.radius.lg',
    'shadows/drop shadow.x.default',
    'shadows/drop shadow.y.default',
    'shadows/drop shadow.blur.default',
    'shadows/drop shadow.color.default',
    'spacing/spacing.xs',
    'spacing/spacing.sm',
    'spacing/spacing.md',
    'motion/duration.base',
    'motion/easing.standard',
  ],

  motion: [
    {
      trigger: 'The picker opens or closes',
      property: 'Fades in while sliding 4px down; fades out',
      duration: 'motion/duration.base',
      easing: 'motion/easing.standard',
      reducedMotion: 'Fades only.',
    },
  ],

  figma: {
    componentKey: null,
    url: 'https://www.figma.com/design/tRoAewIghL1YbnTio6fkkw/Themis-Design-System?node-id=2359-759',
    properties: {
      recentColors: { figmaProperty: 'recentSwatches', type: 'VARIANT' },
      showAdvanced: { figmaProperty: 'showAdvanced', type: 'VARIANT' },
      defaultAdvancedOpen: { figmaProperty: 'advancedOpen', type: 'VARIANT' },
    },
    differences: [
      { topic: 'Trigger', figma: 'The panel only.', code: 'The panel opens from a ColorPickerSwatch (or ColorField\'s swatch), 4px away; clicking outside or Escape closes it.', action: 'annotate-figma', done: '2026-11-16' },
    ],
  },

  related: ['ColorField', 'ColorPickerSwatch', 'ColorArea', 'ColorSlider'],
  notes: [
    'The color lives in React Aria\'s `ColorPicker`; the area, sliders, recent colors and swatch all read and change it through context.',
    'The picker works in HSB: the area is saturation × brightness, and the advanced sliders are Saturation, Brightness and Hue.',
  ],
});
