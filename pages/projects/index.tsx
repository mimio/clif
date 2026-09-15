import Filmstrip from 'components/Filmstrip';
import Page from 'components/Page';
import { projectsList } from 'constants/projects';
import ProjectPreview from 'pagesComponents/projects/ProjectPreview';

const Projects = () => (
  <Page
    title="projects"
    Background={
      <Filmstrip className="h-full max-h-[760px] w-full pt-52 pb-20 max-desktop:pt-44 max-tablet:h-[86%] max-tablet:pt-24 max-tablet:pb-10">
        {projectsList.map((project, i) => (
          <ProjectPreview {...project} key={project.id} index={i} />
        ))}
      </Filmstrip>
    }
  />
);

export default Projects;
