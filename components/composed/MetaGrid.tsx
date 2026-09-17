import type { ReactNode } from 'react';
import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The label/value block under a detail description: client, year, product.
 * Equal columns over a hairline, labels uppercase and tracked, values in
 * detail ink. It is a description list, so a reader gets the pairing without
 * the layout.
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
      'm-0 grid gap-4 border-t border-surface-3 pt-1.5',
      className,
    )}
    style={{
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    }}
  >
    {items.map((item) => (
      <div key={item.label}>
        <dt className="mb-1.5">
          <Text
            className="block [letter-spacing:var(--type-label-tracking)] text-fg-5 uppercase"
            variant="label"
          >
            {item.label}
          </Text>
        </dt>
        <dd className="m-0">
          <Text
            className="block text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] text-fg-2"
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
