import { useEffect, useRef, useState, type ReactNode } from 'react';
import Chip from 'components/primitives/Chip';
import Icon, { ICON_SRCS } from 'components/primitives/Icon';
import PageWord, {
  PAGE_WORD_SIZES,
  PAGE_WORD_STEPS,
  type PageWordSize,
} from 'components/primitives/PageWord';
import Pill, {
  PILL_SIZES,
  type PillSize,
  type PillTone,
} from 'components/primitives/Pill';
import Rule from 'components/primitives/Rule';
import Text, { type TextVariant } from 'components/primitives/Text';
import type { Specimen } from 'pagesComponents/specimens/types';

/*
 * Lane 1's section: the type scale and the small atoms built on it.
 *
 * It is laid out to be read rather than admired. The scale runs twice, once
 * on the ground and once on the raised surface, because those are the two
 * places text ever lands and a step that goes soft on one of them is the
 * failure this page exists to catch. Each row prints its own COMPUTED size,
 * line height, weight and colour -- read off the rendered element, not off
 * the token -- so a variant whose classes never landed says so in numbers
 * rather than just looking a little small, and so narrowing the window past
 * 1000px and 650px shows the responsive steps firing live.
 */

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

const SPECIMEN_COPY: Record<TextVariant, string> = {
  heading: 'hello.',
  heading2: 'Selected work',
  heading3: 'Ubiquiti',
  subheader: 'Maps, dashboards, and the software around them.',
  subheader2: 'Maps, dashboards, and the software around them.',
  body: 'One persistent globe. Routes are camera positions, and the foreground is the only thing that swaps.',
  body2:
    'One persistent globe. Routes are camera positions, and the foreground is the only thing that swaps.',
  detail: 'Portland OR · Dec 2018 — Jan 2020',
  detail2: 'GoPro Mountain Games Event Map',
  detail3: '970 Design · 2017',
  label: 'client',
  readout: 'stop 04 / 06',
};

const WORDS: Record<PageWordSize, string> = {
  xl: 'hello.',
  lg: 'gopro',
  md: 'projects',
  sm: 'about',
};

const ICON_STEPS = [8, 12, 16, 20, 40];

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) => (
  <section className="mb-10">
    <Text className="block" variant="label">
      {title}
    </Text>
    {note === undefined ? null : (
      <Text className="mb-3 block max-w-[70ch]" variant="detail">
        {note}
      </Text>
    )}
    <Rule />
    <div className="pt-4">{children}</div>
  </section>
);

/** One row of the scale: the specimen, and what it actually computed to. */
const Row = ({ variant }: { variant: TextVariant }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState('');

  useEffect(() => {
    const measure = () => {
      const node = ref.current?.firstElementChild;
      if (node === null || node === undefined) return;
      const s = getComputedStyle(node);
      setMeasured(
        `${s.fontSize} / ${s.lineHeight} · w${s.fontWeight} · ${s.color}`,
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div className="mb-5 min-w-0">
      <div ref={ref}>
        <Text className="block" variant={variant}>
          {SPECIMEN_COPY[variant]}
        </Text>
      </div>
      <code className="block text-[10px] text-fg-5">
        {variant} — {measured}
      </code>
    </div>
  );
};

const Scale = ({ raised }: { raised: boolean }) => (
  <div
    className={`rounded-[var(--radius-card)] p-5 ${raised ? 'bg-surface-2' : 'bg-surface'}`}
  >
    <Text className="mb-4 block" variant="readout">
      {raised ? 'on the raised surface' : 'on the ground'}
    </Text>
    {VARIANTS.map((variant) => (
      <Row key={variant} variant={variant} />
    ))}
  </div>
);

const Atoms = () => (
  <div className="bg-surface p-4">
    <Section
      note="Twelve variants, every size a var(--type-*) reference. Read both columns: the left is the ground, the right is the raised surface, and every step has to hold on both. Narrow the window past 1000 and 650 to watch the responsive steps fire."
      title="Type scale"
    >
      <div className="grid grid-cols-2 gap-4 max-tablet:grid-cols-1">
        <Scale raised={false} />
        <Scale raised />
      </div>
    </Section>

    <Section
      note="The brand mark: Adder, lowercase, .06em, the themed --grad-word clipped to the word. The box is shrink-to-fit, so the ramp always runs across the letters and never across the column."
      title="Page word"
    >
      <div className="flex flex-col gap-6">
        {(Object.keys(PAGE_WORD_SIZES) as PageWordSize[]).map(
          (size) => (
            <div key={size}>
              <PageWord size={size}>{WORDS[size]}</PageWord>
              <Text className="block" variant="readout">
                {`${size} — ${PAGE_WORD_SIZES[size]} / ${PAGE_WORD_STEPS[size].tablet} / ${PAGE_WORD_STEPS[size].mobile} px`}
              </Text>
            </div>
          ),
        )}
      </div>
    </Section>

    <Section
      note="Inlined at build time by svgr, tinted with currentColor. The first row is every product size; the grid is every mark in public/icons at 40."
      title="Icons"
    >
      <div className="mb-5 flex flex-wrap items-end gap-5">
        {ICON_STEPS.map((size) => (
          <div
            className="flex flex-col items-center gap-2"
            key={size}
          >
            <Icon size={size} src="/icons/mountain.svg" />
            <Text variant="readout">{size}</Text>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2">
          <Icon
            className="text-accent"
            size={40}
            src="/icons/ufo.svg"
            title="UFO"
          />
          <Text variant="readout">labelled</Text>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Icon size={40} src="/icons/does-not-exist.svg" />
          <Text variant="readout">unknown</Text>
        </div>
      </div>
      <div className="flex flex-wrap gap-5 text-fg-3">
        {ICON_SRCS.map((src) => (
          <div className="flex flex-col items-center gap-2" key={src}>
            <Icon size={40} src={src} />
            <Text variant="readout">
              {src.replace('/icons/', '').replace('.svg', '')}
            </Text>
          </div>
        ))}
      </div>
    </Section>

    <Section
      note="Never a solid accent: the accent tone is an accent-30 hairline over an accent-07 wash. md is the detail route's role mark, sm the scrubber's controls."
      title="Pills"
    >
      <div className="flex flex-wrap items-start gap-3">
        {(['md', 'sm'] as PillSize[]).flatMap((size) =>
          (['accent', 'neutral'] as PillTone[]).map((tone) => (
            <Pill key={`${size}-${tone}`} size={size} tone={tone}>
              {`${tone} ${size} · ${PILL_SIZES[size].padding}`}
            </Pill>
          )),
        )}
        <Pill href="mailto:clif@mimio.io" tone="accent">
          mailto link
        </Pill>
        <Pill size="sm" vertical>
          <span>45.512</span>
          <span>-122.658</span>
        </Pill>
      </div>
    </Section>

    <Section
      note="A toggle, so it carries aria-pressed. Selected and hover share the accent-12 fill; only the border and the ink change."
      title="Chips"
    >
      <div className="flex flex-wrap gap-3">
        <Chip>all</Chip>
        <Chip selected>maps</Chip>
        <Chip>product</Chip>
        <Chip>design</Chip>
      </div>
    </Section>

    <Section
      note="1px, two tones. Neutral separates rows; accent closes a table."
      title="Rules"
    >
      <div className="flex flex-col gap-3">
        <Rule />
        <Rule tone="accent" />
      </div>
    </Section>
  </div>
);

export const atoms: Specimen = {
  id: 'atoms',
  title: 'Atoms',
  note: 'Text scale, page word, icons, pills, chips, rules.',
  render: () => <Atoms />,
};

export default atoms;
