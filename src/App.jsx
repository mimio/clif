import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useMediaQuery } from 'react-responsive';
import Map from 'containers/Map';
import SidePanel from './containers/SidePanel';

const DesktopContainer = styled.main`
  display: flex;
  height: 100%;
  width: 100%;
  color: white;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial,
    sans-serif;
`;

const MobileContainer = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Mobile = () => (
  <MobileContainer>
    <SidePanel />
    <Map />
  </MobileContainer>
);

const Desktop = () => (
  <DesktopContainer>
    <SidePanel />
    <Map />
  </DesktopContainer>
);

export default ({ fetchData }) => {
  const isMobile = useMediaQuery({
    query: '(max-device-width: 1224px)',
  });
  console.log(isMobile);
  useEffect(() => {
    fetchData();
  });
  return isMobile ? <Mobile /> : <Desktop />;
};
