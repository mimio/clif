import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { TabPropType } from 'utils/prop-types';
import { HELLO, WORK, CONTACT } from 'constants/tabs';
import { Column } from '../layout';
import { Heading, SubHeading } from '../Text';

const copy = {
  [HELLO]: {
    header:
      'Lorem Ipsum asd sdf sdhfbsjdh sdf sdf  sdf sd fsdf sdfsdfsdf asdasd',
    // "Hello. I'm Clifton Campbell, a web developer with an eye for design.",
  },
  [WORK]: {
    header: 'sd fsdf sdfsdfsdf asdasd sdfsdf sdfsdf sdfsdf sdfsdf',
    // 'I spent 2 yrs at New York State Parks, 2 yrs at Nike, and 1 yr at Ubiquiti.',
    subheader: 'sdf sdf  sdf sdfsdfdfsdfs sdfsdfsdf sdfsdf dfsdfsdf.',
    // 'Originally a GIS technician, I transitioned into creating websites and software for major tech companies.',
  },
  [CONTACT]: {
    header:
      'Lorem Ipsum asd sdf sdhfbsjdh sdf sdf  sdf sd fsdf sdfsdfsdf asdasd',
    // 'For work and project inquiries, send mail to clif@mimio.io.',
  },
};

const Container = styled(Column)`
  align-items: flex-start;
  padding-right: 30%;
`;

// splay tab information out simultaneously and animate directly

const Information = ({ className, selectedTab }) => {
  if (!selectedTab) return null;
  const { header, subheader } = copy[selectedTab];
  return (
    <Container className={className}>
      <Heading>{header}</Heading>
      {subheader && <SubHeading>{subheader}</SubHeading>}
    </Container>
  );
};

Information.propTypes = {
  className: PropTypes.string,
  selectedTab: TabPropType,
};

Information.defaultProps = {
  className: '',
  selectedTab: null,
};

export default Information;
