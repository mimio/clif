import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { Column, Body, Heading3 } from 'components';
import Page from 'components/Page';
import { getStyle, mobile, mq } from 'styles';
import { WORK, PROJECTS } from 'constants/pages';
import { Globe } from 'pagesComponents/home';
import { feature } from 'topojson';

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

export default ({ countries }) => (
  <Page
    reveal
    title="HELLO."
    Background={<Globe countries={countries} />}
  >
    <Column a="flex-start" m="24px 0 0 0">
      <Heading3>
        My name is Clifton Campbell.
        <br />
        <br />I &#10084;&#65039;
        <b> designing</b>
        {' and '}
        <b>developing</b>
        {' websites.'}
      </Heading3>
      <CallToAction>
        <Body>
          Check out my{' '}
          <Link href={`/${PROJECTS}`} passHref>
            <a>
              <b>projects</b>
            </a>
          </Link>
          <br />& my work{' '}
          <Link href={`/${WORK}`} passHref>
            <a>
              <b>history</b>
            </a>
          </Link>
          .
        </Body>
      </CallToAction>
    </Column>
  </Page>
);

export async function getStaticProps() {
  const lands = require('public/ne110m_land.json');
  const countries = feature(lands, lands.objects.land);

  return { props: { countries } };
}
