import React from 'react';
import styled from '@emotion/styled';
import { TabPropType } from 'utils/prop-types';
import { HELLO, WORK, CONTACT } from 'constants/tabs';
import { Column } from '../layout';
import { Heading, SubHeading } from '../Text';

const copy = {
  [HELLO]: {
    header:
      "Hello. I'm Clifton Campbell, a web developer with an eye for design.",
  },
  [WORK]: {
    header:
      'I spent 2 yrs at New York State Parks, 2 yrs at Nike, and 1 yr at Ubiquiti.',
    subheader:
      'Originally a GIS technician, I transitioned into creating websites and software for major tech companies.',
  },
  [CONTACT]: {
    header:
      'For work and project inquiries, send mail to clif@mimio.io.',
  },
};

const Container = styled(Column)`
  align-items: flex-start;
`;

// splay tab information out simultaneously and animate directly

const Information = ({ selectedTab }) => {
  if (!selectedTab) return null;
  const { header, subheader } = copy[selectedTab];
  return (
    <Container>
      <Heading>{header}</Heading>
      {subheader && <SubHeading>{subheader}</SubHeading>}
    </Container>
  );
};

Information.propTypes = {
  selectedTab: TabPropType,
};

Information.defaultProps = {
  selectedTab: null,
};

export default Information;
