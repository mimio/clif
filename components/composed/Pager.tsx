import Button, {
  type ButtonSize,
} from 'components/primitives/Button';
import { cn } from 'utils/cn';

/*
 * Previous / next, as a pair of small keycaps. The previous cap leads with an
 * arrow, the next cap trails with one and takes the secondary tone -- the
 * second colour is "where you're going"; on the about sheet both grow so they
 * split the row evenly.
 *
 * Either end can be missing: the first and last project, and the first and
 * last stop on the timeline, each render one cap and no placeholder.
 */
export type PagerLink = {
  href: string;
  label: string;
};

export type PagerProps = {
  prev?: PagerLink | null;
  next?: PagerLink | null;
  size?: ButtonSize;
  grow?: boolean;
  className?: string;
};

export const Pager = ({
  prev = null,
  next = null,
  size = 'sm',
  grow = false,
  className,
}: PagerProps) => (
  <nav
    className={cn(
      'flex items-center gap-3',
      grow && 'w-full gap-2.5',
      className,
    )}
  >
    {prev === null ? null : (
      <Button grow={grow} href={prev.href} lead="←" size={size}>
        {prev.label}
      </Button>
    )}
    {next === null ? null : (
      <Button
        grow={grow}
        href={next.href}
        size={size}
        tone="secondary"
        trail="→"
      >
        {next.label}
      </Button>
    )}
  </nav>
);

export default Pager;
