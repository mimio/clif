import React from 'react';
import styled from '@emotion/styled';
import { ChildrenPropType } from 'utils/prop-types';
import { getBool, getStyle, size } from 'styles';
import { centered } from 'styles/layout';
import Header from './Header';
import { Full } from './layout';

const HeaderContainer = styled(Full)`
  height: min-content;
  ${getBool(
    'hasForeground',
    `
    background-image: ${getStyle('fadeIntoBackground')};
  `,
  )};
`;

const ForegroundContentContainer = styled(Full)`
  overflow-y: auto;
`;

const ForegroundContainer = styled.div`
  z-index: 3;
  position: absolute;
  top: ${size(4)};
  height: calc(100% - ${size(4)});
  left: ${size(28)};
  width: calc(100% - ${size(28 + 13)});
`;

const BackgroundContainer = styled(Full)`
  z-index: 0;
  ${centered};
`;

const Page = ({ Background, Foreground }) => (
  <>
    <ForegroundContainer>
      <HeaderContainer hasForeground={!!Foreground}>
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
};

Page.defaultProps = {
  Background: null,
  Foreground: null,
};

export default Page;
