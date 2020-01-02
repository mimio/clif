import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { TabPropType } from 'utils/prop-types';
import { getStyle, size } from 'styles';
import { Column } from 'components';
import useSetCursor from './hooks/useSetCursor';
import Information from './containers/Information';
import Navigation from './containers/Navigation';
import Polygon from './containers/Polygon';
import ShufflePolygonButton from './containers/ShufflePolygonButton';
import Cursor from './containers/Cursor';

const AppContainer = styled(Column)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  align-items: flex-start;
  background: ${getStyle('background1')};
  padding: ${size(30)} ${size(30)} ${size(20)};
`;

const StyledInformation = styled(Information)`
  z-index: 3;
`;

const StyledNavigation = styled(Navigation)`
  position: absolute;
  bottom: ${size(20)};
  left: ${size(30)};
  z-index: 3;
`;

const StyledPolygon = styled(Polygon)`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 0;
`;

const StyledShuffleButton = styled(ShufflePolygonButton)`
  position: absolute;
  top: ${size(40)};
  right: ${size(30)};
  z-index: 10;
`;

const App = ({
  addProgress,
  history,
  match: {
    params: { tab },
  },
  selectTab,
  selectedTab,
  shufflePolygon,
}) => {
  useEffect(
    () => {
      selectTab(tab);
    },
    [tab],
  );

  useEffect(
    () => {
      if (selectedTab) history.push(`/${selectedTab}`);
    },
    [selectedTab],
  );

  useSetCursor();

  useEffect(() => {
    shufflePolygon();
    const wheelListener = window.addEventListener(
      'wheel',
      ({ deltaX, deltaY }) =>
        addProgress(
          (Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY) /
            40,
        ),
    );
    return () => {
      window.removeEventListener('wheel', wheelListener);
    };
  }, []);

  return (
    <AppContainer>
      <StyledPolygon />
      <StyledInformation />
      <StyledShuffleButton />
      <StyledNavigation />
      <Cursor />
    </AppContainer>
  );
};

App.propTypes = {
  addProgress: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  selectTab: PropTypes.func.isRequired,
  selectedTab: TabPropType,
};

App.defaultProps = {
  selectedTab: null,
};

export default App;
