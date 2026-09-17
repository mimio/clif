import { useState, type CSSProperties } from 'react';
import { cn } from 'utils/cn';

/*
 * The coordinate readout: a 34px vertical pill showing the camera's centre
 * to three decimals, with a caption under the divider. On the detail route
 * the camera is not yours, and the caption reads `held` rather than
 * `camera`.
 *
 * It has a body. Two stick arms and two stick legs, one joint each, drawn
 * on the pill's outline so the readout itself never has to know it is
 * wearing one. Two poses only, driven by hover: REST and WAKE, every limb
 * easing over 520ms cubic-bezier(.34,1.56,.64,1) -- the back-out curve, so
 * the limbs overshoot and settle rather than sliding.
 *
 * Every limb is pointer-events:none. Only the pill is a hit target, so
 * sweeping the cursor past a swinging hand cannot latch the pose.
 *
 * The divider and the caption share the pill's centre column with the
 * readout, so the label bar under the body lines up with it rather than
 * drifting off the axis.
 */
export type Pose = {
  armL: number;
  foreL: number;
  armR: number;
  foreR: number;
  legL: number;
  shinL: number;
  legR: number;
  shinR: number;
};

export const REST: Pose = {
  armL: -74,
  foreL: 14,
  armR: 72,
  foreR: -14,
  legL: -5,
  shinL: 12,
  legR: 5,
  shinR: -12,
};

export const WAKE: Pose = {
  armL: -52,
  foreL: 40,
  armR: 48,
  foreR: -44,
  legL: -16,
  shinL: 30,
  legR: 18,
  shinR: -26,
};

export const LIMB_MS = 520;
export const LIMB_EASE = 'cubic-bezier(.34,1.56,.64,1)';

export const PILL_WIDTH = 34;

/** Shared by every limb segment, so they all swing on one clock. */
const LIMB_MOTION =
  'transition-transform duration-[520ms] ease-[cubic-bezier(.34,1.56,.64,1)] motion-reduce:transition-none';

const BONE = 'absolute rounded-[1px] bg-accent-60';
const JOINT = 'absolute h-[3px] w-[3px] rounded-full bg-accent';

const READOUT_TYPE: CSSProperties = {
  writingMode: 'vertical-rl',
  fontSize: 'var(--type-readout-size)',
  fontWeight: 'var(--weight-regular)',
};

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
}: CoordPillProps) => {
  const [awake, setAwake] = useState(false);
  const pose = awake ? WAKE : REST;

  return (
    <div
      className={cn(
        'relative w-[34px] flex-none font-mono select-none',
        className,
      )}
      data-awake={awake}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-[26px] left-[-27px] h-[52px] w-[28px] origin-[27px_3px]',
          LIMB_MOTION,
        )}
        style={{ transform: `rotate(${pose.armL}deg)` }}
      >
        <span
          className={cn(
            BONE,
            'top-[2px] left-[5px] h-[2px] w-[22px]',
          )}
        />
        <span className={cn(JOINT, 'top-[3px] left-[3px]')} />
        <span
          className={cn(
            BONE,
            'top-[4px] left-[3px] h-[24px] w-[2px] origin-[1px_1px]',
            LIMB_MOTION,
          )}
          style={{ transform: `rotate(${pose.foreL}deg)` }}
        />
      </span>

      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-[26px] right-[-27px] h-[52px] w-[28px] origin-[1px_3px]',
          LIMB_MOTION,
        )}
        style={{ transform: `rotate(${pose.armR}deg)` }}
      >
        <span
          className={cn(
            BONE,
            'top-[2px] left-[1px] h-[2px] w-[22px]',
          )}
        />
        <span className={cn(JOINT, 'top-[3px] left-[22px]')} />
        <span
          className={cn(
            BONE,
            'top-[4px] left-[23px] h-[24px] w-[2px] origin-[1px_1px]',
            LIMB_MOTION,
          )}
          style={{ transform: `rotate(${pose.foreR}deg)` }}
        />
      </span>

      <div
        className="relative z-[1] box-border flex w-[34px] flex-col items-center gap-[10px] rounded-full border border-accent-30 bg-surface-2 py-[14px]"
        onMouseEnter={() => setAwake(true)}
        onMouseLeave={() => setAwake(false)}
      >
        <span
          className="text-accent-small"
          style={{ ...READOUT_TYPE, letterSpacing: '.12em' }}
        >
          {formatCoordinates(lng, lat)}
        </span>
        <span
          aria-hidden="true"
          className="h-[14px] w-px flex-none bg-surface-3"
        />
        <span
          className="text-fg-4 uppercase"
          style={{ ...READOUT_TYPE, letterSpacing: '.22em' }}
        >
          {label}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none relative h-[58px]"
      >
        <span
          className={cn(
            'absolute top-[-2px] left-[8px] h-[58px] w-[4px] origin-[2px_2px]',
            LIMB_MOTION,
          )}
          style={{ transform: `rotate(${pose.legL}deg)` }}
        >
          <span
            className={cn(BONE, 'top-0 left-[1px] h-[28px] w-[2px]')}
          />
          <span className={cn(JOINT, 'top-[26px] left-0')} />
          <span
            className={cn(
              BONE,
              'top-[27px] left-[1px] h-[26px] w-[2px] origin-[1px_1px]',
              LIMB_MOTION,
            )}
            style={{ transform: `rotate(${pose.shinL}deg)` }}
          />
        </span>
        <span
          className={cn(
            'absolute top-[-2px] right-[8px] h-[58px] w-[4px] origin-[2px_2px]',
            LIMB_MOTION,
          )}
          style={{ transform: `rotate(${pose.legR}deg)` }}
        >
          <span
            className={cn(BONE, 'top-0 left-[1px] h-[28px] w-[2px]')}
          />
          <span className={cn(JOINT, 'top-[26px] left-0')} />
          <span
            className={cn(
              BONE,
              'top-[27px] left-[1px] h-[26px] w-[2px] origin-[1px_1px]',
              LIMB_MOTION,
            )}
            style={{ transform: `rotate(${pose.shinR}deg)` }}
          />
        </span>
      </div>
    </div>
  );
};

export default CoordPill;
