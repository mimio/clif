import React from 'react';
import styled from '@emotion/styled';

const StyledText = styled.span`
  font-size: 24px;
`;

export default function Text({ children, className }) {
  return <StyledText className={className}>{children}</StyledText>;
}
