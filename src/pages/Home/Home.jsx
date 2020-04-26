import React from 'react';
import styled from '@emotion/styled';
import Page from 'components/Page';
import { Heading2 } from 'components';
import Globe from './Globe';

const IntroBlurb = styled(Heading2)``;

const blurb =
  'my name is Clifton Campbell. I am a web developer with a passion for quality.';

export default () => (
  <Page title="HELLO" Background={<Globe />}>
    <IntroBlurb>{blurb}</IntroBlurb>
  </Page>
);
