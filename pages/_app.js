import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'emotion-theming';
import Cursor from 'components/Cursor';
import * as analytics from 'utils/analytics';
import AppHooks from 'hooks/AppHooks';
import theme from 'styles/theme';
import GlobalStyles from 'styles/GlobalStyles';
import store from 'modules/store';

import 'normalize.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../fonts/fonts.css';

if (global.window) {
  analytics.init('UA-91745405-6');
}

const App = ({ Component, pageProps }) => {
  const { pathname } = useRouter();
  useEffect(() => {
    analytics.pageview();
  }, [pathname]);

  return (
    <>
      <Head>
        <title>hello</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta
          name="description"
          content="Clifton Campbell's Web Development Portlfolio"
        />
        <meta
          name="keywords"
          content="Web Development, Mapbox, Software, Clifton Campbell, Websites"
        />
        <meta name="author" content="Clifton Campbell" />
        <meta charset="utf-8" />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto+Mono:100,200,300,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.png" sizes="16x16" />
      </Head>
      <GlobalStyles />
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <AppHooks />
          <Cursor />
          <Component {...pageProps} />
        </Provider>
      </ThemeProvider>
    </>
  );
};

App.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default App;
