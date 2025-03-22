import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import UserIcon from 'public/icons/user.svg';
import { PROJECTS } from 'constants/pages';
import { Detail2, Body, Detail3 } from 'components/text';
import { column } from 'styles/layout';
import { getStyle } from 'styles/utils';
import { mq } from 'styles/breakpoints';

const StyledImage = styled.div`
  flex-grow: 1;
  background-image: url(${({ imgSrc }) => imgSrc});
  background-position: center center;
  background-size: 100%;
  opacity: 0.8;
  border-radius: 0 0 20px 20px;
`;

const Details = styled.div`
  height: 160px;
  ${Body} {
    font-weight: 300;
  }
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

const UserRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${getStyle('border1')};
  padding: 6px 16px;
  ${Detail3} {
    color: ${getStyle('text3')};
    font-weight: 700;
  }
`;

const StyledUserIcon = styled(UserIcon)`
  color: black;
  width: 12px;
`;

const StyledLink = styled(Link)`
  ${column};
  position: relative;
  height: 100%;
  border-radius: 20px;
  background: ${getStyle('background')};
  transition: ${getStyle('linearHue')};
  border: ${getStyle('contentBorder')};
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
    border: ${getStyle('ctaBorder2')};
    ${StyledImage} {
      opacity: 1;
    }
    ${Body} {
      color: ${getStyle('text2')};
    }
    svg {
      color: #5d5d5d;
      fill: #5d5d5d;
    }
  }
`;

const ProjectPreview = ({
  imgSrcSkinny,
  index,
  id,
  Icon,
  product,
  usersApproximate,
}) => (
  <StyledLink
    as={`/${PROJECTS}/${id}`}
    href={`/${PROJECTS}/[projectId]`}
    passHref
  >
    <Details sp={2}>
      <Icon />
      <Detail2>{index < 10 ? `0${index}` : index}</Detail2>
      <Body>{id}</Body>
      <Detail3>{product}</Detail3>
    </Details>
    {usersApproximate && (
      <UserRow>
        <Detail3>{usersApproximate} users</Detail3>
        <StyledUserIcon />
      </UserRow>
    )}
    <StyledImage imgSrc={imgSrcSkinny} />
  </StyledLink>
);

ProjectPreview.propTypes = {
  id: PropTypes.string.isRequired,
  imgSrcSkinny: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default ProjectPreview;
