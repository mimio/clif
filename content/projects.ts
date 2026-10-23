import type { AnchorId } from 'content/anchors';

/*
 * The fourteen projects, migrated from the old constants/projects.tsx.
 *
 * Two fields from that file are gone: `theme`, which was never rendered
 * anywhere, and `usersFormatted`, which was computed and never read. The
 * prose, links, clients, years, user counts and roles are unchanged.
 *
 * `description` used to be JSX with anchors inside it, which meant the
 * content module could only ever be consumed by React. It is a typed
 * rich-text shape now: an array of paragraphs, each an array of spans,
 * where a span is either a plain string or a { text, href } link. A
 * renderer walks it; a test, a search index or an OG-image generator can
 * read it without a DOM. `poly`, `970` and `winter` had plain-string
 * subtitles and are single-span single-paragraph entries here.
 */
export type RichTextSpan = string | { text: string; href: string };
export type RichTextParagraph = RichTextSpan[];
export type RichText = RichTextParagraph[];

export const DEV = 'Development';
export const UIUX = 'UI/UX Design';
export const UX = 'UX Design';
export const CARTO = 'Cartography';

export type ProjectSource = {
  id: string;
  title: string;
  client: string;
  year: number;
  /** What was built, e.g. "Event Map". Shown in the detail meta grid. */
  product: string;
  description: RichText;
  /** Full-size WebP under public/, used as the shader plane's texture. */
  imgSrc: string;
  /** Live site. Dead for the two deactivated apps, kept for the record. */
  href: string;
  /** Path to the project's glyph under public/icons/. */
  iconSrc: string;
  roles: string[];
  /** The city point the scene flies to for this project. */
  anchor: AnchorId;
  /** True when the client was the employer rather than a client. */
  employer?: boolean;
  users?: number;
  appDeactivated?: boolean;
};

export type Project = ProjectSource & {
  prevId: string;
  nextId: string;
  /** Bucketed user count, or null below 100k. Never an exact figure. */
  usersApproximate: string | null;
};

