import React from 'react';
import styled from '@emotion/styled';
import { useHistory, useParams } from 'react-router-dom';
import { getStyle, size } from 'styles';
import { Column } from 'components';
import { orderedTabs, HELLO } from 'constants/tabs';
import useSetCursor from './hooks/useSetCursor';
// import Cursor from './containers/Cursor';
import Navigation from './components/Navigation';
import Pages from './pages';

const Container = styled(Column)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  align-items: flex-start;
  background: ${getStyle('background1')};
`;

const StyledNavigation = styled(Navigation)`
  position: absolute;
  top: ${size(4)};
  right: ${size(4)};
  z-index: 4;
`;

const App = () => {
  useSetCursor();
  const { tabId } = useParams();
  if (!orderedTabs.includes(tabId)) {
    useHistory().push(`/${HELLO}`);
    return null;
  }

  return (
    <Container>
      {/* <Cursor /> */}
      <StyledNavigation />
      <Pages />
    </Container>
  );
};

export default App;
