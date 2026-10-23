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
 * PAGE METADATA, and why it lives beside the app shell.
 *
 * Every route used to inherit _app's `<title>hello</title>`, because no
 * route ever overrode it: fourteen project pages, the index, about and the
 * 404 all shipped the same title and the same description, and a shared
 * /projects/gopro link was indistinguishable from the home page. There were
 * no og:, no twitter: and no canonical tags at all.
 *
 * Two things were broken by that, not one:
 *
 *   THE UNFURL.  A link to a project is the most shared URL this site has
 *                and the only one with a real image behind it.
 *   THE ROUTE ANNOUNCER.  next/dist/client/route-announcer reads
 *                document.title and only falls back to the <h1> when there
 *                is no title at all. One constant title means the live
 *                region is set to the same string on every navigation,
 *                React bails out of the update and a screen reader hears
 *                nothing after the first route change -- on a site whose
 *                map never unmounts and which therefore never reloads a
 *                page. That is WCAG 2.4.2 on every route but `/`.
 *
 * So the override is a component rather than a convention: each page states
 * its own words once, and everything derived from them -- the og and
 * twitter pairs, the canonical, the suffix -- is derived here rather than
 * copy-pasted into five `<Head>` blocks. _app keeps the defaults it always
 * had, which are now only ever the fallback.
 *
 * next/head keeps the LAST of two tags that collide (it reverses, uniques
 * by name, and reverses back), and _app's Head mounts before the page's, so
 * a page's title and description win without either side needing a key.
 */

/** The name the suffix and og:site_name carry. */
export const SITE_NAME = 'Clifton Campbell';

/*
 * The canonical origin. Vercel's production domain is not in the repo, so
 * it arrives as NEXT_PUBLIC_SITE_URL at build time; with nothing set the
 * URLs below stay root-relative, which a canonical link and a scraper both
 * resolve against the document they were served with. Wrong on no
 * deployment beats absolute and wrong on all but one.
 */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ?? ''
).replace(/\/+$/, '');

export const siteUrl = (path: string): string =>
  `${SITE_ORIGIN}${path}`;

/** 'projects · Clifton Campbell'. The page's own words come first. */
export const pageTitle = (title: string): string =>
  `${title} · ${SITE_NAME}`;

/** The unfurl budget is about 160 characters; prose is cut to fit it. */
export const META_DESCRIPTION_MAX = 160;

/**
 * A description attribute is one line, and the prose it is made from is
 * not: content/projects.ts keeps paragraphs, so they are flattened before
 * they are measured.
 */
export const metaDescription = (text: string): string => {
  const line = text.replace(/\s+/g, ' ').trim();
  return line.length <= META_DESCRIPTION_MAX
    ? line
    : `${line.slice(0, META_DESCRIPTION_MAX - 1).trimEnd()}…`;
};

export type PageMetaImage = {
  /** A path under public/, e.g. a project's own screenshot. */
  src: string;
  alt: string;
};

export type PageMetaProps = {
  /** The page's own words, in the site's voice: page words are lowercase. */
  title: string;
  description: string;
  /**
   * The canonical path, without a query. /about?stop=nike is a view of
   * /about rather than a second document, so it canonicalises to /about.
   */
  path: string;
  /** Only where the route has a real image; there is no stock card. */
  image?: PageMetaImage;
  /** The 404 is a real page, but not one to index. */
  noindex?: boolean;
};

export const PageMeta = ({
  title,
  description,
  path,
  image,
  noindex = false,
}: PageMetaProps) => {
  const full = pageTitle(title);
  const url = siteUrl(path);

  return (
    <Head>
      <title>{full}</title>
      <meta content={description} name="description" />
      <link href={url} rel="canonical" />
      {noindex ? <meta content="noindex" name="robots" /> : null}
      <meta content={SITE_NAME} property="og:site_name" />
      <meta content="website" property="og:type" />
      <meta content={full} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={url} property="og:url" />
      {image === undefined ? null : (
        <>
          <meta content={siteUrl(image.src)} property="og:image" />
          <meta content={image.alt} property="og:image:alt" />
        </>
      )}
      {/* A large card needs an image to be large with. */}
      <meta
        content={
          image === undefined ? 'summary' : 'summary_large_image'
        }
        name="twitter:card"
      />
      <meta content={full} name="twitter:title" />
      <meta content={description} name="twitter:description" />
    </Head>
  );
};

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
        {/* Defaults only: every route states its own through PageMeta. */}
        <title>{SITE_NAME}</title>
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
