import React from 'react';
import HomeIcon from 'public/icons/home.svg';
import CubeIcon from 'public/icons/cube.svg';
import MoleculeIcon from 'public/icons/molecule.svg';
import FeatherIcon from 'public/icons/feather.svg';
import FutbolIcon from 'public/icons/futbol.svg';
import HikingIcon from 'public/icons/hiking.svg';
import MountainIcon from 'public/icons/mountain.svg';
import CloudIcon from 'public/icons/cloud.svg';
import CodeIcon from 'public/icons/code.svg';
import LaughtHahaIcon from 'public/icons/face-grin-squint-tears.svg';
import GearsIcon from 'public/icons/gears.svg';
import ListIcon from 'public/icons/list.svg';
import MoneyIcon from 'public/icons/money-bill-wave.svg';

const DEV = 'Development';
const UIUX = 'UI/UX Design';
const UX = 'UX Design';
const CARTO = 'Cartography';

const _projects = [
  {
    title: 'appexchange.salesforce.com',
    client: 'Salesforce',
    year: 2024,
    theme: 'Software',
    product: 'Application Marketing Website',
    // users: 1000000,
    subtitle: (
      <>
        <p>
          I worked on lead and application offer generation UI. I also
          led the revitalization of a multi-site design system.
        </p>
        <p>
          We leveraged and worked alongside Salesforce front-end
          technology{' '}
          <a
            href="https://developer.salesforce.com/docs/platform/lwc/guide"
            rel="noopener noreferrer"
            target="_blank"
          >
            Lightning Web Components
          </a>
          .
        </p>
      </>
    ),
    imgSrc: '/appexchange.png',
    imgSrcSkinny: '/appexchange_skinny.png',
    href: 'https://appexchange.salesforce.com/',
    Icon: CodeIcon,
    id: 'appexchange',
    roles: [DEV],
    employer: true,
  },
  {
    title: 'developer.salesforce.com',
    client: 'Salesforce',
    year: 2020,
    theme: 'Software',
    product: 'Developer Marketing Website',
    users: 1000000,
    subtitle: (
      <>
        <p>
          I worked with my team to rebuild the
          developer.salesforce.com website (which serves millions of
          users per month). My duties involved working closely with
          design, creating a component library, and page construction.
        </p>
        <p>
          We leveraged and worked alongside Salesforce front-end
          technologies{' '}
          <a
            href="https://developer.salesforce.com/docs/platform/lwc/guide"
            rel="noopener noreferrer"
            target="_blank"
          >
            Lightning Web Components
          </a>{' '}
          and{' '}
          <a
            href="https://developer.salesforce.com/docs/platform/lwr/guide/lwr-intro.html"
            rel="noopener noreferrer"
            target="_blank"
          >
            Lightning Web Runtime
          </a>
          .
        </p>
      </>
    ),
    imgSrc: '/salesforce_developers.png',
    imgSrcSkinny: '/salesforce_developers_skinny.png',
    href: 'https://developer.salesforce.com/',
    Icon: CodeIcon,
    id: 'developers',
    roles: [DEV],
    employer: true,
  },
  {
    title: 'Heroku Pricing Page',
    client: 'Salesforce',
    year: 2020,
    theme: 'Pricing',
    product: 'Marketing Tool',
    users: 1300000,
    subtitle: (
      <>
        <p>
          I worked with Heroku to construct a pricing comparison tool
          for Heroku products and plans.
        </p>
      </>
    ),
    imgSrc: '/heroku_pricing.png',
    imgSrcSkinny: '/heroku_pricing_skinny.png',
    href: 'https://www.heroku.com/pricing',
    Icon: MoneyIcon,
    id: 'pricing',
    roles: [DEV],
    employer: true,
  },
  {
    title: 'Emote Widget',
    client: 'Salesforce',
    year: 2021,
    theme: 'Widget',
    product: 'Live Event Widget',
    subtitle: (
      <>
        <p>
          The emote widget (and its associated server) allows virtual
          event attendees watching the event stream to share their
          emotion with other attendees and the presenter in real time.
          It is a higher fidelity, virtual-only version of clapping.
        </p>
        <p>My role on the project was animation.</p>
      </>
    ),
    imgSrc: '/emote_widget.png',
    imgSrcSkinny: '/emote_widget_skinny.png',
    href: 'https://github.com/developerforce/emote-widget',
    Icon: LaughtHahaIcon,
    id: 'emote',
    roles: [DEV, UIUX],
    employer: true,
  },
  {
    title: 'Ubiquiti Local Device Settings',
    client: 'Ubiquiti',
    year: 2020,
    theme: 'Software',
    product: 'Hardware Settings UI',
    users: 100000,
    subtitle: (
      <>
        <p>
          While working at Ubiquiti I implemented a local settings UI
          for networking hardware.
        </p>
        <p>
          My software was installed into devices so customers could
          easily manage the settings of their Ubiquiti network
          computing products from home.
        </p>
      </>
    ),
    imgSrc: '/ubiquiti_settings.png',
    imgSrcSkinny: '/ubiquiti_settings_skinny.png',
    href: 'https://unifi.ui.com/',
    Icon: GearsIcon,
    id: 'settings',
    roles: [DEV],
    employer: true,
  },
  {
    title: 'Ubiquiti Device Setup Flow',
    client: 'Ubiquiti',
    year: 2020,
    theme: 'Software',
    product: 'Hardware Setup Flow',
    users: 100000,
    subtitle: (
      <>
        <p>
          While working at Ubiquiti I implemented a setup flow UI for
          cutting edge hardware.
        </p>
        <p>
          My software was installed into devices so customers could
          easily setup their Ubiquiti products from home.
        </p>
      </>
    ),
    imgSrc: '/ubiquiti_setup.png',
    imgSrcSkinny: '/ubiquiti_setup_skinny.png',
    href: 'https://store.ui.com/us/en?category=all-cloud-keys-gateways',
    Icon: ListIcon,
    id: 'setup',
    roles: [DEV],
    employer: true,
  },
  {
    title: 'Ubiquiti Device Portal',
    client: 'Ubiquiti',
    year: 2020,
    theme: 'Software',
    product: 'Hardware Management Software',
    users: 100000,
    subtitle: (
      <>
        <p>
          While working at Ubiquiti I implemented a dashboard for
          viewing and managing user devices.
        </p>
        <p>
          This involved coordinating across many different teams,
          including the teams responsible for security cameras,
          internet hardware, security hardware, and more.
        </p>
      </>
    ),
    imgSrc: '/ubiquiti_portal.png',
    imgSrcSkinny: '/ubiquiti_portal_skinny.png',
    href: 'https://unifi.ui.com/',
    Icon: CloudIcon,
    id: 'portal',
    roles: [DEV],
    employer: true,
  },
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
          JCHS&apos;s curated socioeconomic data and bundles it into a
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
    href: 'https://www.jchs.harvard.edu/boston-map#/boston-map/create-map',
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
    href: 'https://www.womenssportsfoundation.org/get-involved/ngwsd/',
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
    appDeactivated: true,
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
    appDeactivated: true,
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

const approximateUserCount = (users) => {
  if (users >= 1000000) {
    return `${Number(1000000).toLocaleString()}+`;
  }
  if (users >= 100000) {
    return `${Number(100000).toLocaleString()}+`;
  }
  return null;
};

const makeUserData = (users) => {
  if (!users) return {};
  return {
    usersFormatted: users.toLocaleString(),
    usersApproximate: approximateUserCount(users),
  };
};

export const projectsList = _projects.map((project, i) => {
  const prevId =
    i === 0
      ? _projects[_projects.length - 1].id
      : _projects[i - 1].id;
  const nextId =
    i === _projects.length - 1
      ? _projects[0].id
      : _projects[i + 1].id;

  const usersData = makeUserData(project.users);

  return {
    ...project,
    ...usersData,
    prevId,
    nextId,
  };
});

export default projectsList.reduce(
  (acc, val) => ({ ...acc, [val.id]: val }),
  {},
);
