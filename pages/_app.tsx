import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import * as analytics from 'utils/analytics';
import { adder, robotoMono } from 'styles/fonts';

import 'styles/globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  const { events } = useRouter();
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
      {/* next/font hands out its variables as class names, so they go on
          an element inside #__next; display: contents keeps #__next the
          pages' containing block. */}
      <div
        className={`${robotoMono.variable} ${adder.variable} contents font-mono`}
      >
        <Component {...pageProps} />
      </div>
    </>
  );
};

export default App;
