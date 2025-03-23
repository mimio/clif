import React from 'react';
import styled from '@emotion/styled';
import UFOIcon from 'public/icons/ufo.svg';
import { Column } from 'components/layout';
import { Heading, Detail } from 'components/text';
import Button from 'components/Button';

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
    <Button
      ariaLabel="Link To Homepage"
      internal
      Icon={UFOIcon}
      href="/"
    >
      Take Me Home
    </Button>
  </Container>
);

export default Lost;
