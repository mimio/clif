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
  justify-content: space-between;
  align-items: flex-start;
  background: ${getStyle('background1')};
  padding: ${size(50)} ${size(30)} ${size(20)};
`;

const App = ({
  match: {
    params: { tab },
  },
  selectTab,
  selectedTab,
}) => {
  useEffect(
    () => {
      if (selectedTab !== tab) selectTab(tab);
    },
    [tab],
  );

  return (
    <AppContainer>
      <Information />
      <Navigation />
    </AppContainer>
  );
};

App.propTypes = {
  match: PropTypes.object.isRequired,
  selectTab: PropTypes.func.isRequired,
  selectedTab: TabPropType.isRequired,
};

export default App;
