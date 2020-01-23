import styled from '@emotion/styled';
import { getStyle } from 'styles';

const Base = styled.span`
  transition: ${getStyle('linearHue')};
`;

export const Heading = styled(Base.withComponent('h1'))`
  font-family: 'Fat';
  color: ${getStyle('textColor2')};
  font-size: 84px;
`;

const Base2 = styled(Base)`
  font-family: 'Andale Mono';
  color: ${getStyle('textColor1')};
`;

export const Subheader = styled(Base2)`
  font-size: 22px;
`;

export const Detail = styled(Base2)`
  font-size: 14px;
`;

export const Detail2 = styled(Detail)`
  color: ${getStyle('textColor1')};
`;
