import type { GetStaticProps } from 'next';
import styled from '@emotion/styled';
import Link from 'next/link';
import { feature } from 'topojson-client';
import type {
  Topology,
  GeometryCollection,
} from 'topojson-specification';
import type { FeatureCollection } from 'geojson';
import land from 'public/ne110m_land.json';
import { Column } from 'components/layout';
import { Body, Heading3 } from 'components/text';
import Page from 'components/Page';
import { getStyle } from 'styles/utils';
import { mobile, mq } from 'styles/breakpoints';
import { WORK, PROJECTS } from 'constants/pages';
import Globe from 'pagesComponents/home/Globe';

const CallToAction = styled.div`
  position: relative;
  padding: 8px 0 8px 36px;
  ${mq({
    marginTop: ['120px', '96px', '62px'],
  })}
  ::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 6px;
    border-radius: 3px;
    background: ${getStyle('ctaBackground4')};
  }
  ${Body} {
    font-weight: 300;
    line-height: 40px;
    b {
      font-weight: 400;
    }
    ${mobile(`
      line-height: 30px;
    `)};
  }
`;

type HomeProps = {
  countries: FeatureCollection;
};

const Home = ({ countries }: HomeProps) => (
  <Page title="hello." Background={<Globe countries={countries} />}>
    <Column a="flex-start" m="24px 0 0 0">
      <Heading3>
        My name is Clifton Campbell.
        <br />
        <br />I &#10084;&#65039;
        <b> designing</b>
        {' and '}
        <b>developing</b>
        {' software.'}
      </Heading3>
      <CallToAction>
        <Body>
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
      </CallToAction>
    </Column>
  </Page>
);

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const topology = land as unknown as Topology;
  const countries = feature(
    topology,
    topology.objects.land as GeometryCollection,
  );
  return { props: { countries } };
};
