import Link from 'next/link';
import { Body, Heading3 } from 'components/text';
import Page from 'components/Page';
import { WORK, PROJECTS } from 'constants/pages';
import Globe from 'pagesComponents/home/Globe';

const Home = () => (
  <Page title="hello." Background={<Globe />}>
    <div className="mt-6 flex flex-col items-start">
      <Heading3>
        My name is Clifton Campbell.
        <br />
        <br />I &#10084;&#65039;
        <b> designing</b>
        {' and '}
        <b>developing</b>
        {' software.'}
      </Heading3>
      <div className="relative mt-[120px] py-2 pl-9 after:absolute after:top-0 after:left-0 after:h-full after:w-[6px] after:rounded-[3px] after:bg-accent/60 max-desktop:mt-24 max-tablet:mt-[62px]">
        <Body className="leading-[40px] font-light max-tablet:leading-[30px] [&_b]:font-normal">
          Check out my{' '}
          <Link href={`/${PROJECTS}`}>
            <b>projects</b>
          </Link>
          <br />& my work{' '}
          <Link href={`/${WORK}`}>
            <b>history</b>
          </Link>
          .
        </Body>
      </div>
    </div>
  </Page>
);

export default Home;
