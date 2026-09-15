import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from 'utils/cn';
import { Heading } from './text';

export type PageProps = {
  className?: string;
  Background?: ReactNode;
  Subheader?: ReactNode;
  children?: ReactNode;
  title: string;
};

const Page = ({
  className,
  Background = null,
  Subheader = null,
  children = null,
  title,
}: PageProps) => {
  const headerContainer = useRef<HTMLDivElement>(null);
  const foregroundContent = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let request = 0;
    const renderHeaderStyles = () => {
      if (
        foregroundContent.current &&
        header.current &&
        headerContainer.current
      ) {
        const threshold = headerContainer.current.clientHeight;
        const { scrollTop } = foregroundContent.current;
        header.current.style.opacity = String(
          1 - (scrollTop / threshold) * 0.5,
        );
      }
      request = requestAnimationFrame(renderHeaderStyles);
    };
    request = requestAnimationFrame(renderHeaderStyles);
    return () => {
      if (request) cancelAnimationFrame(request);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute left-28 z-3 h-full w-[calc(100%-112px)] animate-slide-in max-desktop:left-4 max-desktop:w-[calc(100%-16px)]">
        <div
          className="absolute top-4 left-0 z-1 flex h-min w-[calc(100%-60px)] flex-col items-start gap-4 *:pointer-events-auto"
          ref={headerContainer}
        >
          <Heading
            className="w-full opacity-100 will-change-[opacity]"
            ref={header}
          >
            {title}
          </Heading>
          {Subheader}
        </div>
        {children && (
          <div
            className={cn(
              'pointer-events-auto absolute inset-0 z-2 overflow-y-auto pt-52 pr-30 max-desktop:pt-44 max-desktop:pr-23 max-tablet:pt-24 max-tablet:pr-13 [&>*:not(:last-child)]:mb-27 max-tablet:[&>*:not(:last-child)]:mb-13',
              className,
            )}
            ref={foregroundContent}
          >
            {children}
          </div>
        )}
      </div>
      {Background && (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {Background}
        </div>
      )}
    </div>
  );
};

export default Page;
