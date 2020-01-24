import React from 'react';
import styled from '@emotion/styled';
import { getStyle, size } from 'styles';
import { Column } from 'components';
import useSetCursor from './hooks/useSetCursor';
// import Cursor from './containers/Cursor';
import Navigation from './components/Navigation';

const AppContainer = styled(Column)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  align-items: flex-start;
  background: ${getStyle('background1')};
`;

// const StyledInformation = styled(Information)`
//   z-index: 3;
// `;

const StyledNavigation = styled(Navigation)`
  position: absolute;
  top: ${size(4)};
  right: ${size(4)};
  z-index: 3;
`;

// const StyledPolygon = styled(Polygon)`
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   height: 100%;
//   width: 100%;
//   z-index: 0;
// `;

// const StyledShuffleButton = styled(ShufflePolygonButton)`
//   position: absolute;
//   top: ${size(40)};
//   right: ${size(30)};
//   z-index: 10;
// `;

const App = () => {
  useSetCursor();
  return (
    <AppContainer>
      {/* <Cursor /> */}
      <StyledNavigation />
    </AppContainer>
  );
};

export default App;
