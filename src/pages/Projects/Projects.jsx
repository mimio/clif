import React from 'react';
import Page from 'components/Page';
import styled from '@emotion/styled';
import { Filmstrip } from 'components';
import { projects } from 'assets';
import { mobile } from 'styles';
import ProjectPreview from './ProjectPreview';

const StyledFilmstrip = styled(Filmstrip)`
  height: 100%;
  width: 100%;
  max-height: 800px;
  ${mobile(`
    height: 86%;
  `)};
`;

export default () => (
  <Page
    title="PROJECTS"
    Background={
      <StyledFilmstrip>
        {projects.map((project, i) => (
          <ProjectPreview {...project} key={project.id} index={i} />
        ))}
      </StyledFilmstrip>
    }
  />
);
