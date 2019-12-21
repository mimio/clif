import styled from '@emotion/styled';
import { getStyle } from 'styles';

const Base = styled.span`
  font-family: 'Manrope';
  color: ${getStyle('text1')};
`;

export const Heading = styled(Base)`
  font-weight: normal;
  font-size: 62px;
  line-height: 120px;
`;

export const SubHeading = styled(Base)`
  font-weight: light;
  font-size: 32px;
  line-height: 80px;
`;

export const Navigation = styled(Base)`
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 10px;
  color: ${({ active }) =>
    active ? getStyle('text1') : getStyle('text2')};
`;
