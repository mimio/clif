import Link from 'next/link';
import CaretRightIcon from 'public/icons/caret-right.svg';
import { cn } from 'utils/cn';
import { Body2, Detail3 } from 'components/text';

type NavLinkProps = {
  as: string;
  href: string;
  reverse?: boolean;
  title: string;
};

const NavLink = ({
  as,
  title,
  reverse = false,
  href,
}: NavLinkProps) => (
  <Link as={as} href={href}>
    <div
      className={cn(
        'group grid gap-x-8 max-tablet:gap-x-4',
        reverse
          ? "[grid-template-areas:'icon_detail3'_'icon_body2'] [&_svg]:mr-[2px] [&_svg]:-scale-x-100"
          : "[grid-template-areas:'detail3_icon'_'body2_icon']",
      )}
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 [grid-area:icon] transition-hue after:absolute after:top-1/2 after:left-1/2 after:h-0 after:w-0 after:rounded-full after:bg-accent/12 after:transition-size group-hover:after:-mt-[40%] group-hover:after:-ml-[40%] group-hover:after:h-[80%] group-hover:after:w-[80%] group-active:after:-mt-[45%] group-active:after:-ml-[45%] group-active:after:h-[90%] group-active:after:w-[90%] max-tablet:h-12 max-tablet:w-12 [&>svg]:w-2 [&>svg]:text-accent max-tablet:[&>svg]:w-[6px]">
        <CaretRightIcon />
      </div>
      <Detail3
        className={cn(
          'self-end justify-self-end opacity-82 [grid-area:detail3] group-hover:opacity-100',
          reverse && 'justify-self-start',
        )}
      >
        {reverse ? 'PREV' : 'NEXT'}
      </Detail3>
      <Body2 className="opacity-82 [grid-area:body2] group-hover:opacity-100">
        {title}
      </Body2>
    </div>
  </Link>
);

export default NavLink;
