import React from 'react';
import styled from '@emotion/styled';
import { useHistory, useParams } from 'react-router-dom';
import { mobile, getStyle, size } from 'styles';
import { Link, Column } from 'components';
import { EnvelopeIcon } from 'icons';
import email from 'constants/email';
import { orderedTabs, HELLO } from 'constants/tabs';
import useWatchScreenSize from 'hooks/useWatchScreenSize';
import Navigation from './components/Navigation';
import Pages from './pages';

const Container = styled(Column)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  align-items: flex-start;
  background: ${getStyle('background1')};
`;

const StyledNavigation = styled(Navigation)`
  position: absolute;
  top: ${size(4)};
  right: ${size(4)};
  z-index: 5;
`;

const ContactLink = styled(Link)`
  position: absolute;
  bottom: ${size(4)};
  right: ${size(4)};
  z-index: 4;
  border-radius: 5px;
  ${mobile(`
    width: ${size(7)};
  `)};
`;

const App = () => {
  useWatchScreenSize();
  const { tabId } = useParams();
  if (!orderedTabs.includes(tabId)) {
    useHistory().push(`/${HELLO}`);
    return null;
  }

  return (
    <Container>
      <StyledNavigation />
      <ContactLink
        href={`mailto:${email}`}
        Icon={EnvelopeIcon}
        vertical
      >
        {email}
      </ContactLink>
      <Pages />
    </Container>
  );
};

export default App;
