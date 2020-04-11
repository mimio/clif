import React from 'react';
import { HELLO, WORK, PROJECTS } from 'constants/pages';
import projects from 'assets/projects';
import Home from './Home';
import Work from './Work';
import Projects from './Projects';
import Project from './Project';

export default [
  { id: HELLO, path: `/${HELLO}`, component: Home },
  { id: PROJECTS, path: `/${PROJECTS}`, component: Projects },
  { id: WORK, path: `/${WORK}`, component: Work },
  ...projects.map((project, i) => ({
    id: project.id,
    path: `/${PROJECTS}/${project.id}`,
    component: () => <Project index={i} {...project} />,
  })),
];
