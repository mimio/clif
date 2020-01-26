import React from 'react';
import styled from '@emotion/styled';
import Page from 'components/Page';
import { Subheader } from 'components';
import Globe from './Globe';

const IntroBlurb = styled(Subheader)`
  font-size: 36pt;
`;

const blurb =
  'my name is Clifton Campbell. I am a web developer with a passion for quality.';

export default () => (
  <Page
    Background={Globe}
    Foreground={() => <IntroBlurb>{blurb}</IntroBlurb>}
  />
);
