import React from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'emotion-theming';
import { hot } from 'react-hot-loader/root';
import { HELLO } from 'constants/tabs';

import 'normalize.css';
import '../fonts/fonts.css';

import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import App from './containers/App';

import storeConfigs from './store';

const { store } = storeConfigs;

const root = document.getElementById('root');

const Main = hot(() => (
  <>
    <GlobalStyles />
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <BrowserRouter basename="/">
          <Route exact path="/">
            <Redirect to={`/${HELLO}`} />
          </Route>
          <Route path="/:tab?" component={App} />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </>
));

const load = () => render(<Main />, root);

load();
