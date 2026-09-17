import type { GetStaticProps } from 'next';
import { cameras } from 'content/cameras';
import { historyStops, type HistoryStop } from 'content/history';
import AboutPage from 'pagesComponents/about';
import { useSceneCamera } from 'scene/useSceneCamera';

type AboutProps = {
  stops: HistoryStop[];
};

const About = ({ stops }: AboutProps) => {
  useSceneCamera(cameras.about);
  return <AboutPage stops={stops} />;
};

export default About;

export const getStaticProps: GetStaticProps<
  AboutProps
> = async () => ({
  props: { stops: historyStops },
});
