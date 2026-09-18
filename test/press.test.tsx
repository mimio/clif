import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import Altimeter from 'components/chrome/Altimeter';
import ContactMouth from 'components/chrome/ContactMouth';
import ThemeEye from 'components/chrome/ThemeEye';
import ProjectTable from 'components/composed/ProjectTable';
import Scrubber from 'components/composed/Scrubber';
import Button from 'components/primitives/Button';
import Chip from 'components/primitives/Chip';
import Pill from 'components/primitives/Pill';
import { PRESS_SCALE } from 'components/primitives/press';

/*
 * THE PRESS CONTRACT, held across every component at once.
 *
 * This file exists because the same defect shipped three separate times, in
 * three components, and each time it was fixed in the one file it was
 * noticed in. The shape is always identical: a press utility and some other
 * state utility write the SAME property at the SAME specificity, and the
 * winner is whichever Tailwind emits last -- which is the compiler's
 * business, not the design's. A per-component assertion cannot catch it,
 * because every class involved is present in both the broken and the fixed
 * build. Only the RELATIONSHIP between two classes on one element says
 * which one a person will actually see.
 *
 * So the invariant is checked structurally, over the rendered class lists:
 * nothing may write a property a press writes unless it excludes :active.
 * See components/primitives/press.ts for why `not-active:` rather than
 * ordering or a specificity bump.
 *
 * It is deliberately a whitelist parser. An unrecognised utility that looks
 * like a state rule FAILS rather than being skipped, because the failure
 * mode this guards against is a property quietly going unwatched -- which
 * is exactly how `data-[active=true]:bg-accent-07` sat on top of the
 * project rows' press for as long as it did.
 */

type Rule = {
  /** Everything before the last colon: hover, active, data-[...], ... */
  variants: string[];
  /** The utility itself: bg-accent-20, scale-[0.94], [--k-y:0px]. */
  utility: string;
};

/**
 * Splits a Tailwind class into its variants and its utility, on colons that
 * are not inside brackets -- `active:[--k-y:var(--x)]` has three colons and
 * exactly one of them separates a variant.
 */
