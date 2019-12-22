import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { TabPropType } from 'utils/prop-types';
import { getStyle, size } from 'styles';
import { centered } from 'styles/layout';
import { HELLO, WORK, CONTACT, orderedTabs } from 'constants/tabs';
import { Row } from './layout';
import { Navigation as NavigationText } from './Text';

const copy = {
  [HELLO]: 'hello',
  [WORK]: 'work',
  [CONTACT]: 'say hi',
};

const StyledLink = styled(Link)`
  ${centered};
  height: ${size(15)};
  width: ${size(30)};
`;

const Progress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: ${({ progress }) => `${progress}%`};
  background: ${getStyle('text1')};
`;

const Container = styled(Row)`
  position: relative;
  > a:not(a:last-child) {
    margin-right: ${size(8)};
  }
`;

const Navigation = ({ progress, className, selectedTab }) => (
  <Container className={className}>
    {orderedTabs.map(tab => (
      <StyledLink to={`/${tab}`} key={tab}>
        <NavigationText active={tab === selectedTab}>
          {copy[tab]}
        </NavigationText>
      </StyledLink>
    ))}
    <Progress progress={progress} />
  </Container>
);

Navigation.propTypes = {
  className: PropTypes.string,
  selectedTab: TabPropType,
  progress: PropTypes.number.isRequired,
};

Navigation.defaultProps = {
  className: '',
  selectedTab: null,
};

export default Navigation;
