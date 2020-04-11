import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { Detail4, Detail, Detail3 } from 'components';
import { column, getStyle, mq } from 'styles';

const StyledImage = styled.div`
  height: 66%;
  background-image: url(${({ imgSrc }) => imgSrc});
  background-position: center center;
  background-size: cover;
  opacity: 0.8;
`;

const Details = styled.div`
  flex-grow: 1;
  > svg {
    grid-area: icon;
    height: 18px;
    color: ${getStyle('text4')};
    fill: ${getStyle('text4')};
    justify-self: end;
  }
  display: grid;
  grid-template-rows: min-content auto min-content;
  align-items: center;
  grid-template-areas: 'detail4 icon' 'detail detail' 'detail3 detail3';
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
    ${Detail} {
      text-decoration: underline;
    }
    svg {
      color: #5d5d5d;
      fill: #5d5d5d;
    }
  }
`;

const ProjectPreview = ({ imgSrc, index, id, Icon, product }) => (
  <Container to={`/project/${id}`}>
    <Details sp={2}>
      <Icon />
      <Detail4>{index < 10 ? `0${index}` : index}</Detail4>
      <Detail>{id}</Detail>
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
