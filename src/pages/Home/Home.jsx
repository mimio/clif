import React from 'react';
import styled from '@emotion/styled';
import Page from 'components/Page';
import { Subheader } from 'components';
import { tablet, mobile } from 'styles';
import Globe from './Globe';

const IntroBlurb = styled(Subheader)`
  font-size: 36pt;
  line-height: 46pt;
  ${tablet(`
    font-size: 30pt;
    line-height: 40pt;
  `)};
  ${mobile(`
    font-size: 22pt;
    line-height: 34pt;
  `)};
`;

const blurb =
  'my name is Clifton Campbell. I am a web developer with a passion for quality.';

export default () => (
  <Page
    title="HELLO"
    Background={<Globe />}
    Foreground={<IntroBlurb>{blurb}</IntroBlurb>}
  />
);
