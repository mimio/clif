import { size } from './size';
import { mobile, mq } from './breakpoints';

export type SpacingValue = number | string;

// Props understood by the layout primitives in components/layout.ts.
export type LayoutProps = {
  /** align-items */
  a?: string;
  /** justify-content */
  j?: string;
  /** padding: grid units when a number, raw CSS when a string */
  p?: SpacingValue;
  /** margin: grid units when a number, raw CSS when a string */
  m?: SpacingValue;
  /** grid-area */
  ga?: string;
  /** align-self: stretch */
  stretch?: boolean;
  /** spacing between children */
  sp?: SpacingValue;
  /** spacing between children on mobile */
  msp?: SpacingValue;
};

const spacing = (
  value: SpacingValue | undefined,
  property: string,
): string => {
  if (typeof value === 'number')
    return `${property}: ${size(value)};`;
  if (typeof value === 'string') return `${property}: ${value};`;
  return '';
};

const createBase = (input: object): string => {
  const {
    a = 'center',
    j = 'flex-start',
    p,
    m,
    stretch,
    ga,
  } = input as LayoutProps;
  return `
  display: flex;
  align-items: ${a};
  justify-content: ${j};
  ${ga ? `grid-area: ${ga};` : ''}
  ${spacing(p, 'padding')}
  ${spacing(m, 'margin')}
  ${stretch ? 'align-self: stretch;' : ''}
`;
};

// The helpers accept `object` (not LayoutProps) so that Emotion can call them
// with any styled component's props without a weak-type mismatch.
export const centered = (props: object): string => `
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

const createSpacing = (
  sp: SpacingValue | undefined,
  cssKey: string,
): string => {
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

export const row = (input: object): string => {
  const { sp, msp, ...props } = input as LayoutProps;
  return `
  ${createBase(props)};
  flex-direction: row;
  ${createSpacing(sp, 'margin-right')};
  ${mobile(`
    ${createSpacing(msp, 'margin-right')};
  `)};
`;
};

export const column = (input: object): string => {
  const { sp, msp, ...props } = input as LayoutProps;
  return `
  ${createBase(props)};
  flex-direction: column;
  ${createSpacing(sp, 'margin-bottom')};
  ${mobile(`
    ${createSpacing(msp, 'margin-bottom')};
  `)};
`;
};

export const full = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
