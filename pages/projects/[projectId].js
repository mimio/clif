import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import NextLink from 'next/link';
import projects, { projectsList } from 'constants/projects';
import CaretDownIcon from 'public/icons/caret-down.svg';
import EyeIcon from 'public/icons/eye.svg';
import UserIcon from 'public/icons/user.svg';
import { PROJECTS, PROJECTS_PATH } from 'constants/pages';
import { getStyle } from 'styles/utils';
import { mobile, tablet } from 'styles/breakpoints';
import { column } from 'styles/layout';
import NavLink from 'pagesComponents/projects/NavLink';
import { Body, Detail2, Detail3, Heading2 } from 'components/text';
import GlitchImage from 'components/GlitchImage';
import { Column, Row } from 'components/layout';
import Button from 'components/Button';
import Page from 'components/Page';

const StyledUserIcon = styled(UserIcon)`
  color: ${getStyle('border1')};
  margin-left: 12px;
  width: 12px;
`;

const DetailsColOne = styled(Column)`
  grid-area: details1;
  align-self: start;
  align-items: flex-start;
`;

const DetailsColTwo = styled(Column)`
  grid-area: details2;
  align-self: start;
  align-items: flex-start;
`;

const ProjectLink = styled(Button)`
  grid-area: link;
  ${mobile(`
    max-width: 120px;
  `)};
`;

const Subcontainer = styled.div`
  display: grid;
  grid-template-areas: 'heading2 heading2 icon' 'details1 details1 details2' 'image image image' 'nav nav nav' 'back back back';
  grid-template-rows: min-content;
  grid-template-columns: min-content auto max-content;
  grid-row-gap: 56px;
  grid-column-gap: 56px;
  align-items: end;
  > svg {
    justify-self: start;
    align-self: end;
    height: 40px;
    color: ${getStyle('text1e')};
  }
  ${tablet(`
    padding-top: 24px;
  `)}
  ${mobile(`
    grid-template-columns: auto min-content;
    grid-template-areas: 'heading2 icon' 'details1 details1' 'details2 details2' 'image image' 'nav nav' 'back back';
    grid-row-gap: 32px;
  `)}
`;

const Navigation = styled(Row)`
  margin-top: 48px;
  ${mobile(`
    height: 24px;
  `)};
`;

const BackNavLink = styled(NextLink)`
  ${column};
  border-top: ${getStyle('ctaBorder3')};
  grid-area: back;
  padding: 0 28px;
  height: 84px;
  justify-content: center;
  border-radius: 8px;
  transition: ${getStyle('linearHue')};
  ${Detail3} {
    font-size: 12px;
    margin-bottom: 4px;
  }
  svg {
    width: 8px;
    color: ${getStyle('text1d')};
    transition: ${getStyle('easeOutSize')};
  }
  &:hover {
    background: #1b1b1b;
    ${Detail3} {
      color: ${getStyle('text1b')};
    }
    svg {
      color: ${getStyle('text1c')};
      transform: translateY(4px);
    }
  }
  &:active {
    background: #202020;
    ${Detail3} {
      color: ${getStyle('text1b')};
    }
    svg {
      transform: translateY(8px);
    }
  }
  ${mobile(`
    height: 64px;
  `)};
`;

const Pairing = ({ children, title, ...props }) => (
  <Column a="flex-start" {...props} sp={2}>
    <Detail3>{title}</Detail3>
    {children}
  </Column>
);

const Project = ({ projectId }) => {
  const {
    Icon,
    appDeactivated,
    client,
    employer,
    href,
    id,
    imgSrc,
    index,
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
      <Subcontainer>
        <Heading2>
          {title}
          <Detail2 style={{ marginLeft: '8px' }}>{index}</Detail2>
        </Heading2>
        <Icon />

        <DetailsColOne sp={8}>
          <Pairing as="start" title="DESCRIPTION">
            <Body>{subtitle}</Body>
          </Pairing>
          {usersApproximate && (
            <Pairing title="USER COUNT">
              <Detail2>
                {usersApproximate}
                <StyledUserIcon />
              </Detail2>
            </Pairing>
          )}
        </DetailsColOne>
        <DetailsColTwo sp={8}>
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
            <ProjectLink
              ariaLabel="View Project"
              href={href}
              Icon={EyeIcon}
            >
              View
            </ProjectLink>
          )}
        </DetailsColTwo>
        <GlitchImage ga="image" src={imgSrc} />
        <Navigation ga="nav" j="space-between">
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
        </Navigation>
        <BackNavLink href={`/${PROJECTS}`} passHref sp={1}>
          <Detail3>BACK TO ALL PROJECTS</Detail3>
          <CaretDownIcon />
        </BackNavLink>
      </Subcontainer>
    </Page>
  );
};

Project.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default Project;

export function getStaticProps({ params: { projectId } }) {
  return { props: { projectId } };
}

export function getStaticPaths() {
  const paths = projectsList.map(
    (project) => `${PROJECTS_PATH}/${project.id}`,
  );
  return { paths, fallback: false };
}
