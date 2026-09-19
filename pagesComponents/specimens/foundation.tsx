import Button from 'components/primitives/Button';
import Chip from 'components/primitives/Chip';
import Glyph from 'components/primitives/Glyph';
import PageWord from 'components/primitives/PageWord';
import Pill from 'components/primitives/Pill';
import Rule from 'components/primitives/Rule';
import Text, { type TextVariant } from 'components/primitives/Text';
import type { Specimen } from 'pagesComponents/specimens/types';

const VARIANTS: TextVariant[] = [
  'heading',
  'heading2',
  'heading3',
  'subheader',
  'subheader2',
  'body',
  'body2',
  'detail',
  'detail2',
  'detail3',
  'label',
  'readout',
];

// Lane A's section: the primitives, every variant of each, so the next lane
// can see what it is styling before it styles it.
export const foundation: Specimen = {
  id: 'foundation',
  title: 'Primitives',
  note: 'Text scale, keycap sizes and tones, glyphs, pills, chips, rules.',
  render: () => (
    <>
      <PageWord size="md">specimens</PageWord>
      {VARIANTS.map((variant) => (
        <Text key={variant} variant={variant}>
          {variant}
        </Text>
      ))}
      <Rule />
      {(['md', 'sm', 'xs'] as const).map((size) => (
        <div key={size}>
          <Button glyph="projects" size={size}>
            {size} primary
          </Button>
          <Button size={size} tone="secondary" trail="→">
            {size} secondary
          </Button>
          <Button expand size={size} variant="flat">
            {size} flat
          </Button>
        </div>
      ))}
      <Rule tone="accent" />
      {(['home', 'projects', 'about'] as const).map((kind) => (
        <Glyph key={kind} kind={kind} />
      ))}
      <Pill tone="accent">accent pill</Pill>
      <Pill size="sm">neutral pill</Pill>
      <Chip selected>selected chip</Chip>
      <Chip>chip</Chip>
    </>
  ),
};

export default foundation;
