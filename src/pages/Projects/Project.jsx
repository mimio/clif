import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { EyeIcon } from 'icons';
import { mobile, getBool, getStyle, size } from 'styles';
import { column } from 'styles/layout';
import { Link, Row, ItemColumn, Subheader, Detail } from 'components';

const Image = styled.div`
  height: ${size(55)};
  width: ${size(55)};
  ${mobile(`
    height: ${size(32)};
    width: 100%;
  `)};
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

const Container = styled(Row)`
  ${getBool(
    'reverse',
    `
    flex-direction: row-reverse;
    ${mobile(`
    ${column};
  `)}
    > div:first-of-type {
      margin-left: ${size(17)};
    }
  `,
    `
    > div:first-of-type {
      margin-right: ${size(17)};
    }
  `,
  )}
  ${mobile(`
    ${column};
    > div:first-of-type {
      margin-right: 0;
      margin-left: 0;
      margin-bottom: ${size(5)};
    }
  `)}
  flex-wrap: none;
  align-items: flex-start;
  width: 100%;
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

const Project = ({ title, subtitle, imgSrc, href, index }) => (
  <Container reverse={index % 2 === 0}>
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
  index: PropTypes.number.isRequired,
  subtitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default Project;
