import React from 'react';
import Page from 'components/Page';
import projects from './assets';
import Project from './Project';

export default () => (
  <Page
    Foreground={() =>
      projects.map(project => <Project {...project} />)
    }
    foregroundProps={{ sp: 23 }}
    fadeForeground
  />
);
