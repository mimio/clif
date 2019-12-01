import styled from '@emotion/styled';
import { getStyle } from 'styles';
import { centered } from 'styles/layout';
import { Column } from '../../layout';

// default mapbox button size
const SIZE = '30px';

export const MapButtonGroup = styled(Column)`
  width: ${SIZE};
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  background: white;
  > *:not(:last-child) {
    border-bottom: 1px solid #ddd;
  }
`;

export const MapButton = styled.button`
  ${centered};
  height: ${SIZE};
  width: 100%;
  padding: 0;
  transition: ${getStyle('hue')};
  background: transparent;
  color: #333333;
  cursor: pointer;
  border: none;
  svg {
    width: 10px;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;
