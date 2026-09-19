import type { CSSProperties, ReactNode } from 'react';
import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The label/value block under a detail description: client, year, product.
 * Equal columns over a hairline, labels uppercase and tracked, values in
 * detail ink. It is a description list, so a reader gets the pairing without
 * the layout.
 *
 * IT DROPS TO ONE COLUMN BELOW TABLET, for the same reason the projects
 * table drops from six tracks to three. 1d draws this at desktop and nowhere
 * else, so the narrow treatment is not in the bundle; three equal tracks of
 * a 322px column are 97px each at 390 and 73px at 320, and `Wieden+Kennedy`
 * is 118px of Roboto Mono at the detail size. It has no space in it, so it
 * cannot wrap, and every one of those cells was painting its tail across the
 * cell beside it and then off the end of the column -- 21px over at 390,
 * 45px at 320. Stacking is what the value is worth here: the pairing
 * survives, nothing is abbreviated, and nothing is lost.
 *
 * `overflow-wrap: anywhere` is the floor under that rather than the fix. It
 * is the variant that feeds min-content sizing -- `break-word` does not --
 * so a single unbroken token can never set a track's minimum and push the
 * grid wider than the box it was given, whatever the column count.
 */
export type MetaItem = {
  label: string;
  value: ReactNode;
};

export type MetaGridProps = {
  items: MetaItem[];
  columns?: number;
  className?: string;
};

export const MetaGrid = ({
  items,
  columns = 3,
  className,
}: MetaGridProps) => (
  <dl
    className={cn(
      'm-0 grid grid-cols-1 gap-4 border-t border-surface-3 pt-1.5',
      'tablet:[grid-template-columns:repeat(var(--meta-columns),minmax(0,1fr))]',
      className,
    )}
    style={{ '--meta-columns': columns } as CSSProperties}
  >
    {items.map((item) => (
      // min-w-0: the cell is the grid item, and a grid item does not go
      // under its own content width until its automatic minimum is zeroed.
      <div className="min-w-0" key={item.label}>
        <dt className="mb-1.5">
          <Text
            className="block [letter-spacing:var(--type-label-tracking)] [overflow-wrap:anywhere] text-fg-5 uppercase"
            variant="label"
          >
            {item.label}
          </Text>
        </dt>
        <dd className="m-0">
          <Text
            className="block text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] [overflow-wrap:anywhere] text-fg-2"
            variant="detail"
          >
            {item.value}
          </Text>
        </dd>
      </div>
    ))}
  </dl>
);

export default MetaGrid;
