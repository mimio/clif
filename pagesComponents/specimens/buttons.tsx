import type { ReactNode } from 'react';
import Button, {
  BUTTON_SIZE_ORDER,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
} from 'components/primitives/Button';
import type { Specimen } from 'pagesComponents/specimens/types';

/*
 * Lane 2's section: the button system.
 *
 * The grid is 2 variants x 3 sizes x 2 tones x 4 states. Three of those
 * states cannot be produced by rendering alone -- rest, hover and press
 * differ only by pseudo-class -- so every cell is tagged
 * data-cell="<variant>-<size>-<tone>-<state>" and the screenshot script
 * forces :hover and :active on the right cells through CDP
 * (CSS.forcePseudoState). Reading the page by hand, the hover and press
 * columns look like the rest column until you point at them; that is
 * expected.
 *
 * What to look for in the keycap columns, in order of importance:
 *   1. rest    -- the cap stands on a solid skirt of its own colour.
 *   2. hover   -- it rises 1px and the skirt and cast GROW underneath it.
 *   3. press   -- it travels exactly the skirt and the skirt is GONE: the
 *                 cap is sitting on the plate, not floating above it.
 *   4. nothing below any cap moves between those three. The wrapper's
 *      padding-bottom reserves the lift.
 */

type State = 'rest' | 'hover' | 'press' | 'disabled';

const STATES: State[] = ['rest', 'hover', 'press', 'disabled'];
const VARIANTS: ButtonVariant[] = ['keycap', 'flat'];
const TONES: ButtonTone[] = ['primary', 'secondary'];

const DISABLED: Record<State, boolean> = {
  rest: false,
  hover: false,
  press: false,
  disabled: true,
};

const LABELS: Record<ButtonSize, string> = {
  md: 'projects',
  sm: 'browse all',
  xs: 'all 14',
};

const Cell = ({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) => (
  <div
    className="flex items-start justify-center px-4 py-3"
    data-cell={name}
  >
    {children}
  </div>
);

const Head = ({ children }: { children: ReactNode }) => (
  <div className="px-4 py-2 text-[length:var(--type-readout-size)] tracking-[var(--type-readout-tracking)] text-fg-4 uppercase">
    {children}
  </div>
);

const Row = ({
  variant,
  size,
  tone,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  tone: ButtonTone;
}) => (
  <>
    <Head>
      {size} · {tone}
    </Head>
    {STATES.map((state) => (
      <Cell key={state} name={`${variant}-${size}-${tone}-${state}`}>
        <Button
          disabled={DISABLED[state]}
          size={size}
          tone={tone}
          variant={variant}
        >
          {LABELS[size]}
        </Button>
      </Cell>
    ))}
  </>
);

const Matrix = ({ variant }: { variant: ButtonVariant }) => (
  <div data-matrix={variant}>
    <h3 className="mb-2 text-[length:var(--type-detail-size)] text-fg-2">
      {variant}
    </h3>
    <div className="inline-grid grid-cols-[auto_repeat(4,minmax(0,1fr))] items-center rounded-[var(--radius-sm)] border border-surface-3 bg-surface">
      <Head> </Head>
      {STATES.map((state) => (
        <Head key={state}>{state}</Head>
      ))}
      {BUTTON_SIZE_ORDER.map((size) =>
        TONES.map((tone) => (
          <Row
            key={`${size}-${tone}`}
            size={size}
            tone={tone}
            variant={variant}
          />
        )),
      )}
    </div>
  </div>
);

/*
 * The slots, at the size each artboard actually uses them: the glyph and the
 * expand mark both spring on --g-mul, the lead and trail are accent marks
 * with a rim, and `grow` takes the whole row. Note the trail cap -- its left
 * padding is the plain one, which is the documented quirk (sizes.ts).
 */
const Slots = () => (
  <div className="flex flex-wrap items-end gap-6" data-matrix="slots">
    <Button glyph="projects" size="md">
      projects
    </Button>
    <Button glyph="about" size="md" tone="secondary">
      about
    </Button>
    <Button expand size="sm">
      browse all
    </Button>
    <Button lead="←" size="sm">
      selected work
    </Button>
    <Button size="sm" tone="secondary" trail="→">
      next
    </Button>
    <Button expand size="xs">
      all 14
    </Button>
    <div className="flex w-[320px] gap-3">
      <Button grow size="sm">
        Nike
      </Button>
      <Button grow size="sm" tone="secondary">
        Freelancing
      </Button>
    </div>
    <Button center className="w-[200px]" size="md" variant="flat">
      contact
    </Button>
  </div>
);

export const buttons: Specimen = {
  id: 'buttons',
  title: 'Buttons',
  note: 'Keycap and flat variants across sizes, tones and states.',
  render: () => (
    <div className="flex flex-col gap-8">
      {VARIANTS.map((variant) => (
        <Matrix key={variant} variant={variant} />
      ))}
      <Slots />
    </div>
  ),
};

export default buttons;
