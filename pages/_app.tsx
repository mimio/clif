import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import ChromeRoot from 'components/chrome/ChromeRoot';
import MapProvider from 'scene/MapProvider';
import SceneRoot from 'scene/SceneRoot';
import * as analytics from 'utils/analytics';
import { adder, robotoMono } from 'styles/fonts';

import 'styles/globals.css';

/*
 * Three siblings, in z order:
 *
 *   SceneRoot   z-0   the globe. Mounted once, never unmounted.
 *   Component   z-10  the route's foreground.
 *   ChromeRoot  z-40  the rail, the eye, the mouth, the readout. Also
 *                     mounted once and never unmounted.
 *
 * MapProvider wraps all three so the page can declare a camera and the chrome
 * can read it, without either of them touching the map.
 */
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
        <MapProvider>
          <SceneRoot />
          <Component {...pageProps} />
          <ChromeRoot />
        </MapProvider>
      </div>
    </>
  );
};

export default App;
