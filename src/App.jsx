import React, { useEffect } from 'react';
import styled from '@emotion/styled';
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

export default ({ fetchData }) => {
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DesktopContainer>
      <SidePanel />
      <Map />
    </DesktopContainer>
  );
};
