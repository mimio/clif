import React from 'react';
import styled from '@emotion/styled';
import { ChildrenPropType } from 'utils/prop-types';
import { getBool, getStyle, size } from 'styles';
import Header from './Header';
import { Full } from './layout';

const BackgroundContainer = styled(Full)`
  z-index: 0;
`;

const HeaderContainer = styled(Full)`
  height: unset;
  ${getBool(
    'hasForeground',
    `
    background-image: ${getStyle('fadeIntoBackground')};
  `,
  )};
`;

const ForegroundContainer = styled(Full)`
  z-index: 3;
  padding-top: ${size(4)};
  padding-left: ${size(28)};
  padding-right: ${size(13)};
`;

const ForegroundContentContainer = styled(Full)`
  overflow-y: auto;
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
