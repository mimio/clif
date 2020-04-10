import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { ChildrenPropType } from 'utils/prop-types';
import { mobile, tablet, getBool, getStyle, size, mq } from 'styles';
import {
  centered,
  full,
  foregroundContentVerticalPadding,
} from 'styles/layout';
import Header from './Header';
import { Full, Column } from './layout';

const HeaderContainer = styled(Column)`
  ${full};
  align-items: flex-start;
  height: min-content;
  width: calc(100% - ${size(15)});
  z-index: 2;
  ${getBool(
    'hasForeground',
    `
    background-image: ${getStyle('fadeIntoBackground')};
  `,
  )};
  > * {
    pointer-events: auto;
  }
`;

const ForegroundContentContainer = styled(Full)`
  align-items: flex-start;
  z-index: 1;
  overflow-y: auto;
  pointer-events: auto;
  ${foregroundContentVerticalPadding};
  ${mq({
    paddingRight: [
      getStyle('foregroundContentRightPadding'),
      getStyle('foregroundContentRightPaddingTablet'),
      getStyle('foregroundContentRightPaddingMobile'),
    ],
  })};
  > *:not(:last-child) {
    margin-bottom: ${size(27)};
  }
  ${mobile(`
    > *:not(:last-child) {
      margin-bottom: ${size(13)};
    }
  `)}
`;

const pageSlideIn = `
  @keyframes slidein {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  animation: 0.3s ease-in forwards slidein;
`;

const ForegroundContainer = styled.div`
  z-index: 3;
  position: absolute;
  top: ${getStyle('pageMinimumPadding')};
  height: calc(100% - ${getStyle('pageMinimumPadding')});
  left: ${getStyle('foregroundLeftPadding')};
  width: calc(100% - ${size(28)});
  pointer-events: none;
  ${pageSlideIn};
  ${tablet(`
    left: ${getStyle('foregroundLeftPaddingTablet')};
    width: calc(100% - ${getStyle('pageMinimumPadding')});
  `)}
`;

const BackgroundContainer = styled(Full)`
  z-index: 0;
  ${centered};
`;

const Page = ({
  Background,
  Foreground,
  Subheader,
  backgroundCss,
  fadeForeground,
  onScroll,
}) => (
  <>
    <ForegroundContainer>
      <HeaderContainer hasForeground={fadeForeground} sp={4}>
        <Header />
        {Subheader}
      </HeaderContainer>
      {Foreground && (
        <ForegroundContentContainer onScroll={onScroll}>
          {Foreground}
        </ForegroundContentContainer>
      )}
    </ForegroundContainer>
    {Background && (
      <BackgroundContainer css={backgroundCss}>
        {Background}
      </BackgroundContainer>
    )}
  </>
);

Page.propTypes = {
  Background: ChildrenPropType,
  Foreground: ChildrenPropType,
  Subheader: ChildrenPropType,
  backgroundCss: PropTypes.string,
  fadeForeground: PropTypes.bool,
  onScroll: PropTypes.func,
};

Page.defaultProps = {
  Background: null,
  Foreground: null,
  Subheader: null,
  backgroundCss: null,
  fadeForeground: false,
  onScroll() {},
};

export default Page;
