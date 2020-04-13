import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { PROJECTS } from 'constants/pages';
import { Detail2, Body, Detail3 } from 'components';
import { column, getStyle, mq } from 'styles';

const StyledImage = styled.div`
  flex-grow: 1;
  background-image: url(${({ imgSrc }) => imgSrc});
  background-position: center center;
  background-size: cover;
  opacity: 0.8;
  border-radius: 0 0 20px 20px;
`;

const Details = styled.div`
  height: 160px;
  > svg {
    grid-area: icon;
    height: 18px;
    color: ${getStyle('text1d')};
    fill: ${getStyle('text1d')};
    justify-self: end;
  }
  display: grid;
  grid-template-rows: min-content auto min-content;
  align-items: center;
  grid-template-areas: 'detail2 icon' 'body body' 'detail3 detail3';
  padding: 16px;
  > * {
    transition: ${getStyle('linearHue')};
  }
`;

const Container = styled(Link)`
  ${column};
  position: relative;
  height: 100%;
  border-radius: 20px;
  background: ${getStyle('background2')};
  overflow: hidden;
  ${mq({
    width: ['200px', '180px', '160px'],
  })};
  * {
    user-select: none;
  }
  > * {
    width: 100%;
    transition: ${getStyle('linearHue')};
  }
  &:hover {
    ${StyledImage} {
      opacity: 1;
    }
    ${Body} {
      text-decoration: underline;
    }
    svg {
      color: #5d5d5d;
      fill: #5d5d5d;
    }
  }
  opacity: 0;
  @keyframes slidein {
    from {
      opacity: 0;
      transform: translateY(-16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  animation: 0.3s ease-in forwards slidein;
  ${({ index }) => `
    animation-delay: ${index * 80}ms;
  `};
`;

const ProjectPreview = ({ imgSrc, index, id, Icon, product }) => (
  <Container to={`/${PROJECTS}/${id}`} index={index}>
    <Details sp={2}>
      <Icon />
      <Detail2>{index < 10 ? `0${index}` : index}</Detail2>
      <Body>{id}</Body>
      <Detail3>{product}</Detail3>
    </Details>
    <StyledImage imgSrc={imgSrc} />
  </Container>
);

ProjectPreview.propTypes = {
  id: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default ProjectPreview;
