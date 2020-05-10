import React from 'react';
import styled from '@emotion/styled';
import { Filmstrip } from 'components';
import Page from 'components/Page';
import { orderedProjects } from 'constants/projects';
import {
  mobile,
  foregroundContentTopPadding,
  foregroundContentBottomPadding,
} from 'styles';
import { ProjectPreview } from '_pages/projects';

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

export default () => (
  <Page
    title="PROJECTS"
    reveal
    Background={
      <StyledFilmstrip reveal>
        {orderedProjects.map((project, i) => (
          <ProjectPreview {...project} key={project.id} index={i} />
        ))}
      </StyledFilmstrip>
    }
  />
);
