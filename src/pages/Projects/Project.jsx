import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { EyeIcon } from 'icons';
import { getStyle, size } from 'styles';
import {
  Link,
  ItemRow,
  ItemColumn,
  Subheader,
  Detail,
} from 'components';

const Image = styled.div`
  height: ${size(55)};
  width: ${size(55)};
  flex-shrink: 0;
  user-select: none;
  user-drag: none;
  z-index: 2;
  background-image: url(${({ imgSrc }) => imgSrc});
  background-position: center center;
  background-size: cover;
  filter: grayscale(100%) brightness(1.15);
  transition: ${getStyle('easeOutSize')};
`;

const TextColumn = styled(ItemColumn)`
  align-items: flex-start;
  justify-content: flex-start;
`;

const StyledLink = styled(Link)`
  opacity: 0.8;
  margin-top: ${size(6)} !important;
`;

const Container = styled(ItemRow)`
  flex-wrap: none;
  align-items: flex-start;
  width: ${size(168)};
  padding: ${size(4)};
  &:hover {
    ${Image} {
      transform: translate(0, -4px);
      filter: grayscale(0%);
    }
    ${StyledLink} {
      opacity: 1;
    }
  }
`;

const Project = ({ title, subtitle, imgSrc, href }) => (
  <Container sp={17}>
    <Image imgSrc={imgSrc} />
    <TextColumn sp={4}>
      <Subheader>{title}</Subheader>
      <Detail>{subtitle}</Detail>
      <StyledLink href={href} Icon={EyeIcon} external tertiary>
        View
      </StyledLink>
    </TextColumn>
  </Container>
);

Project.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default Project;
