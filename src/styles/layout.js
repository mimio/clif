import { size } from './size';
import { mobile, mq } from './breakpoints';

const createBase = ({
  a = 'center',
  j = 'flex-start',
  p,
  m,
  as,
  ga,
}) => `
  display: flex;
  justify-content: flex-start;
  align-items: center;
  align-items: ${a};
  justify-content: ${j};
  grid-area: ${ga};
  ${typeof p === 'number' ? `padding: ${size(p)};` : ''};
  ${typeof m === 'number' ? `margin: ${size(m)};` : ''};
  ${as ? 'align-self: stretch;' : ''};
`;

export const centered = props => `
  ${createBase(props)};
  justify-content: center;
`;

export const foregroundContentTopPadding = mq({
  paddingTop: [size(52), size(44), size(24)],
});

export const foregroundContentBottomPadding = mq({
  paddingBottom: [size(20), size(20), size(10)],
});

export const header = `
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 170px;
  padding: 0px 50px;
  img, svg {
    height: 68px;
  }
  ${mobile(`
    height: 100px;
    padding: 0px 25px;
    img, svg {
      height: 50px;
    }
  `)};
`;

const createSpacing = (sp, cssKey) => {
  switch (typeof sp) {
    case 'number':
      return `> *:not(:last-child) {
        ${cssKey}: ${size(sp)};
      }`;
    case 'string':
      return `
        > *:not(:last-child) {
          ${cssKey}: ${sp};
        }
      `;
    default:
      return '';
  }
};

export const row = ({ sp, msp, ...props }) => `
  ${createBase(props)};
  flex-direction: row;
  ${createSpacing(sp, 'margin-right')};
  ${mobile(`
    ${createSpacing(msp, 'margin-right')};
  `)};
`;

export const column = ({ sp, msp, ...props }) => `
  ${createBase(props)};
  flex-direction: column;
  ${createSpacing(sp, 'margin-bottom')};
  ${mobile(`
    ${createSpacing(msp, 'margin-bottom')};
  `)};
`;

export const full = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
