import React from 'react';
import styled from '@emotion/styled';
import Filmstrip from 'components/Filmstrip';
import Page from 'components/Page';
import { projectsList } from 'constants/projects';
import { mobile } from 'styles/breakpoints';
import {
  foregroundContentTopPadding,
  foregroundContentBottomPadding,
} from 'styles/layout';
import ProjectPreview from 'pagesComponents/projects/ProjectPreview';

const StyledFilmstrip = styled(Filmstrip)`
  height: 100%;
  width: 100%;
  max-height: 760px;
  ${foregroundContentTopPadding};
  ${foregroundContentBottomPadding};
  ${mobile(`
    height: 86%;
  `)};
`;

const Index = () => (
  <Page
    title="projects"
    Background={
      <StyledFilmstrip>
        {projectsList.map((project, i) => (
          <ProjectPreview {...project} key={project.id} index={i} />
        ))}
      </StyledFilmstrip>
    }
  />
);

export default Index;
