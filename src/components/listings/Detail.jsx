import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Antonio;
  color: ${p => p.theme.get('limeGreen')};
  padding: 20px 0;
`;

const BigButton = styled.button`
  height: 100px;
  width: 100%;
  color: ${p => p.theme.get('limeGreen')};
  cursor: pointer;
  &:hover {
    color: ${p => p.theme.get('gray')};
    background: ${p => p.theme.get('limeGreen')};
  }
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  background: none;
  outline: 0;
  border: none;
  box-shadow: inset 0 0 0 5px ${p => p.theme.get('limeGreen')};
  padding: 20px;
`;

const Inner = styled.div`
  margin: ${p => p.theme.size(4)};
`;

const StyledName = styled.div`
  font-size: 27px;
  text-transform: uppercase;
  margin: 20px 0px;
`;
const StyledDescription = styled.div`
  font-size: 16px;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.2;
  margin-bottom: 20px;
`;

export default function Detail({
  feature: { Name, ShortDescription },
  clearSelection,
}) {
  return (
    <Container>
      <Inner>
        <StyledName>{Name}</StyledName>
        <StyledDescription>{ShortDescription}</StyledDescription>
        <BigButton onClick={clearSelection}>
          <span>Go Back</span>
        </BigButton>
      </Inner>
    </Container>
  );
}
