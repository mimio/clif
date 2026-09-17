import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The coordinate readout: a 34px vertical pill showing the camera's centre to
 * three decimals, with a caption below the divider. On the detail route the
 * camera is not yours, and the caption reads `held` rather than `camera`.
 *
 * It has limbs. Two poses, driven by hover only -- REST and WAKE -- with
 * every limb easing over 520ms cubic-bezier(.34,1.56,.64,1). The limbs are
 * pointer-events:none; only the pill is a hit target.
 */
export type CoordPillProps = {
  lng: number;
  lat: number;
  label?: string;
  className?: string;
};

export const formatCoordinates = (lng: number, lat: number): string =>
  `${lat.toFixed(3)}, ${lng.toFixed(3)}`;

export const CoordPill = ({
  lng,
  lat,
  label = 'camera',
  className,
}: CoordPillProps) => (
  <div className={cn('clif-coord-pill', className)}>
    <Text variant="readout">{formatCoordinates(lng, lat)}</Text>
    <span aria-hidden="true" className="clif-coord-pill-divider" />
    <Text variant="label">{label}</Text>
  </div>
);

export default CoordPill;
