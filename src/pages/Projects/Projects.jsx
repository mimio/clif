import React from 'react';
import Page from 'components/Page';
import projects from './assets';
import Project from './Project';

export default () => (
  <Page
    Foreground={() =>
      projects.map((project, i) => <Project {...project} index={i} />)
    }
    fadeForeground
  />
);
