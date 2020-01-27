import React from 'react';
import Page from 'components/Page';
import Popup from './containers/Popup';
import Map from './containers/Map';

export default () => (
  <Page
    Background={() => (
      <>
        <Popup />
        <Map />
      </>
    )}
  />
);
