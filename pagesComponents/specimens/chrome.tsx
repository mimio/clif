import type { ReactNode } from 'react';
import Altimeter from 'components/chrome/Altimeter';
import ContactMouth from 'components/chrome/ContactMouth';
import CoordPill from 'components/chrome/CoordPill';
import ThemeEye from 'components/chrome/ThemeEye';
import type { Specimen } from 'pagesComponents/specimens/types';
import { cn } from 'utils/cn';

/*
 * Lane D's section: the persistent chrome, out of the scene and on a bench.
 *
 * The real ChromeRoot is already pinned over this page by pages/_app.tsx, so
 * placement is verified by just looking at the corners. What is here instead
 * is every piece at a size you can inspect: the rail's four states from
 * artboard 1i, a live rail to click, the rail magnified for the 1px ticks
 * and the dot centring, the eye and the mouth with their panels both shut
 * and open, and the whole stack again at the mobile scales.
 *
 * Captions sit in a fixed-height bar under a fixed-size stage, so the label
 * bar under the body always lines up with the thing it names.
 */
type StageProps = {
  label: string;
  /** Extra classes on the stage box, for the pieces that need more room. */
  className?: string;
  children: ReactNode;
};

const Stage = ({ label, className, children }: StageProps) => (
  <div className="flex flex-col items-center gap-[12px]">
    <div
      className={cn(
        'relative flex h-[180px] w-[220px] items-center justify-center',
        className,
      )}
    >
      {children}
    </div>
    <span
      className="text-center text-fg-4 uppercase"
      style={{
        fontSize: 'var(--type-readout-size)',
        letterSpacing: '.2em',
      }}
    >
      {label}
    </span>
  </div>
);

const Bench = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) => (
  <div className="mb-[40px] flex flex-col gap-[16px]">
    <div className="flex flex-col gap-[4px]">
      <span
        className="text-accent-small uppercase"
        style={{
          fontSize: 'var(--type-readout-size)',
          letterSpacing: '.24em',
        }}
      >
        {title}
      </span>
      {note === undefined ? null : (
        <span
          className="text-fg-4"
          style={{
            fontSize: 'var(--type-detail-size)',
            lineHeight: 'var(--type-detail-line)',
          }}
        >
          {note}
        </span>
      )}
    </div>
    <div className="flex flex-wrap items-start gap-[18px] rounded-[var(--radius-card)] bg-surface p-[24px]">
      {children}
    </div>
  </div>
);

export const chrome: Specimen = {
  id: 'chrome',
  title: 'Chrome',
  note: 'Altimeter, theme eye, contact mouth, coordinate pill.',
  render: () => (
    <div data-specimen="chrome">
      <Bench
        note="The prototype geometry, not the 1i annotation column: 120x120, notches at 20/60/100, a 7x21 rounded bead on 340ms cubic-bezier(.22,1,.36,1). Hover a notch for its label; click the one the bead is on for the jiggle."
        title="Altimeter — states"
      >
        <Stage label="hello">
          <Altimeter active="hello" />
        </Stage>
        <Stage label="projects">
          <Altimeter active="projects" />
        </Stage>
        <Stage label="about">
          <Altimeter active="about" />
        </Stage>
        <Stage label="detail — indicator 0.62">
          <Altimeter active="projects" indicator={0.62} />
        </Stage>
        <Stage label="mid-travel — 45%">
          <Altimeter indicator={0.45} />
        </Stage>
        <Stage label="live — click it">
          <Altimeter active="hello" />
        </Stage>
      </Bench>

      <Bench
        note="Both rails are literally 1px. Every element on the notch line is odd-sized so it straddles a 1px hairline symmetrically: 3px dots, a 7px bead. Magnified 4x here; screenshot the unscaled rails above to check the real raster."
        title="Altimeter — rail detail"
      >
        <Stage className="overflow-hidden" label="rest — 4x">
          <span className="origin-center scale-[4]">
            <Altimeter active="projects" />
          </span>
        </Stage>
        <Stage className="overflow-hidden" label="mid-travel — 4x">
          <span className="origin-center scale-[4]">
            <Altimeter indicator={0.45} />
          </span>
        </Stage>
      </Bench>

      <Bench
        note="A real eyeball whose iris carries the theme, and a mouth from the same family. Each panel row is an 18px miniature of the eye wearing that theme's own iris. Picking a theme leaves the panel open so they can be compared back to back; opening one panel closes the other."
        title="Theme eye and contact mouth"
      >
        <Stage label="eye — shut">
          <ThemeEye />
        </Stage>
        <Stage label="mouth — shut">
          <ContactMouth />
        </Stage>
        <Stage className="w-[420px] justify-end" label="eye — open">
          <ThemeEye defaultOpen />
        </Stage>
        <Stage className="w-[360px] justify-end" label="mouth — open">
          <ContactMouth defaultOpen />
        </Stage>
      </Bench>

      <Bench
        note="Hover the pill: the limbs swing from REST to WAKE on 520ms cubic-bezier(.34,1.56,.64,1). The limbs are pointer-events:none, so only the pill itself is a hit target."
        title="Coordinate pill"
      >
        <Stage className="h-[220px]" label="camera">
          <CoordPill lat={45.512} lng={-122.658} />
        </Stage>
        <Stage className="h-[220px]" label="held — detail route">
          <CoordPill label="held" lat={39.641} lng={-106.355} />
        </Stage>
      </Bench>

      <Bench
        note="What the chrome becomes below 650px: the rail at 78% from its top right, the stack at 86% from its bottom right. CSS only -- there is no device state in this app."
        title="Mobile scale"
      >
        <Stage label="rail — 78%">
          <span className="origin-center scale-[.78]">
            <Altimeter active="projects" />
          </span>
        </Stage>
        <Stage className="h-[280px]" label="stack — 86%">
          <div className="flex origin-center scale-[.86] flex-col items-end gap-[12px]">
            <ThemeEye />
            <ContactMouth />
            <CoordPill lat={45.5} lng={-122.7} />
          </div>
        </Stage>
      </Bench>
    </div>
  ),
};

export default chrome;
