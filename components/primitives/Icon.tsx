import type { FC, SVGProps } from 'react';
import Cloud from 'public/icons/cloud.svg';
import Code from 'public/icons/code.svg';
import Cube from 'public/icons/cube.svg';
import FaceGrinSquintTears from 'public/icons/face-grin-squint-tears.svg';
import Feather from 'public/icons/feather.svg';
import Futbol from 'public/icons/futbol.svg';
import Gears from 'public/icons/gears.svg';
import Hiking from 'public/icons/hiking.svg';
import Home from 'public/icons/home.svg';
import List from 'public/icons/list.svg';
import Molecule from 'public/icons/molecule.svg';
import MoneyBillWave from 'public/icons/money-bill-wave.svg';
import Mountain from 'public/icons/mountain.svg';
import Pen from 'public/icons/pen.svg';
import Ufo from 'public/icons/ufo.svg';
import { cn } from 'utils/cn';

/*
 * A flat mark from public/icons, sized in px and tinted with currentColor
 * (design inventory 2.9).
 *
 * The design bundle fetched the file at runtime and dropped it in with
 * dangerouslySetInnerHTML. Here the SVG is a module: @svgr/webpack compiles
 * each file to a default-exported component (the turbopack rule in
 * next.config.ts, the svgr plugin in vitest.config.mts, and the `*.svg`
 * declaration in types/assets.d.ts), so the markup is inlined at build time
 * -- no fetch, no flash of nothing, and `fill: currentColor` from
 * styles/tokens/base.css resolves against this wrapper's colour.
 *
 * `src` stays the public path the content layer already speaks
 * (content/projects.ts carries `iconSrc: '/icons/pen.svg'`), and this table
 * is what turns that string into the compiled component. An unknown path
 * renders the empty box rather than throwing: a typo in content must not
 * take a route down.
 *
 * Product sizes: 8 caret, 12 user/envelope, 16 button, 20 home,
 * 40 project glyph.
 */
const ICONS: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  '/icons/cloud.svg': Cloud,
  '/icons/code.svg': Code,
  '/icons/cube.svg': Cube,
  '/icons/face-grin-squint-tears.svg': FaceGrinSquintTears,
  '/icons/feather.svg': Feather,
  '/icons/futbol.svg': Futbol,
  '/icons/gears.svg': Gears,
  '/icons/hiking.svg': Hiking,
  '/icons/home.svg': Home,
  '/icons/list.svg': List,
  '/icons/molecule.svg': Molecule,
  '/icons/money-bill-wave.svg': MoneyBillWave,
  '/icons/mountain.svg': Mountain,
  '/icons/pen.svg': Pen,
  '/icons/ufo.svg': Ufo,
};

/** Every path this component can draw, for the specimen and for tests. */
export const ICON_SRCS = Object.keys(ICONS);

export type IconProps = {
  /** Path under public/, e.g. '/icons/mountain.svg'. */
  src: string;
  size?: number;
  color?: string;
  /** Leave unset for decoration; set it and the icon gets a label. */
  title?: string;
  className?: string;
};

export const Icon = ({
  src,
  size = 16,
  color = 'currentColor',
  title,
  className,
}: IconProps) => {
  const Svg = ICONS[src];

  return (
    <span
      aria-hidden={title === undefined}
      aria-label={title}
      className={cn(
        'inline-flex flex-none transition-hue',
        className,
      )}
      data-icon-inline
      data-src={src}
      role={title === undefined ? undefined : 'img'}
      style={{ width: size, height: size, color }}
    >
      {Svg === undefined ? null : <Svg focusable="false" />}
    </span>
  );
};

export default Icon;
