import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import Navigation from 'components/Navigation';
import Button from 'components/Button';
import * as analytics from 'utils/analytics';
import email from 'constants/email';
import EnvelopeIcon from 'public/icons/envelope.svg';
import AppHooks from 'hooks/AppHooks';
import { adder, robotoMono } from 'styles/fonts';
import { makeStore, type AppStore } from 'modules/store';

import 'styles/globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  // One store per render tree rather than a module singleton, so a server
  // render can never leak one request's state into the next.
  const [store] = useState<AppStore>(makeStore);
  const { events, pathname } = useRouter();
  useEffect(() => {
    events.on('routeChangeComplete', analytics.pageview);
    return () =>
      events.off('routeChangeComplete', analytics.pageview);
  }, [events]);

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
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.png" sizes="16x16" />
      </Head>
      {analytics.MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${analytics.MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${analytics.MEASUREMENT_ID}');`}
          </Script>
        </>
      )}
      <Provider store={store}>
        <AppHooks />
        {/* next/font hands out its variables as class names, so they go on
            an element inside #__next; display: contents keeps #__next the
            pages' containing block. */}
        <div
          className={`${robotoMono.variable} ${adder.variable} contents font-mono`}
        >
          {pathname !== '/404' && (
            <>
              <Button
                className="fixed right-4 bottom-4 z-4 rounded-[5px] max-tablet:w-7"
                ariaLabel="Contact Email"
                href={`mailto:${email}`}
                Icon={EnvelopeIcon}
                vertical
              >
                {email}
              </Button>
              <Navigation className="fixed top-8 right-4 z-4" />
            </>
          )}
          <Component {...pageProps} />
        </div>
      </Provider>
    </>
  );
};

export default App;
