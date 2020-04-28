import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import Page from 'components/Page';
import { getStyle, mobile, mq } from 'styles';
import { Column, Subheader, Heading2 } from 'components';
import { WORK, PROJECTS } from 'constants/pages';
import Globe from './Globe';

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
    width: 10px;
    border-radius: 10px;
    background: ${getStyle('ctaBackground2')};
  }
  ${Subheader} {
    font-weight: 200;
    line-height: 50px;
    b {
      font-weight: 300;
    }
    ${mobile(`
      line-height: 30px;
    `)};
  }
`;

export default () => (
  <Page title="HELLO." Background={<Globe />}>
    <Column a="flex-start" m="24px 0 0 0">
      <Heading2>
        My name is Clifton Campbell.
        <br />
        <br />I &#10084;&#65039;
        <b> designing</b>
        {' and '}
        <b>developing</b>
        {' websites.'}
      </Heading2>
      <CallToAction>
        <Subheader>
          Check out my{' '}
          <Link to={`/${PROJECTS}`}>
            <b>projects</b>
          </Link>
          <br />& my work{' '}
          <Link to={`/${WORK}`}>
            <b>history</b>
          </Link>
          .
        </Subheader>
      </CallToAction>
    </Column>
  </Page>
);
