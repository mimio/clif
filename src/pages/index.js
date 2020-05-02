import React from 'react';
import { HELLO, WORK, PROJECTS } from 'constants/pages';
import projects from 'assets/projects';
import Home from './Home';
import Work from './Work';
import Projects from './Projects';
import Project from './Project';

export const mainPages = [
  { id: HELLO, path: `/${HELLO}`, component: Home },
  { id: PROJECTS, path: `/${PROJECTS}`, component: Projects },
  { id: WORK, path: `/${WORK}`, component: Work },
];

export const subPages = projects.map((project, i) => {
  const prevId =
    i === 0 ? projects[projects.length - 1].id : projects[i - 1].id;
  const nextId =
    i === projects.length - 1 ? projects[0].id : projects[i + 1].id;

  return {
    id: project.id,
    path: `/${PROJECTS}/${project.id}`,
    component: (props) => (
      <Project
        {...props}
        prevId={prevId}
        nextId={nextId}
        index={i}
        {...project}
      />
    ),
  };
});
