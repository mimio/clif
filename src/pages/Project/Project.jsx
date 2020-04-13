import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import styled from '@emotion/styled';
import { ChildrenPropType } from 'utils/prop-types';
import { CaretDownIcon, EyeIcon } from 'icons';
import { PROJECTS } from 'constants/pages';
import { mobile, getStyle, column } from 'styles';
import {
  Body,
  Column,
  Row,
  Detail2,
  Detail3,
  Heading2,
  Link,
  Page,
} from 'components';
import NavLink from './NavLink';

const Details = styled(Column)`
  grid-area: details;
  align-self: start;
  align-items: flex-start;
`;

const Image = styled.div`
  grid-area: image;
  height: 360px;
  width: 100%;
  border-radius: 20px;
  background-image: url(${({ imgSrc }) => imgSrc});
  background-position: center center;
  background-size: cover;
  ${mobile(`
    height: 200px;
  `)};
`;

const ProjectLink = styled(Link)`
  grid-area: link;
  ${mobile(`
    max-width: 120px;
  `)};
`;

const Subcontainer = styled.div`
  display: grid;
  grid-template-areas: 'heading2 heading2 icon' 'description description details' 'image image image' 'nav nav nav' 'back back back';
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
  ${mobile(`
    grid-template-columns: auto min-content;
    grid-template-areas: 'heading2 icon' 'details details' 'description description' 'image image' 'nav nav' 'back back';
    grid-row-gap: 32px;
  `)}
`;

const Navigation = styled(Row)`
  margin-top: 48px;
  ${mobile(`
    height: 24px;
  `)};
`;

const BackNavLink = styled(RouterLink)`
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

const Project = ({
  Icon,
  client,
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
}) => (
  <Page title={id}>
    <Subcontainer>
      <Heading2>
        {title}
        <Detail2 style={{ marginLeft: '8px' }}>{index}</Detail2>
      </Heading2>
      <Icon />
      <Details sp={8}>
        <Pairing title="YEAR">
          <Detail2>{year}</Detail2>
        </Pairing>
        <Pairing title="CLIENT">
          <Detail2>{client}</Detail2>
        </Pairing>
        <Pairing title="ROLE">
          <Detail2>{roles.join(', ')}</Detail2>
        </Pairing>
        <ProjectLink href={href} Icon={EyeIcon}>
          View
        </ProjectLink>
      </Details>
      <Pairing as="start" ga="description" title="DESCRIPTION">
        <Body>{subtitle}</Body>
      </Pairing>
      <Image imgSrc={imgSrc} />
      <Navigation ga="nav" j="space-between">
        <NavLink
          reverse
          title={prevId}
          to={`/${PROJECTS}/${prevId}`}
        />
        <NavLink title={nextId} to={`/${PROJECTS}/${nextId}`} />
      </Navigation>
      <BackNavLink sp={1} to={`/${PROJECTS}`}>
        <Detail3>BACK TO ALL PROJECTS</Detail3>
        <CaretDownIcon />
      </BackNavLink>
    </Subcontainer>
  </Page>
);

Project.propTypes = {
  Icon: ChildrenPropType.isRequired,
  client: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  nextId: PropTypes.string.isRequired,
  prevId: PropTypes.string.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  subtitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
};

export default Project;
