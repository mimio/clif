import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'emotion-theming';
import GlobalStyles from './styles/GlobalStyles';

import 'normalize.css';
import { hot } from 'react-hot-loader/root';
import App from './App';

import storeConfigs from './store';

const { store } = storeConfigs;

const root = document.getElementById('root');

const Main = hot(() => (
  <>
    <GlobalStyles />
    <ThemeProvider theme={{}}>
      <Provider store={store}>
        <BrowserRouter basename="/">
          <Route path="/:tab?/:subTab?" component={App} />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </>
));

const load = () => render(<Main />, root);

load();
