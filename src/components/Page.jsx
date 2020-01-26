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
`;

const ForegroundContentContainer = styled(Full)`
  ${itemColumn};
  align-items: flex-start;
  z-index: 1;
  padding-top: ${size(52)};
  padding-right: ${size(30)};
  padding-bottom: ${size(4)};
  overflow-y: auto;
`;

const ForegroundContainer = styled.div`
  z-index: 3;
  position: absolute;
  top: ${size(4)};
  height: calc(100% - ${size(4)});
  left: ${size(28)};
  width: calc(100% - ${size(28)});
`;

const BackgroundContainer = styled(Full)`
  z-index: 0;
  ${centered};
`;

const Page = ({ Background, Foreground, foregroundProps }) => (
  <>
    <ForegroundContainer>
      <HeaderContainer hasForeground={!!Foreground}>
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
};

Page.defaultProps = {
  Background: null,
  Foreground: null,
  foregroundProps: {},
};

export default Page;
