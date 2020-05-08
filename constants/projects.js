import React from 'react';
import {
  HomeIcon,
  CubeIcon,
  MoleculeIcon,
  FeatherIcon,
  FutbolIcon,
  HikingIcon,
  MountainIcon,
} from 'icons';

const DEV = 'Development';
const UIUX = 'UI/UX Design';
const UX = 'UX Design';
const CARTO = 'Cartography';

const _projects = [
  {
    title: 'Air Quality Analysis Application',
    client: 'Ramboll Shair',
    year: 2020,
    theme: 'Air Quality Analysis',
    product: 'Scientific Tool',
    subtitle: (
      <>
        <p>
          <a
            href="https://ramboll-shair.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Shair
          </a>{' '}
          is an internal startup within the environmental consulting &
          engineering agency{' '}
          <a
            href="https://ramboll.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Ramboll
          </a>
          , turning data from air quality sensors into easily
          accessible and highly actionable insights.
        </p>
        <p>
          I worked with the Shair team to contruct an air quality
          analysis web application that shows both historical and
          real-time air quality data across multiple cities. I also
          helped craft an administrative tool that allows Shair
          scientists to easily manage geographic data, users, and
          settings of the main application.
        </p>
        <p>
          We aimed to provide users with a highly performant and
          intuitive experience while learning about the health of
          their local environment.
        </p>
      </>
    ),
    imgSrc: '/shair.webp',
    imgSrcSkinny: '/shair_skinny.webp',
    href: 'https://app.ramboll-shair.com/',
    Icon: MoleculeIcon,
    id: 'shair',
    roles: [DEV, UIUX],
  },
  {
    title: 'Gentrification Analysis Application',
    client: 'Harvard',
    year: 2018,
    theme: 'Gentrification Analysis',
    product: 'Scientific Tool',
    subtitle: (
      <>
        <p>
          <a
            href="https://www.jchs.harvard.edu/"
            rel="noopener noreferrer"
            target="_blank"
          >
            The Harvard Joint Center for Housing Studies
          </a>{' '}
          (JCHS) is a research group focused on advancing the study of
          housing issues and policies.
        </p>
        <p>
          I worked with the JCHS to create a geographic tool for
          visualizing social and economic changes across the Greater
          Boston area starting in 1990. What we constructed takes
          JCHS&apos;s curated socioeconomic and bundles it into a
          made-to-order geographic analysis application complete with
          user-driven filtration, data coloring, and session saving.
        </p>
        <p>
          We aimed to provide our users with a powerful tool for
          understanding key socioeconomic data in their city.
        </p>
      </>
    ),
    imgSrc: '/harvard.webp',
    imgSrcSkinny: '/harvard_skinny.webp',
    href:
      'https://www.jchs.harvard.edu/boston-map#/boston-map/create-map',
    Icon: HomeIcon,
    id: 'harvard',
    roles: [DEV, UX],
  },
  {
    title: 'Sports Events Finder',
    client: 'Fuzz Interactive',
    year: 2019,
    theme: 'Sports',
    product: 'Event Map',
    imgSrc: '/ngwsd.webp',
    imgSrcSkinny: '/ngwsd_skinny.webp',
    href:
      'https://www.womenssportsfoundation.org/get-involved/ngwsd/',
    Icon: FutbolIcon,
    id: 'ngwsd',
    subtitle: (
      <>
        <p>
          <a
            href="https://www.womenssportsfoundation.org/"
            rel="noopener noreferrer"
            target="_blank"
          >
            The Women&apos;s Sports Foundation
          </a>{' '}
          (WSF) is an advocacy group working to advance the lives of
          women through sports.
        </p>
        <p>
          We worked with the WSF to create a simple locator tool to
          help users find and connect to nearby WSF-approved events.
          The UX goal was straight-forward: users should able to enter
          their zipcode and see a list of all the events they can
          attend.
        </p>
        <p>
          Thus, we chose to design the tool in a minimal near-black &
          white style with simple, clean animations.
        </p>
      </>
    ),
    roles: [DEV, UIUX],
  },
  {
    title: 'GoPro Mountain Games Event Map',
    client: '970 Design',
    year: 2017,
    theme: 'Sports',
    product: 'Event Map',
    subtitle: (
      <>
        <p>
          <a
            href="https://vvf.org/"
            rel="noopener noreferrer"
            target="_blank"
          >
            The Vail Valley Foundation
          </a>{' '}
          (VVF) is a Colorado-based nonprofit working to enhance the
          Vail Valley through arts, athletics, and education. Every
          year, the VVF hosts the{' '}
          <a
            href="https://mountaingames.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            GoPro Vail Mountain Games
          </a>{' '}
          which gathered over{' '}
          <a
            href="https://mountaingames.com/2019-a-spectacular-year-for-gopro-mountain-games/"
            rel="noopener noreferrer"
            target="_blank"
          >
            {' '}
            80,000 attendees
          </a>{' '}
          in 2019.
        </p>
        <p>
          We worked with the VVF to create an interactive event map to
          help users find their way during the games that could be
          reused every year. This map is complete with searching,
          filtration by event category, and colorful cartography to
          help drive users in the right direction.
        </p>
        <p>
          Our goal was to give attendees a fun but useful and
          performant experience.
        </p>
      </>
    ),
    imgSrc: '/gopro.webp',
    imgSrcSkinny: '/gopro_skinny.webp',
    href: 'https://mountaingames.com/map.php',
    Icon: MountainIcon,
    id: 'gopro',
    roles: [DEV, CARTO],
  },
  {
    title: '3D Asset Searching and Viewing Tool (Augmented Reality)',
    client: 'Deadlock Interactive',
    year: 2019,
    theme: '3D Models',
    product: 'Asset Viewer',
    subtitle:
      'I worked with Deadlock Interactive to create a 3D asset browsing and viewing platform, with augmented reality capabilities on mobile browsers.',
    imgSrc: '/polygoggles.webp',
    imgSrcSkinny: '/polygoggles_skinny.webp',
    href: 'http://poly-goggles.herokuapp.com/',
    Icon: CubeIcon,
    id: 'poly',
    roles: [DEV, UIUX],
  },
  {
    title: 'Interactive Trailmap',
    client: '970 Design',
    year: 2019,
    theme: 'Outdoors',
    product: 'Services Map',
    subtitle:
      "I worked with 970 Design and Sage Outdoor Adventures to construct a trailmap with interactive areas, lines, and points to help users navigate the client's terrain as well as show off the large amount of land and activites offered.",
    imgSrc: '/sage.webp',
    imgSrcSkinny: '/sage_skinny.webp',
    href: 'https://sageoutdooradventures.com/map/',
    Icon: HikingIcon,
    id: '970',
    roles: [DEV, UIUX],
  },
  {
    title: 'Birds of Prey Winter Sports Event Map',
    client: '970 Design',
    year: 2018,
    theme: 'Winter Sports Event',
    product: 'Event Map',
    subtitle:
      '970 Design and I iterated on our work for the GoPro Mountain Games to create an annual event map for the BoP World Cup.',
    imgSrc: '/bop.webp',
    imgSrcSkinny: '/bop_skinny.webp',
    href: 'https://bcworldcup.com/map.php',
    Icon: FeatherIcon,
    id: 'winter',
    roles: [DEV, CARTO],
  },
];

export const orderedProjects = _projects.map((project, i) => {
  const prevId =
    i === 0
      ? _projects[_projects.length - 1].id
      : _projects[i - 1].id;
  const nextId =
    i === _projects.length - 1
      ? _projects[0].id
      : _projects[i + 1].id;

  return {
    ...project,
    prevId,
    nextId,
  };
});

export default orderedProjects.reduce(
  (acc, val) => ({ ...acc, [val.id]: val }),
  {},
);
