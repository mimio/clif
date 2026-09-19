import { cn } from 'utils/cn';

/*
 * A 1px hairline. Neutral is --border-color (Tailwind's surface-3) and
 * separates rows; accent is the ladder's 30% step and closes a table, as it
 * does under the header of 1c's full table and above its "selected work"
 * keycap. Nothing in the system draws a thicker line, so there is no width
 * prop.
 *
 * It is an <hr>, so it needs its UA border and margin taken off, and the
 * line itself is a background rather than a border -- a background takes the
 * themed colour in one property and transitions with everything else.
 */
export type RuleTone = 'accent' | 'neutral';

export type RuleProps = {
  tone?: RuleTone;
  className?: string;
};

export const Rule = ({ tone = 'neutral', className }: RuleProps) => (
  <hr
    className={cn(
      'm-0 h-px w-full border-0 bg-surface-3 transition-hue',
      'data-[tone=accent]:bg-accent-30',
      className,
    )}
    data-tone={tone}
  />
);

export default Rule;
