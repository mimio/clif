import type { ReactNode } from 'react';
import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The label/value block under a detail description: client, year, product.
 * Three equal columns over a hairline, labels 11px uppercase at .2em.
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
    className={cn('clif-meta-grid', className)}
    style={{
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    }}
  >
    {items.map((item) => (
      <div key={item.label}>
        <dt>
          <Text variant="label">{item.label}</Text>
        </dt>
        <dd>
          <Text variant="detail">{item.value}</Text>
        </dd>
      </div>
    ))}
  </dl>
);

export default MetaGrid;
