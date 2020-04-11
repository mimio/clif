import React from 'react';
import styled from '@emotion/styled';
import { Route, Switch, Redirect } from 'react-router-dom';
import { mobile, size } from 'styles';
import { EnvelopeIcon } from 'icons';
import email from 'constants/email';
import { LOST } from 'constants/pages';
import useWatchScreenSize from 'hooks/useWatchScreenSize';
import { Link, Column, Cursor, Navigation } from 'components';
import pages from './pages';

const Container = styled(Column)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  align-items: flex-start;
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

  return (
    <Container>
      <Cursor />
      <StyledNavigation />
      <ContactLink
        href={`mailto:${email}`}
        Icon={EnvelopeIcon}
        vertical
      >
        {email}
      </ContactLink>
      <Switch>
        {pages.map(({ id, path, component }) => (
          <Route key={id} exact path={path} component={component} />
        ))}
        <Route component={() => <Redirect to={`/${LOST}`} />} />
      </Switch>
    </Container>
  );
};

export default App;
