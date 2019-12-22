import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { TabPropType } from 'utils/prop-types';
import { getStyle, size } from 'styles';
import { Column } from 'components';
import Information from './containers/Information';
import Navigation from './containers/Navigation';

const AppContainer = styled(Column)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  align-items: flex-start;
  background: ${getStyle('background1')};
  padding: ${size(30)} ${size(30)} ${size(20)};
`;

const StyledNavigation = styled(Navigation)`
  position: absolute;
  bottom: ${size(20)};
  left: ${size(30)};
`;

const App = ({
  addProgress,
  history,
  match: {
    params: { tab },
  },
  selectedTab,
  selectTab,
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

  useEffect(() => {
    const listener = window.addEventListener(
      'wheel',
      ({ deltaX, deltaY }) =>
        addProgress(
          (Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY) /
            40,
        ),
    );
    return () => {
      window.removeEventListener('wheel', listener);
    };
  }, []);

  return (
    <AppContainer>
      <Information />
      <StyledNavigation />
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
