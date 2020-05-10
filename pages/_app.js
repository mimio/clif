import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import styled from '@emotion/styled';
import { ThemeProvider } from 'emotion-theming';
import { Cursor, Navigation, Link } from 'components';
import * as analytics from 'utils/analytics';
import email from 'constants/email';
import { EnvelopeIcon } from 'icons';
import AppHooks from 'hooks/AppHooks';
import theme from 'styles/theme';
import { mobile, size } from 'styles';
import GlobalStyles from 'styles/GlobalStyles';
import store from 'modules/store';

import 'normalize.css';
import 'mapbox-gl/dist/mapbox-gl.css';

if (global.window) {
  analytics.init('UA-91745405-6');
}

const StyledNavigation = styled(Navigation)`
  position: fixed;
  top: ${size(4)};
  right: ${size(4)};
  z-index: 4;
`;

const ContactLink = styled(Link)`
  position: fixed;
  bottom: ${size(4)};
  right: ${size(4)};
  z-index: 4;
  border-radius: 5px;
  ${mobile(`
    width: ${size(7)};
  `)};
`;

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
          as="font"
          crossOrigin="anonymous"
          href="/FatFontSlanted.woff2"
          rel="preload"
          type="font/woff2"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto+Mono:200,300,400&display=swap"
          rel="stylesheet"
          type="text/css"
        />
        <link rel="icon" href="/favicon.png" sizes="16x16" />
      </Head>
      <GlobalStyles />
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <AppHooks />
          <Cursor />
          {pathname !== '/404' && (
            <>
              <ContactLink
                ariaLabel="Contact Email"
                href={`mailto:${email}`}
                Icon={EnvelopeIcon}
                vertical
              >
                {email}
              </ContactLink>
              <StyledNavigation />
            </>
          )}
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
