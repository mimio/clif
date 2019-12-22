import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
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
  match: {
    params: { tab },
  },
  selectTab,
}) => {
  useEffect(
    () => {
      selectTab(tab);
    },
    [tab],
  );

  useEffect(() => {
    const listener = window.addEventListener(
      'wheel',
      ({ deltaX, deltaY }) =>
        addProgress(
          (Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY) /
            20,
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
  match: PropTypes.object.isRequired,
  selectTab: PropTypes.func.isRequired,
};

export default App;
