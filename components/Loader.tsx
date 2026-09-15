import { useEffect, useRef, useState } from 'react';
import { cn } from 'utils/cn';
import { Detail2 } from './text';

let progress = 0;
const Loader = () => {
  const [isDone, setDone] = useState(false);
  const barEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let request = 0;
    const moveLoader = () => {
      progress = Math.min(progress + 0.5 + (progress * 2) / 100, 100);
      if (barEl.current) {
        barEl.current.style.transform = `translateX(-${100 - progress}%)`;
      }
      if (progress === 100) {
        setDone(true);
        cancelAnimationFrame(request);
      }
      if (progress < 100) {
        request = requestAnimationFrame(moveLoader);
      }
    };
    request = requestAnimationFrame(moveLoader);
    return () => {
      if (request) cancelAnimationFrame(request);
    };
  }, []);

  return (
    <div
      className={cn(
        'absolute top-0 left-0 z-10000 flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden bg-surface transition-opacity duration-400 ease-in-out',
        isDone &&
          'pointer-events-none opacity-0 delay-300 *:-translate-y-2 *:opacity-0 *:transition-[translate,opacity] *:delay-150 *:duration-150 *:ease-in-out',
      )}
    >
      <Detail2>
        {isDone ? 'Stuff loaded!' : 'Loading stuff...'}
      </Detail2>
      <div className="relative h-2 w-full max-w-[180px] overflow-hidden rounded-[6px] border border-accent/30">
        <div
          className="absolute top-0 left-0 h-full w-full transform-[translateX(-100%)] rounded-[4px] bg-accent"
          ref={barEl}
        />
      </div>
    </div>
  );
};

export default Loader;
