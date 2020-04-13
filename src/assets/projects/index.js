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
import harvard from './harvard.png';
import ngwsd from './ngwsd.png';
import polygoggles from './polygoggles.png';
import sage from './sage.png';
import gopro from './gopro.png';
import bop from './bop.png';
import shair from './shair.png';

const DEV = 'Development';
const UIUX = 'UI/UX Design';
const UX = 'UX Design';
const CARTO = 'Cartography';

export default [
  {
    title: 'Air Quality Analysis Application',
    client: 'Ramboll Shair',
    year: 2020,
    theme: 'Air Quality Analysis',
    product: 'Scientific Tool',
    subtitle: (
      <>
        <p>
          Ramboll Shair is an internal startup turning data from air
          quality sensors into easily accessible and highly actionable
          insights.
        </p>
        <p>
          I worked with the Shair team to contruct an air quality
          analysis application that shows air quality data over time
          in the San Francisco Bay.
        </p>
      </>
    ),
    imgSrc: shair,
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
          The Harvard Joint Center for Housing Studies (JCHS) is a
          research group focused on advancing the study of housing
          issues and policies.
        </p>
        <p>
          Harvard needed a geographic tool allowing users to visualize
          social and economic changes across the Greater Boston area
          starting in 1990. What we constructed takes curated
          socioeconomic data from the JCHS and bundles it into custom
          mapping framework.
        </p>
      </>
    ),
    imgSrc: harvard,
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
    subtitle:
      "The The Women's Sports Foundation asked me to create a tool for users to find and research events in their area for the National Girls & Women in Sports Day.",
    imgSrc: ngwsd,
    href:
      'https://www.womenssportsfoundation.org/get-involved/ngwsd/',
    Icon: FutbolIcon,
    id: 'ngwsd',
    roles: [DEV, UIUX],
  },
  {
    title: 'GoPro Mountain Games Event Map',
    client: '970 Design',
    year: 2017,
    theme: 'Sports',
    product: 'Event Map',
    subtitle:
      'I worked with 970 Design to create an annual event map for users to navigate the GoPro Mountain Games.',
    imgSrc: gopro,
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
    imgSrc: polygoggles,
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
    imgSrc: sage,
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
    imgSrc: bop,
    href: 'https://bcworldcup.com/map.php',
    Icon: FeatherIcon,
    id: 'winter',
    roles: [DEV, CARTO],
  },
];
