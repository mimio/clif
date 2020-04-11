import React from 'react';
import { render } from 'react-dom';
import {
  BrowserRouter,
  Redirect,
  Switch,
  Route,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'emotion-theming';
import { hot } from 'react-hot-loader/root';
import { HELLO, LOST } from 'constants/pages';
import Lost from 'components/Lost';

import 'normalize.css';
import '../fonts/fonts.css';

import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import App from './App';

import storeConfigs from './store';

const { store } = storeConfigs;

const root = document.getElementById('root');

const Main = hot(() => (
  <>
    <GlobalStyles />
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <BrowserRouter basename="/">
          <Switch>
            <Route
              exact
              path="/"
              component={() => <Redirect to={`/${HELLO}`} />}
            />
            <Route exact path={`/${LOST}`} component={Lost} />
            <Route path="/:tabId?" component={App} />
          </Switch>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </>
));

const load = () => render(<Main />, root);

load();
