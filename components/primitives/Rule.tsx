import { cn } from 'utils/cn';

/*
 * A 1px hairline. Neutral is --border-color and separates rows; accent is
 * --clif-yellow-30 and closes a table. Nothing in the system draws a thicker
 * line, so there is no width prop.
 */
export type RuleTone = 'accent' | 'neutral';

export type RuleProps = {
  tone?: RuleTone;
  className?: string;
};

export const Rule = ({ tone = 'neutral', className }: RuleProps) => (
  <hr className={cn('clif-rule', className)} data-tone={tone} />
);

export default Rule;
