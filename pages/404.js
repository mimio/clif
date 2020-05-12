import React from 'react';
import styled from '@emotion/styled';
import UFOIcon from 'icons/ufo.svg';
import { Column } from 'components/layout';
import { Heading, Detail } from 'components/text';
import Link from 'components/CTA/Link';

const Container = styled(Column)`
  width: 100%;
  height: 100%;
  justify-content: center;
  > a {
    margin-top: 40px;
    max-width: 200px;
  }
`;

const Lost = () => (
  <Container sp={6}>
    <Heading>404</Heading>
    <Detail>It Looks Like You Are Lost</Detail>
    <Link
      ariaLabel="Link To Homepage"
      internal
      Icon={UFOIcon}
      href="/"
    >
      Take Me Home
    </Link>
  </Container>
);

export default Lost;
