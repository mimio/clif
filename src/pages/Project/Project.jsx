import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import styled from '@emotion/styled';
import { CaretRightIcon, EyeIcon } from 'icons';
// import { PROJECTS } from 'constants/pages';
import { mobile, getBool, getStyle } from 'styles';
import {
  Body,
  Body2,
  Centered,
  Column,
  Row,
  Detail2,
  Detail3,
  Heading2,
  Link,
  Page,
} from 'components';

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
`;

const ProjectLink = styled(Link)`
  grid-area: link;
  ${mobile(`
    max-width: 120px;
  `)};
`;

const Subcontainer = styled.div`
  display: grid;
  grid-template-areas: 'heading2 heading2 icon' 'description description details' 'image image image' 'nav nav nav';
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
    grid-template-areas: 'heading2 icon' 'details details' 'description description' 'link link' 'image image' 'nav nav';
    grid-row-gap: 32px;
  `)}
`;

const NavLink = styled(RouterLink)`
  display: grid;
  grid-column-gap: 32px;
  ${Detail3} {
    align-self: end;
    justify-self: end;
  }
  ${Body2}, ${Detail3} {
    opacity: 0.82;
  }
  ${getBool(
    'reverse',
    `
      svg {
        transform: scaleX(-1);
      }
      ${Detail3} {
        justify-self: start;
      }
      grid-template-areas: 'icon detail3' 'icon body2';
    `,
    `
    grid-template-areas: 'detail3 icon' 'body2 icon';
  `,
  )};
  ${Centered} {
    position: relative;
    height: 64px;
    width: 64px;
    border-radius: 50%;
    border: ${getStyle('ctaBorder2')};
    transition: ${getStyle('linearHue')};
    > svg {
      width: 8px;
      color: ${getStyle('text2')};
    }
    ${mobile(`
      height: 36px;
      width: 36px;
    `)};
    ::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      height: 0;
      width: 0;
      margin-left: 0;
      margin-top: 0;
      border-radius: 50%;
      transition: ${getStyle('easeOutSize')};
      background: ${getStyle('ctaBackground3')};
    }
  }
  &:hover {
    ${Body2}, ${Detail3} {
      opacity: 1;
    }
    ${Centered} {
      ::after {
        height: 80%;
        width: 80%;
        margin-left: -40%;
        margin-top: -40%;
      }
    }
  }
  &:active {
    ${Centered} {
      ::after {
        height: 90%;
        width: 90%;
        margin-left: -45%;
        margin-top: -45%;
      }
    }
  }
`;

const Navigation = styled(Row)`
  margin-top: 48px;
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
        <NavLink reverse>
          <Centered ga="icon">
            <CaretRightIcon />
          </Centered>
          <Detail3>PREV</Detail3>
          <Body2>Project</Body2>
        </NavLink>
        <NavLink>
          <Centered ga="icon">
            <CaretRightIcon />
          </Centered>
          <Detail3>NEXT</Detail3>
          <Body2>Project</Body2>
        </NavLink>
      </Navigation>
    </Subcontainer>
  </Page>
);

// <Link internal href={`/${PROJECTS}`} Icon={CaretUpIcon}>all projects</Link>

Project.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  subtitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default Project;
