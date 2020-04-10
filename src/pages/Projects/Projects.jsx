import React from 'react';
import Page from 'components/Page';
import styled from '@emotion/styled';
import { Filmstrip } from 'components';
import projects from './assets';
import Project from './Project';

const StyledFilmstrip = styled(Filmstrip)`
  height: 100%;
  width: 100%;
`;

export default () => (
  <Page
    Background={
      <StyledFilmstrip>
        {projects.map((project, i) => (
          <Project {...project} key={project.id} index={i} />
        ))}
      </StyledFilmstrip>
    }
  />
);
