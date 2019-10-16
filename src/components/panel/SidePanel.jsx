import React from 'react';
import styled from '@emotion/styled';
import Toggle from './Toggle';

const Container = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  min-width: 300px;
  height: 100%;
  background: white;
  transform: ${p =>
    p.showing ? 'translateX(0px)' : 'translateX(-300px)'};
  z-index: 10;
  transition: transform 0.3s ease-in-out;
`;

export default function SidePanel({ showing, toggleSidePanel }) {
  return (
    <Container showing={showing}>
      <Toggle onClick={toggleSidePanel} />
    </Container>
  );
}
