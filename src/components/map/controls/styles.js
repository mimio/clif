import styled from '@emotion/styled';
import { getStyle } from 'styles';
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
  height: ${SIZE};
  width: 100%;
  padding: 6px 10px;
  transition: ${getStyle('hue')};
  background: transparent;
  color: #333333;
  cursor: pointer;
  border: none;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;
