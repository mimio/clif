import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  ${({ centered }) =>
    centered
      ? `
    justify-content: center;
    align-items: center;
  `
      : ``};
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
`;
