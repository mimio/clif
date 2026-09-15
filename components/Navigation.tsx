import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { cn } from 'utils/cn';
import {
  HELLO,
  WORK,
  PROJECTS,
  orderedTabs,
  type TabId,
} from 'constants/pages';
import HomeIcon from 'public/icons/home.svg';
import { textClass } from './text';

const copy: Record<TabId, ReactNode> = {
  [HELLO]: <HomeIcon className="h-5 w-5" />,
  [PROJECTS]: 'Projects',
  [WORK]: 'History',
};

// The text tabs sit on an accent bar that fills behind the current one and
// peeks out on hover; the home tab is an icon and fades instead. Physical
// pt/pb rather than py: py-* sets padding-block, which runs horizontally
// once the writing mode is vertical.
const tabClass = (isHome: boolean, isActive: boolean): string =>
  cn(
    'relative z-1 flex w-6 items-center justify-center pt-2 pb-2 [writing-mode:vertical-lr] [&_svg]:text-fg',
    textClass.detail,
    'font-light',
    isHome
      ? 'hover:opacity-90 active:opacity-80'
      : 'after:absolute after:top-0 after:left-0 after:-z-1 after:h-full after:w-0 after:bg-accent after:transition-size',
    isActive
      ? 'text-on-accent after:w-full [&_svg]:text-accent'
      : !isHome && 'hover:after:w-[20%] active:after:w-[12%]',
  );

type NavigationProps = {
  className?: string;
};

const Navigation = ({ className = '' }: NavigationProps) => {
  const { pathname } = useRouter();
  return (
    <nav className={className} aria-label="Main">
      <ul className="flex flex-col items-center gap-4">
        {orderedTabs.map(({ id, path }) => {
          const isTabActive =
            path === '/'
              ? pathname === path
              : pathname.includes(path);
          return (
            <li key={id}>
              <Link
                href={path}
                aria-label={id === HELLO ? 'Home' : undefined}
                aria-current={isTabActive ? 'page' : undefined}
                className={tabClass(id === HELLO, isTabActive)}
              >
                {copy[id]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
