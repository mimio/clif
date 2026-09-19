import Document, {
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';
import { themeBootstrapScript } from 'styles/theme-bootstrap';

export default class AppDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Blocking, and first: the stored theme has to be on the
              documentElement before the first stylesheet resolves, or the
              page paints yellow and then swaps. */}
          <script
            dangerouslySetInnerHTML={{
              __html: themeBootstrapScript,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
