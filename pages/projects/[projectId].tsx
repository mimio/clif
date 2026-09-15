import type { ReactNode } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import NextLink from 'next/link';
import projects, { projectsList } from 'constants/projects';
import CaretDownIcon from 'public/icons/caret-down.svg';
import EyeIcon from 'public/icons/eye.svg';
import UserIcon from 'public/icons/user.svg';
import { PROJECTS, PROJECTS_PATH } from 'constants/pages';
import { cn } from 'utils/cn';
import NavLink from 'pagesComponents/projects/NavLink';
import { Body, Detail2, Detail3, Heading2 } from 'components/text';
import GlitchImage from 'components/GlitchImage';
import Button from 'components/Button';
import Page from 'components/Page';

type PairingProps = {
  children: ReactNode;
  className?: string;
  title: string;
};

const Pairing = ({ children, className, title }: PairingProps) => (
  <div className={cn('flex flex-col items-start gap-2', className)}>
    <Detail3>{title}</Detail3>
    {children}
  </div>
);

type ProjectPageProps = {
  projectId: string;
};

const Project = ({ projectId }: ProjectPageProps) => {
  const {
    Icon,
    appDeactivated,
    client,
    employer,
    href,
    id,
    imgSrc,
    nextId,
    prevId,
    roles,
    subtitle,
    title,
    year,
    usersApproximate,
  } = projects[projectId];
  return (
    <Page title={id} key={id}>
      <div className="grid grid-cols-[min-content_auto_max-content] grid-rows-[min-content] items-end gap-14 [grid-template-areas:'heading2_heading2_icon'_'details1_details1_details2'_'image_image_image'_'nav_nav_nav'_'back_back_back'] max-desktop:pt-6 max-tablet:grid-cols-[auto_min-content] max-tablet:gap-y-8 max-tablet:[grid-template-areas:'heading2_icon'_'details1_details1'_'details2_details2'_'image_image'_'nav_nav'_'back_back']">
        <Heading2 className="[grid-area:heading2]">{title}</Heading2>
        <Icon className="h-10 self-end justify-self-start text-surface-3 [grid-area:icon]" />

        <div className="flex flex-col items-start gap-8 self-start [grid-area:details1]">
          <Pairing className="self-stretch" title="DESCRIPTION">
            <Body>{subtitle}</Body>
          </Pairing>
          {usersApproximate && (
            <Pairing title="USER COUNT">
              <Detail2>
                {usersApproximate}
                <UserIcon className="ml-3 inline w-3 text-accent" />
              </Detail2>
            </Pairing>
          )}
        </div>
        <div className="flex flex-col items-start gap-8 self-start [grid-area:details2]">
          <Pairing title="YEAR">
            <Detail2>{year}</Detail2>
          </Pairing>
          <Pairing title={employer ? 'EMPLOYER' : 'CLIENT'}>
            <Detail2>{client}</Detail2>
          </Pairing>
          <Pairing title="ROLE">
            <Detail2>{roles.join(', ')}</Detail2>
          </Pairing>
          {!appDeactivated && (
            <Button
              className="[grid-area:link] max-tablet:max-w-[120px]"
              ariaLabel="View Project"
              href={href}
              Icon={EyeIcon}
            >
              View
            </Button>
          )}
        </div>
        <GlitchImage ga="image" src={imgSrc} alt={title} />
        <div className="mt-12 flex items-center justify-between [grid-area:nav] max-tablet:h-6">
          <NavLink
            reverse
            title={prevId}
            as={`/${PROJECTS}/${prevId}`}
            href={`/${PROJECTS}/[projectId]`}
          />
          <NavLink
            title={nextId}
            as={`/${PROJECTS}/${nextId}`}
            href={`/${PROJECTS}/[projectId]`}
          />
        </div>
        <NextLink
          href={`/${PROJECTS}`}
          className="group flex h-21 flex-col items-center justify-center rounded-lg border-t border-surface-3 px-7 [grid-area:back] transition-hue hover:bg-[#1b1b1b] active:bg-surface-2 max-tablet:h-16 [&_svg]:w-2 [&_svg]:text-fg-5 [&_svg]:transition-size [&:active_svg]:translate-y-2 [&:hover_svg]:translate-y-1 [&:hover_svg]:text-fg-4"
        >
          <Detail3 className="mb-1 text-[12px] group-hover:text-fg-2 group-active:text-fg-2">
            BACK TO ALL PROJECTS
          </Detail3>
          <CaretDownIcon />
        </NextLink>
      </div>
    </Page>
  );
};

export default Project;

export const getStaticProps: GetStaticProps<
  ProjectPageProps,
  { projectId: string }
> = async ({ params }) => {
  if (!params) return { notFound: true };
  return { props: { projectId: params.projectId } };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: projectsList.map(
    (project) => `${PROJECTS_PATH}/${project.id}`,
  ),
  fallback: false,
});