const sources: ProjectSource[] = [
  {
    id: 'haikumi',
    title: 'Haikumi: Mobile Messaging With Care',
    client: 'Wieden+Kennedy',
    year: 2023,
    product: 'Mobile Messaging Application',
    description: [
      [
        'I was brought into this project mid way through to quickly bring design and development back on track for a tight release schedule. I constructed UX/UI blueprints for the entirety of the application and worked with a ',
        { text: 'Wieden + Kennedy', href: 'https://www.wk.com/' },
        " team to iterate and refine the application's design from start to finish. Once designs were stable, I was also responsible for constructing the app in flutter and releasing it to users on android and iOS.",
      ],
    ],
    imgSrc: '/haikumi.webp',
    href: 'https://haikumi.app/',
    iconSrc: '/icons/pen.svg',
    roles: [DEV, UIUX],
    anchor: 'portland',
  },
  {
    id: 'developers',
    title: 'salesforce developers',
    client: 'Salesforce',
    year: 2020,
    product: 'Developer Marketing Website',
    users: 1000000,
    description: [
      [
        'Rewrote developer.salesforce.com in less than a year, seamlessly transitioning millions of customers per month to a modern application stack. My duties included establishing a design system + component library, managing contracted engineers, and implementing experiences for blogs, developer documentation, news, podcasts, & events.',
      ],
      [
        'We leveraged and provided feedback for some of the earliest versions of Salesforce front-end technologies ',
        {
          text: 'Lightning Web Components',
          href: 'https://developer.salesforce.com/docs/platform/lwc/guide',
        },
        ' and ',
        {
          text: 'Lightning Web Runtime',
          href: 'https://developer.salesforce.com/docs/platform/lwr/guide/lwr-intro.html',
        },
        '. At the time of v1 launch we were the largest application using LWR.',
      ],
    ],
    imgSrc: '/salesforce_developers.webp',
    href: 'https://developer.salesforce.com/',
    iconSrc: '/icons/code.svg',
    roles: [DEV],
    anchor: 'sanFrancisco',
    employer: true,
  },
  {
    id: 'pricing',
    title: 'Heroku Pricing Page',
    client: 'Salesforce',
    year: 2020,
    product: 'Marketing Tool',
    users: 1300000,
    description: [
      [
        'I worked with Heroku to construct a pricing comparison tool for Heroku products and plans.',
      ],
    ],
    imgSrc: '/heroku_pricing.webp',
    href: 'https://www.heroku.com/pricing',
    iconSrc: '/icons/money-bill-wave.svg',
    roles: [DEV],
    anchor: 'sanFrancisco',
    employer: true,
  },
  {
    id: 'emote',
    title: 'Emote Widget',
    client: 'Salesforce',
    year: 2021,
    product: 'Live Event Widget',
    description: [
      [
        'The emote widget (and its associated server) allows virtual event attendees watching the event stream to share their emotion with other attendees and the presenter in real time. It is a higher fidelity, virtual-only version of clapping.',
      ],
      ['My role on the project was animation.'],
    ],
    imgSrc: '/emote_widget.webp',
    href: 'https://github.com/developerforce/emote-widget',
    iconSrc: '/icons/face-grin-squint-tears.svg',
    roles: [DEV, UIUX],
    anchor: 'sanFrancisco',
    employer: true,
  },
  {
    id: 'settings',
    title: 'Ubiquiti Local Device Settings',
    client: 'Ubiquiti',
    year: 2020,
    product: 'Hardware Settings UI',
    users: 100000,
    description: [
      [
        'While working at Ubiquiti I implemented a local settings UI for networking hardware.',
      ],
      [
        'My software was installed into devices so customers could easily manage the settings of their Ubiquiti network computing products from home.',
      ],
    ],
    imgSrc: '/ubiquiti_settings.webp',
    href: 'https://unifi.ui.com/',
    iconSrc: '/icons/gears.svg',
    roles: [DEV],
    anchor: 'portland',
    employer: true,
  },
  {
    id: 'setup',
    title: 'Ubiquiti Device Setup Flow',
    client: 'Ubiquiti',
    year: 2020,
    product: 'Hardware Setup Flow',
    users: 100000,
    description: [
      [
        'While working at Ubiquiti I implemented a setup flow UI for cutting edge hardware.',
      ],
      [
        'My software was installed into devices so customers could easily setup their Ubiquiti products from home.',
      ],
    ],
    imgSrc: '/ubiquiti_setup.webp',
    href: 'https://store.ui.com/us/en?category=all-cloud-keys-gateways',
    iconSrc: '/icons/list.svg',
    roles: [DEV],
    anchor: 'portland',
    employer: true,
  },
  {
    id: 'portal',
    title: 'Ubiquiti Device Portal',
    client: 'Ubiquiti',
    year: 2020,
    product: 'Hardware Management Software',
    users: 100000,
    description: [
      [
        'While working at Ubiquiti I implemented a dashboard for viewing and managing user devices.',
      ],
      [
        'This involved coordinating across many different teams, including the teams responsible for security cameras, internet hardware, security hardware, and more.',
      ],
    ],
    imgSrc: '/ubiquiti_portal.webp',
    href: 'https://unifi.ui.com/',
    iconSrc: '/icons/cloud.svg',
    roles: [DEV],
    anchor: 'portland',
    employer: true,
  },
  {
    id: 'shair',
    title: 'Air Quality Analysis Application',
    client: 'Ramboll Shair',
    year: 2020,
    product: 'Scientific Tool',
    description: [
      [
        { text: 'Shair', href: 'https://ramboll-shair.com/' },
        ' is an internal startup within the environmental consulting & engineering agency ',
        { text: 'Ramboll', href: 'https://ramboll.com/' },
        ', turning data from air quality sensors into easily accessible and highly actionable insights.',
      ],
      [
        'I worked with the Shair team to contruct an air quality analysis web application that shows both historical and real-time air quality data across multiple cities. I also helped craft an administrative tool that allows Shair scientists to easily manage geographic data, users, and settings of the main application.',
      ],
      [
        'We aimed to provide users with a highly performant and intuitive experience while learning about the health of their local environment.',
      ],
    ],
    imgSrc: '/shair.webp',
    href: 'https://app.ramboll-shair.com/',
    iconSrc: '/icons/molecule.svg',
    roles: [DEV, UIUX],
    anchor: 'portland',
  },
  {
    id: 'harvard',
    title: 'Gentrification Analysis Application',
    client: 'Harvard',
    year: 2018,
    product: 'Scientific Tool',
    description: [
      [
        {
          text: 'The Harvard Joint Center for Housing Studies',
          href: 'https://www.jchs.harvard.edu/',
        },
        ' (JCHS) is a research group focused on advancing the study of housing issues and policies.',
      ],
      [
        "I worked with the JCHS to create a geographic tool for visualizing social and economic changes across the Greater Boston area starting in 1990. What we constructed takes JCHS's curated socioeconomic data and bundles it into a made-to-order geographic analysis application complete with user-driven filtration, data coloring, and session saving.",
      ],
      [
        'We aimed to provide our users with a powerful tool for understanding key socioeconomic data in their city.',
      ],
    ],
    imgSrc: '/harvard.webp',
    href: 'https://www.jchs.harvard.edu/boston-map#/boston-map/create-map',
    iconSrc: '/icons/home.svg',
    roles: [DEV, UX],
    anchor: 'cambridge',
  },
  {
    id: 'ngwsd',
    title: 'Sports Events Finder',
    client: 'Fuzz Interactive',
    year: 2019,
    product: 'Event Map',
    description: [
      [
        {
          text: "The Women's Sports Foundation",
          href: 'https://www.womenssportsfoundation.org/',
        },
        ' (WSF) is an advocacy group working to advance the lives of women through sports.',
      ],
      [
        'We worked with the WSF to create a simple locator tool to help users find and connect to nearby WSF-approved events. The UX goal was straight-forward: users should able to enter their zipcode and see a list of all the events they can attend.',
      ],
      [
        'Thus, we chose to design the tool in a minimal near-black & white style with simple, clean animations.',
      ],
    ],
    imgSrc: '/ngwsd.webp',
    href: 'https://www.womenssportsfoundation.org/get-involved/ngwsd/',
    iconSrc: '/icons/futbol.svg',
    roles: [DEV, UIUX],
    anchor: 'newYork',
  },
  {
    id: 'gopro',
    title: 'GoPro Mountain Games Event Map',
    client: '970 Design',
    year: 2017,
    product: 'Event Map',
    description: [
      [
        {
          text: 'The Vail Valley Foundation',
          href: 'https://vvf.org/',
        },
        ' (VVF) is a Colorado-based nonprofit working to enhance the Vail Valley through arts, athletics, and education. Every year, the VVF hosts the ',
        {
          text: 'GoPro Vail Mountain Games',
          href: 'https://mountaingames.com/',
        },
        ' which gathered over ',
        {
          text: '80,000 attendees',
          href: 'https://mountaingames.com/2019-a-spectacular-year-for-gopro-mountain-games/',
        },
        ' in 2019.',
      ],
      [
        'We worked with the VVF to create an interactive event map to help users find their way during the games that could be reused every year. This map is complete with searching, filtration by event category, and colorful cartography to help drive users in the right direction.',
      ],
      [
        'Our goal was to give attendees a fun but useful and performant experience.',
      ],
    ],
    imgSrc: '/gopro.webp',
    href: 'https://mountaingames.com/map.php',
    iconSrc: '/icons/mountain.svg',
    roles: [DEV, CARTO],
    anchor: 'vail',
  },
  {
    id: 'poly',
    title: '3D Asset Searching and Viewing Tool (Augmented Reality)',
    client: 'Deadlock Interactive',
    year: 2019,
    product: 'Asset Viewer',
    description: [
      [
        'I worked with Deadlock Interactive to create a 3D asset browsing and viewing platform, with augmented reality capabilities on mobile browsers.',
      ],
    ],
    imgSrc: '/polygoggles.webp',
    href: 'http://poly-goggles.herokuapp.com/',
    iconSrc: '/icons/cube.svg',
    roles: [DEV, UIUX],
    anchor: 'portland',
    appDeactivated: true,
  },
  {
    id: '970',
    title: 'Interactive Trailmap',
    client: '970 Design',
    year: 2019,
    product: 'Services Map',
    description: [
      [
        "I worked with 970 Design and Sage Outdoor Adventures to construct a trailmap with interactive areas, lines, and points to help users navigate the client's terrain as well as show off the large amount of land and activites offered.",
      ],
    ],
    imgSrc: '/sage.webp',
    href: 'https://sageoutdooradventures.com/map/',
    iconSrc: '/icons/hiking.svg',
    roles: [DEV, UIUX],
    anchor: 'wolcott',
    appDeactivated: true,
  },
  {
    id: 'winter',
    title: 'Birds of Prey Winter Sports Event Map',
    client: '970 Design',
    year: 2018,
    product: 'Event Map',
    description: [
      [
        '970 Design and I iterated on our work for the GoPro Mountain Games to create an annual event map for the BoP World Cup.',
      ],
    ],
    imgSrc: '/bop.webp',
    href: 'https://bcworldcup.com/map.php',
    iconSrc: '/icons/feather.svg',
    roles: [DEV, CARTO],
    anchor: 'beaverCreek',
  },
];

/** Buckets a user count. Anything under 100k is not worth a number. */
export const approximateUserCount = (
  users: number | undefined,
): string | null => {
  if (users === undefined) return null;
  if (users >= 1000000) return '1,000,000+';
  if (users >= 100000) return '100,000+';
  return null;
};

// prev/next wrap circularly, so the pager never dead-ends.
export const projectsList: Project[] = sources.map((project, i) => ({
  ...project,
  prevId: sources[(i + sources.length - 1) % sources.length].id,
  nextId: sources[(i + 1) % sources.length].id,
  usersApproximate: approximateUserCount(project.users),
}));

export const projectsById: Record<string, Project> =
  Object.fromEntries(
    projectsList.map((project) => [project.id, project]),
  );

export default projectsById;
