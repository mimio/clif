import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import styled from '@emotion/styled';
import { ThemeProvider } from 'emotion-theming';
import Cursor from 'components/Cursor';
import Navigation from 'components/Navigation';
import Link from 'components/CTA/Link';
import * as analytics from 'utils/analytics';
import email from 'constants/email';
import EnvelopeIcon from 'public/icons/envelope.svg';
import AppHooks from 'hooks/AppHooks';
import theme from 'styles/theme';
import { mobile } from 'styles/breakpoints';
import { size } from 'styles/size';
import GlobalStyles from 'styles/GlobalStyles';
import configureStore from 'modules/store';

import 'normalize.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const store = configureStore();

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
          content="Clifton Campbell's Web Development Portfolio"
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
          href="/adder-superextended.woff2"
          rel="preload"
          type="font/woff2"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com/"
          crossOrigin="true"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/robotomono/v7/L0xkDF4xlVMF-BfR8bXMIjDgiWqxf7-pAVU_.woff2"
          as="font"
          crossOrigin="true"
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
