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

export default [
  {
    title: 'Air Quality Analysis Application',
    client: 'Ramboll Shair',
    theme: 'Air Quality Analysis',
    product: 'Scientific Tool',
    subtitle:
      'I worked with the Shair team to contruct a mapping tool that shows air polution data over time in the San Francisco bay.',
    imgSrc: shair,
    href: 'https://app.ramboll-shair.com/',
    Icon: MoleculeIcon,
    id: 'shair',
  },
  {
    title: 'Gentrification Analysis Application',
    client: 'Harvard',
    theme: 'Gentrification Analysis',
    product: 'Scientific Tool',
    subtitle:
      'I worked alongside Harvard to construct this scientific mapping tool that displays social and economic changes across the Greater Boston area starting in 1990.',
    imgSrc: harvard,
    href:
      'https://www.jchs.harvard.edu/boston-map#/boston-map/create-map',
    Icon: HomeIcon,
    id: 'harvard',
  },
  {
    title: 'Sports Events Finder',
    client: 'Fuzz Interactive',
    theme: 'Sports',
    product: 'Event Map',
    subtitle:
      "The The Women's Sports Foundation asked me to create a tool for users to find and research events in their area for the National Girls & Women in Sports Day.",
    imgSrc: ngwsd,
    href:
      'https://www.womenssportsfoundation.org/get-involved/ngwsd/',
    Icon: FutbolIcon,
    id: 'ngwsd',
  },
  {
    title: 'GoPro Mountain Games Event Map',
    client: '970 Design',
    theme: 'Sports',
    product: 'Event Map',
    subtitle:
      'I worked with 970 Design to create an annual event map for users to navigate the GoPro Mountain Games.',
    imgSrc: gopro,
    href: 'https://mountaingames.com/map.php',
    Icon: MountainIcon,
    id: 'gopro',
  },
  {
    title: '3D Asset Searching and Viewing Tool (Augmented Reality)',
    client: 'Deadlock Interactive',
    theme: '3D Models',
    product: 'Asset Viewer',
    subtitle:
      'I worked with Deadlock Interactive to create a 3D asset browsing and viewing platform, with augmented reality capabilities on mobile browsers.',
    imgSrc: polygoggles,
    href: 'http://poly-goggles.herokuapp.com/',
    Icon: CubeIcon,
    id: 'poly',
  },
  {
    title: 'Interactive Trailmap',
    client: '970 Design',
    theme: 'Outdoors',
    product: 'Services Map',
    subtitle:
      "I worked with 970 Design and Sage Outdoor Adventures to construct a trailmap with interactive areas, lines, and points to help users navigate the client's terrain as well as show off the large amount of land and activites offered.",
    imgSrc: sage,
    href: 'https://sageoutdooradventures.com/map/',
    Icon: HikingIcon,
    id: '970',
  },
  {
    title: 'Birds of Prey Winter Sports Event Map',
    client: '970 Design',
    theme: 'Winter Sports Event',
    product: 'Event Map',
    subtitle:
      '970 Design and I iterated on our work for the GoPro Mountain Games to create an annual event map for the BoP World Cup.',
    imgSrc: bop,
    href: 'https://bcworldcup.com/map.php',
    Icon: FeatherIcon,
    id: 'winter',
  },
];