export const parseRule = (name: string): Rule => {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of name) {
    if (ch === '[' || ch === '(') depth += 1;
    else if (ch === ']' || ch === ')') depth -= 1;
    if (ch === ':' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return {
    variants: parts.slice(0, -1),
    utility: parts[parts.length - 1],
  };
};

/**
 * The CSS property a utility writes, or null where it writes none we need
 * to arbitrate (layout, type, the box). Only the families this site's state
 * rules actually use are listed; anything else that turns up under a state
 * variant is reported rather than ignored -- see UNKNOWN below.
 */
export const propertyOf = (utility: string): string | null => {
  // An arbitrary property: [--k-y:3.5px] or [transition-duration:0s].
  const arbitrary = /^\[([^:]+):/.exec(utility);
  if (arbitrary !== null) return arbitrary[1];

  if (/^bg-/.test(utility)) return 'background-color';
  if (/^(text|decoration)-/.test(utility)) return 'color';
  if (/^border-/.test(utility)) return 'border-color';
  if (/^opacity-/.test(utility)) return 'opacity';
  if (/^scale-/.test(utility)) return 'scale';
  if (/^-?translate-/.test(utility)) return 'translate';
  if (/^rotate-/.test(utility)) return 'rotate';
  if (/^shadow-/.test(utility)) return 'box-shadow';
  if (/^(pointer-events|cursor)-/.test(utility)) return null;
  return null;
};

/** Variants that make a rule fire on a state rather than at rest. */
const STATE_VARIANT =
  /^(hover|focus|focus-within|focus-visible|active|data-\[|aria-\[|group-|peer-|checked|disabled|open)/;

/**
 * `data-[disabled=true]` is exempt, and it is the only exemption.
 *
 * A disabled control also carries `data-[disabled=true]:pointer-events-none`
 * (Button/keycap.ts and Button/flat.ts), so it never receives a pointerdown
 * and :active is unreachable on it. Two rules that can never both apply are
 * not competing, and guarding the disabled half would be noise -- it would
 * also be wrong, since a disabled control should keep looking disabled.
 */
const isExempt = (variants: string[]): boolean =>
  variants.some((v) => v.startsWith('data-[disabled'));

const isPress = (r: Rule): boolean =>
  r.variants.includes('active') && !r.variants.includes('not-active');

const guarded = (r: Rule): boolean =>
  r.variants.includes('not-active');

const classesOf = (tree: ReactElement): string[][] => {
  const { container } = render(tree);
  return (
    [...container.querySelectorAll('*')]
      // An <svg> carries an SVGAnimatedString rather than a string, and the
      // keycap's expand mark is one.
      .map((node) =>
        typeof node.className === 'string'
          ? node.className
          : (node as SVGElement).className.baseVal,
      )
      .filter((list) => list.trim().length > 0)
      .map((list) => list.split(/\s+/))
  );
};

const CASES: { name: string; tree: ReactElement }[] = [
  {
    name: 'Button (keycap)',
    tree: <Button glyph="about">go</Button>,
  },
  {
    name: 'Button (flat)',
    tree: <Button variant="flat">go</Button>,
  },
  { name: 'Chip (resting)', tree: <Chip>all</Chip> },
  { name: 'Chip (selected)', tree: <Chip selected>all</Chip> },
  { name: 'Pill (accent)', tree: <Pill tone="accent">39N</Pill> },
  { name: 'Pill (neutral)', tree: <Pill tone="neutral">39N</Pill> },
  {
    name: 'ProjectTable',
    tree: (
      <ProjectTable
        rows={[
          {
            id: 'haikumi',
            index: 0,
            title: 'Haikumi',
            client: 'Haikumi',
            year: 2019,
            href: '/projects/haikumi',
          },
        ]}
      />
    ),
  },
  {
    name: 'Scrubber',
    tree: <Scrubber stops={[{ id: 1, label: 'NIKE', at: 25 }]} />,
  },
  { name: 'Altimeter', tree: <Altimeter active="hello" /> },
  /*
   * Both popovers are rendered OPEN, and that is the whole reason they are
   * listed twice. The panels hold real controls -- eight theme rows, a
   * mailto link and a copy button -- and a closed popover renders none of
   * them, so a sweep over the resting chrome walks straight past four
   * fifths of the pressable surface in it. That is exactly how the theme
   * rows and the contact actions kept a hover and no press through every
   * previous pass over this file.
   */
  { name: 'ThemeEye (closed)', tree: <ThemeEye /> },
  { name: 'ThemeEye (open)', tree: <ThemeEye defaultOpen /> },
  { name: 'ContactMouth (closed)', tree: <ContactMouth /> },
  { name: 'ContactMouth (open)', tree: <ContactMouth defaultOpen /> },
];

describe('rule 2: nothing outranks a press', () => {
  CASES.forEach(({ name, tree }) => {
    it(`holds for ${name}`, () => {
      classesOf(tree).forEach((list) => {
        const rules = list.map(parseRule);
        const pressed = new Set(
          rules.filter(isPress).map((r) => propertyOf(r.utility)),
        );
        pressed.delete(null);
        if (pressed.size === 0) return;

        const offenders = rules
          .filter(
            (r) =>
              !isPress(r) &&
              !guarded(r) &&
              !isExempt(r.variants) &&
              r.variants.some((v) => STATE_VARIANT.test(v)) &&
              pressed.has(propertyOf(r.utility)),
          )
          .map((r) => [...r.variants, r.utility].join(':'));

        expect(
          offenders,
          `${name}: these outrank or race the press on a property it writes -- scope them \`not-active:\``,
        ).toEqual([]);
      });
    });
  });
});

/*
 * A property the parser does not recognise is reported here rather than
 * silently passing the test above. It is not a failure -- plenty of state
 * utilities are layout -- but the list is printed so that a new state
 * family cannot join the tree without someone deciding whether it can race
 * a press.
 */
describe('the parser sees what the components write', () => {
  it('recognises every property a press rule sets', () => {
    const unnamed = new Set<string>();
    CASES.forEach(({ tree }) =>
      classesOf(tree).forEach((list) =>
        list
          .map(parseRule)
          .filter(isPress)
          .forEach((r) => {
            if (propertyOf(r.utility) === null)
              unnamed.add(r.utility);
          }),
      ),
    );
    expect([...unnamed]).toEqual([]);
  });
});

describe('rule 1: a press moves away from rest', () => {
  it('compresses past 1, so it reads from rest as well as from hover', () => {
    expect(PRESS_SCALE).toBeLessThan(1);
  });

  it('is what every scaling press actually wears', () => {
    const scales = new Set<string>();
    CASES.forEach(({ tree }) =>
      classesOf(tree).forEach((list) =>
        list
          .map(parseRule)
          .filter(isPress)
          .filter((r) => propertyOf(r.utility) === 'scale')
          .forEach((r) => scales.add(r.utility)),
      ),
    );
    // Every one of them, and no second opinion about the number.
    scales.forEach((utility) =>
      expect(utility).toBe(`scale-[${PRESS_SCALE}]`),
    );
    expect(scales.size).toBeGreaterThan(0);
  });
});

describe('rule 3: the press is immediate in', () => {
  /*
   * Anything whose transition is a CLASS has to collapse it under :active,
   * or the down edge runs the release easing and a normal-length click
   * renders a fraction of the state. The keycap is the exception and is
   * excluded by name: its transition is an inline declaration, which no
   * class can outrank, so it flips `--k-move` / `--k-hue` instead. See the
   * PRESS block in Button/keycap.ts.
   */
  const TRANSITION = /^(transition|duration)(-|$)/;

  CASES.filter(({ name }) => name !== 'Button (keycap)').forEach(
    ({ name, tree }) => {
      it(`holds for ${name}`, () => {
        classesOf(tree).forEach((list) => {
          const rules = list.map(parseRule);
          const presses = rules.filter(isPress);
          const transitions = rules.filter(
            (r) =>
              r.variants.length === 0 && TRANSITION.test(r.utility),
          );
          if (presses.length === 0 || transitions.length === 0)
            return;

          const collapses = presses.some(
            (r) => propertyOf(r.utility) === 'transition-duration',
          );
          expect(
            collapses,
            `${name}: a press on a class-declared transition must carry PRESS_NOW`,
          ).toBe(true);
        });
      });
    },
  );
});
