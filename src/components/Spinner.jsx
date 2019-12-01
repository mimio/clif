import styled from '@emotion/styled';
import { getStyle } from 'styles';

export default styled.div`
  @-webkit-keyframes loading {
    to {
      -webkit-transform: rotate(360deg);
    }
  }
  @-moz-keyframes loading {
    to {
      -moz-transform: rotate(360deg);
    }
  }
  @-ms-keyframes loading {
    to {
      -ms-transform: rotate(360deg);
    }
  }
  @keyframes loading {
    to {
      transform: rotate(360deg);
    }
  }

  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: transparent;

  border-top: 4px solid ${getStyle('ultraLimeGreen')};
  border-right: 4px solid ${getStyle('ultraLimeGreen')};
  border-bottom: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid rgba(0, 0, 0, 0.1);

  -webkit-animation: loading 0.8s infinite linear;
  -moz-animation: loading 0.8s infinite linear;
  -ms-animation: loading 0.8s infinite linear;
  animation: loading 0.8s infinite linear;
`;
