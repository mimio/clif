import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { EyeIcon } from 'icons';
import { mobile, getStyle } from 'styles';
import {
  Body,
  Column,
  Detail2,
  Detail3,
  Heading2,
  Link,
  Page,
  Subheader2,
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

const Subcontainer = styled.div`
  display: grid;
  grid-template-areas: 'subheader2 subheader2 subheader2' 'heading2 heading2 icon' 'details description description' 'details link link' 'image image image';
  grid-template-rows: min-content;
  grid-template-columns: 32% auto min-content;
  grid-row-gap: 56px;
  align-items: end;
  > svg {
    align-self: end;
    height: 40px;
    color: ${getStyle('text1e')};
    align-self: start;
  }
  > a {
    grid-area: link;
  }
`;

const Pairing = ({ children, gridArea, title, style }) => (
  <Column a="flex-start" style={{ gridArea }} sp={2} style={style}>
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
  subtitle,
  title,
  year,
}) => (
  <Page title={id} fadeForeground>
    <Subcontainer>
      <Subheader2 style={{alignSelf: 'start'}}>{index}</Subheader2>
      <Heading2>{title}</Heading2>
      <Icon />
      <Details sp={8}>
        <Pairing title="YEAR">
          <Detail2>{year}</Detail2>
        </Pairing>
        <Pairing title="CLIENT">
          <Detail2>{client}</Detail2>
        </Pairing>
        <Pairing title="ROLE">
          <Detail2>hi</Detail2>
        </Pairing>
      </Details>
      <Pairing style={{alignSelf: 'start'}} gridArea="description" title="DESCRIPTION">
        <Body>
          {subtitle}
        </Body>
      </Pairing>
      <Link href={href} Icon={EyeIcon}>View</Link>
      <Image imgSrc={imgSrc} />
    </Subcontainer>
  </Page>
);

Project.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  subtitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default Project;
