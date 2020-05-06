import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { Route, Switch, Redirect } from 'react-router-dom';
import { mobile, size } from 'styles';
import { EnvelopeIcon } from 'icons';
import email from 'constants/email';
import { LOST } from 'constants/pages';
import useWatchScreenSize from 'hooks/useWatchScreenSize';
import { Link, Navigation } from 'components';
import Loader from 'components/Loader';
import * as analytics from 'utils/analytics';
import { mainPages, subPages } from './pages';

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

const App = ({ match, history }) => {
  useWatchScreenSize();
  const pathname = history?.location?.pathname;
  const isPathActive = (path) => path === pathname;

  useEffect(() => {
    analytics.pageview();
  }, [pathname]);

  return (
    <>
      <Loader isLoading />
      <StyledNavigation />
      <ContactLink
        href={`mailto:${email}`}
        Icon={EnvelopeIcon}
        vertical
      >
        {email}
      </ContactLink>
      {mainPages.map(({ id, component: Component, path }) => (
        <Component
          key={id}
          path={path}
          isActive={isPathActive(path)}
        />
      ))}
      <Switch>
        {subPages.map(({ id, path, component: Component }) => (
          <Route
            key={id}
            exact
            path={path}
            component={() => (
              <Component isActive={isPathActive(path)} />
            )}
          />
        ))}
        <Route
          component={() => {
            return mainPages.find(
              ({ path }) => path === match?.url,
            ) ? null : (
              <Redirect to={`/${LOST}`} />
            );
          }}
        />
      </Switch>
    </>
  );
};

export default App;
