import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { ChildrenPropType } from 'utils/prop-types';
import { getBool, getStyle, size } from 'styles';
import { centered, itemColumn } from 'styles/layout';
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
  ${itemColumn};
  align-items: flex-start;
  z-index: 1;
  padding-top: ${size(52)};
  padding-right: ${size(30)};
  padding-bottom: ${size(20)};
  overflow-y: auto;
  pointer-events: auto;
`;

const ForegroundContainer = styled.div`
  z-index: 3;
  position: absolute;
  top: ${size(4)};
  height: calc(100% - ${size(4)});
  left: ${size(28)};
  width: calc(100% - ${size(28)});
  pointer-events: none;
`;

const BackgroundContainer = styled(Full)`
  z-index: 0;
  ${centered};
`;

const Page = ({
  Background,
  Foreground,
  foregroundProps,
  fadeForeground,
}) => (
  <>
    <ForegroundContainer>
      <HeaderContainer hasForeground={fadeForeground}>
        <Header />
      </HeaderContainer>
      {Foreground && (
        <ForegroundContentContainer {...foregroundProps}>
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
  foregroundProps: PropTypes.object,
  fadeForeground: PropTypes.bool,
};

Page.defaultProps = {
  Background: null,
  Foreground: null,
  foregroundProps: {},
  fadeForeground: false,
};

export default Page;
