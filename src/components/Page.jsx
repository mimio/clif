import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { ChildrenPropType } from 'utils/prop-types';
import { mobile, tablet, getBool, getStyle, size } from 'styles';
import { centered } from 'styles/layout';
import Header from './Header';
import { Full } from './layout';

const HeaderContainer = styled(Full)`
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
  padding-top: ${size(52)};
  padding-right: ${size(30)};
  padding-bottom: ${size(20)};
  > *:not(:last-child) {
    margin-bottom: ${size(27)};
  }
  ${tablet(`
    padding-top: ${size(44)};
    padding-right: ${size(23)};
    padding-bottom: ${size(20)};
  `)}
  ${mobile(`
    padding-top: ${size(24)};
    padding-right: ${size(13)};
    padding-bottom: ${size(10)};
    > *:not(:last-child) {
      margin-bottom: ${size(13)};
    }
  `)}
`;

const ForegroundContainer = styled.div`
  z-index: 3;
  position: absolute;
  top: ${size(4)};
  height: calc(100% - ${size(4)});
  left: ${size(28)};
  width: calc(100% - ${size(28)});
  pointer-events: none;
  ${tablet(`
    left: ${size(4)};
    width: calc(100% - ${size(4)});
  `)}
`;

const BackgroundContainer = styled(Full)`
  z-index: 0;
  ${centered};
`;

const Page = ({ Background, Foreground, fadeForeground }) => (
  <>
    <ForegroundContainer>
      <HeaderContainer hasForeground={fadeForeground}>
        <Header />
      </HeaderContainer>
      {Foreground && (
        <ForegroundContentContainer>
          <Foreground />
        </ForegroundContentContainer>
      )}
    </ForegroundContainer>
    {Background && (
      <BackgroundContainer>
        <Background />
      </BackgroundContainer>
    )}
  </>
);

Page.propTypes = {
  Background: ChildrenPropType,
  Foreground: ChildrenPropType,
  fadeForeground: PropTypes.bool,
};

Page.defaultProps = {
  Background: null,
  Foreground: null,
  fadeForeground: false,
};

export default Page;
