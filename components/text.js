import styled from '@emotion/styled';
import {
  body,
  body2,
  detail,
  detail2,
  detail3,
  heading,
  heading2,
  heading3,
  subheader,
  subheader2,
} from 'styles/text';

export const Body = styled.span`
  grid-area: body;
  ${body};
`;

export const Body2 = styled.span`
  grid-area: body2;
  ${body2};
`;

export const Heading = styled.h1`
  grid-area: heading;
  ${heading};
`;

export const Heading2 = styled.h2`
  grid-area: heading2;
  ${heading2};
`;

export const Heading3 = styled.h3`
  grid-area: heading3;
  ${heading3};
`;

export const Subheader = styled.span`
  grid-area: subheader;
  ${subheader};
`;

export const Subheader2 = styled.span`
  grid-area: subheader2;
  ${subheader2};
`;

export const Detail = styled.span`
  grid-area: detail;
  ${detail};
`;

export const Detail2 = styled.span`
  grid-area: detail2;
  ${detail2};
`;

export const Detail3 = styled.span`
  grid-area: detail3;
  ${detail3};
`;
