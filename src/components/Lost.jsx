import React from 'react';
import styled from '@emotion/styled';
import { HELLO } from 'constants/pages';
import { UFOIcon } from 'icons';
import { Column, Heading, Link, Detail3 } from 'components';

const Container = styled(Column)`
  width: 100%;
  height: 100%;
  justify-content: center;
  > a {
    margin-top: 76px;
  }
`;

const Lost = () => (
  <Container sp={6}>
    <Heading>404</Heading>
    <Detail3>It Looks Like You Are Lost</Detail3>
    <Link Icon={UFOIcon} href={`/${HELLO}`}>
      Take Me Home
    </Link>
  </Container>
);

export default Lost;
