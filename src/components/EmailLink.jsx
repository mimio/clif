import React from 'react';
import styled from '@emotion/styled';
import { EnvelopeIcon } from 'icons';
import { Detail2 } from './Text';

const emailAddress = 'clif@mimio.io';

const StyledLink = styled(Detail2.withComponent('a'))``;

const EmailLink = () => (
  <StyledLink
    href={`mailto:${emailAddress}?Subject=Hello`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <EnvelopeIcon />
    {emailAddress}
  </StyledLink>
);

export default EmailLink;
