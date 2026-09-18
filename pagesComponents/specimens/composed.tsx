import Pill from 'components/primitives/Pill';
import Text from 'components/primitives/Text';
import MetaGrid from 'components/composed/MetaGrid';
import Pager from 'components/composed/Pager';
import ProjectTable, {
  type ProjectRow,
} from 'components/composed/ProjectTable';
import SceneStage from 'components/composed/SceneStage';
import ScreenshotPlane from 'components/composed/ScreenshotPlane';
import Scrubber, {
  type ScrubberStop,
} from 'components/composed/Scrubber';
import Sheet from 'components/composed/Sheet';
import type { Specimen } from 'pagesComponents/specimens/types';

/*
 * Lane 6's section: every composed piece sitting on a stand-in for the
 * scene, because none of them can be judged on a blank page. The ground
 * below is NOT the real map -- it is built from --map-land / --map-deep and
 * carries fake map labels out to the right, so two things can be checked by
 * eye in every theme: that the table reads as a sheet lying on terrain
 * rather than a card, and that the wash is fully clear before the labels
 * start.
 */

const ROWS: ProjectRow[] = [
  {
    id: 'gopro',
    title: 'GoPro Mountain Games Event Map',
    client: '970 Design',
    city: 'Vail CO',
    year: 2017,
    users: null,
    href: '/projects/gopro',
  },
  {
    id: 'winter',
    title: 'Birds of Prey Winter Sports Map',
    client: '970 Design',
    city: 'Beaver Creek CO',
    year: 2018,
    users: null,
    href: '/projects/winter',
  },
  {
    id: 'sage',
    title: 'Interactive Trailmap',
    client: 'Sage Outdoor',
    city: 'Wolcott CO',
    year: 2019,
    users: 'retired',
    href: '/projects/sage',
  },
  {
    id: 'harvard',
    title: 'Gentrification Analysis Application',
    client: 'Harvard JCHS',
    city: 'Cambridge MA',
    year: 2018,
    users: null,
    href: '/projects/harvard',
  },
  {
    id: 'developers',
    title: 'salesforce developers',
    client: 'Salesforce',
    city: 'San Francisco',
    year: 2020,
    users: '1,000,000+',
    href: '/projects/developers',
  },
  {
    id: 'haikumi',
    title: 'Haikumi',
    client: 'Wieden+Kennedy',
    city: 'Portland OR',
    year: 2023,
    users: null,
    href: '/projects/haikumi',
  },
];

const MORE: ProjectRow[] = [
  {
    id: 'pricing',
    title: 'Heroku Pricing Page',
    client: 'Salesforce',
    city: 'San Francisco',
    year: 2020,
    users: '1,000,000+',
    href: '/projects/pricing',
  },
  {
    id: 'emote',
    title: 'Emote Widget',
    client: 'Salesforce',
    city: 'San Francisco',
    year: 2021,
    users: null,
    href: '/projects/emote',
  },
  {
    id: 'settings',
    title: 'Ubiquiti Local Device Settings',
    client: 'Ubiquiti',
    city: 'Portland OR',
    year: 2020,
    users: '100,000+',
    href: '/projects/settings',
  },
  {
    id: 'setup',
    title: 'Ubiquiti Device Setup Flow',
    client: 'Ubiquiti',
    city: 'Portland OR',
    year: 2020,
    users: '100,000+',
    href: '/projects/setup',
  },
  {
    id: 'portal',
    title: 'Ubiquiti Device Portal',
    client: 'Ubiquiti',
    city: 'Portland OR',
    year: 2020,
    users: '100,000+',
    href: '/projects/portal',
  },
  {
    id: 'shair',
    title: 'Air Quality Analysis Application',
    client: 'Ramboll Shair',
    city: 'Portland OR',
    year: 2020,
    users: null,
    href: '/projects/shair',
  },
  {
    id: 'ngwsd',
    title: 'Sports Events Finder',
    client: "Women's Sports Fdn",
    city: 'New York NY',
    year: 2019,
    users: null,
    href: '/projects/ngwsd',
  },
  {
    id: 'poly',
    title: '3D Asset Searching & Viewing Tool',
    client: 'Deadlock Interactive',
    city: 'Portland OR',
    year: 2019,
    users: 'retired',
    href: '/projects/poly',
  },
];

const ALL = [...ROWS, ...MORE];

const STOPS: ScrubberStop[] = [
  { id: 'parks', label: 'NY STATE PARKS', at: 0 },
  { id: 'tigard', label: 'TIGARD', at: 15 },
  { id: 'nike', label: 'NIKE', at: 25 },
  { id: 'ubiquiti', label: 'UBIQUITI', at: 36 },
  { id: 'freelancing', label: 'FREELANCING', at: 46 },
  { id: 'salesforce', label: 'SALESFORCE', at: 57 },
];

/** Where the stand-in map draws its own labels, as a share of the frame. */
const LABELS: { name: string; left: string; top: string }[] = [
  { name: 'VAIL VALLEY · 3', left: '62%', top: '34%' },
  { name: 'PORTLAND · 6', left: '72%', top: '18%' },
  { name: 'CAMBRIDGE · 1', left: '84%', top: '52%' },
  { name: 'SAN FRANCISCO · 3', left: '66%', top: '70%' },
];

/*
 * A stand-in for the scene: terrain built from the themed map tokens, with
 * the map's own labels where 1b puts them. The wash has to be clear here.
 */
const Ground = () => (
  <div aria-hidden="true" className="absolute inset-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_75%_40%,var(--map-land)_0%,var(--map-deep)_58%,var(--surface-ground)_100%)]" />
    <div className="absolute inset-0 bg-[repeating-linear-gradient(118deg,var(--map-land)_0_9px,var(--map-deep)_9px_18px)] opacity-40" />
    {LABELS.map((label) => (
      <div
        className="absolute flex items-center gap-2"
        key={label.name}
        style={{ left: label.left, top: label.top }}
      >
        <span className="block size-[7px] rounded-[var(--radius-circle)] bg-accent-60" />
        <Text
          className="[letter-spacing:var(--type-label-tracking)] text-fg-2 uppercase"
          variant="readout"
        >
          {label.name}
        </Text>
      </div>
    ))}
  </div>
);

const Frame = ({
  id,
  caption,
  children,
}: {
  id: string;
  caption: string;
  children: React.ReactNode;
}) => (
  <figure className="m-0 flex flex-col gap-2" id={id}>
    <Text
      className="[letter-spacing:var(--type-label-tracking)] text-fg-4 uppercase"
      variant="readout"
    >
      {caption}
    </Text>
    <div className="relative h-[820px] w-full max-w-[1440px] overflow-hidden bg-surface">
      <Ground />
      {children}
    </div>
  </figure>
);

const CONTROLS = (
  <div className="flex gap-2">
    <Pill size="sm">fit</Pill>
    <Pill size="sm">prev</Pill>
    <Pill size="sm">next</Pill>
  </div>
);

export const composed: Specimen = {
  id: 'composed',
  title: 'Composed',
  note: 'Project table, sheet, scrubber, pager, meta grid, screenshot plane — each on a stand-in scene.',
  render: () => (
    <div className="flex flex-col gap-14 py-8">
      {/* One table and one state: browse-all is not a view any more, so
          there is no second board to draw. The capture goes in the stage's
          own rail, which is what narrows the column beside it. */}
      <Frame
        caption="1b/1c — every project, with a row's capture in the rail"
        id="spec-table-all"
      >
        <SceneStage
          align="top"
          plane={
            <ScreenshotPlane
              alt="Ubiquiti Local Device Settings"
              caption="device settings · rgb-split wave shader"
              src="/ubiquiti_settings.webp"
              tilt={-16}
            />
          }
          planeFold={false}
          vignette="sheet"
        >
          <Text
            className="text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] text-fg-2"
            variant="detail"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempor.
          </Text>
          <ProjectTable
            activeId="settings"
            count="14"
            eyebrow="all projects"
            rows={ALL}
          />
        </SceneStage>
      </Frame>

      <Frame
        caption="1e — right sheet + scrubber, over the night wash"
        id="spec-sheet-right"
      >
        <SceneStage
          footer={
            <Scrubber
              controls={CONTROLS}
              selectedIndex={3}
              stops={STOPS}
            />
          }
          vignette="night"
        >
          <div className="flex justify-end">
            <Sheet
              eyebrow="stop 04 / 06"
              label="software engineer"
              meta="Portland OR · Dec 2018 — Jan 2020"
              pager={
                <Pager
                  grow
                  next={{ href: '#', label: 'Freelancing' }}
                  prev={{ href: '#', label: 'Nike' }}
                />
              }
              title="Ubiquiti"
            >
              Hardware interfaces: local device settings, the device
              setup flow and the device portal — 100,000+ users.
            </Sheet>
          </div>
        </SceneStage>
      </Frame>

      <Frame
        caption="1h — bottom sheet, the scrubber folded inside it"
        id="spec-sheet-bottom"
      >
        <div className="absolute inset-0 bg-[var(--vignette-night)]" />
        <div className="absolute inset-x-0 bottom-0">
          <Sheet
            eyebrow="stop 04 / 06"
            label="software engineer"
            meta="Portland OR · Dec 2018 — Jan 2020"
            pager={
              <Pager
                grow
                next={{ href: '#', label: 'Freelancing' }}
                prev={{ href: '#', label: 'Nike' }}
              />
            }
            placement="bottom"
            title="Ubiquiti"
          >
            Hardware interfaces: device settings, setup flow and
            portal — 100,000+ users.
            <div className="pt-4">
              <Scrubber selectedIndex={3} stops={STOPS} />
            </div>
          </Sheet>
        </div>
      </Frame>

      <Frame
        caption="1d — screenshot plane, meta grid and pager"
        id="spec-plane"
      >
        <SceneStage
          plane={
            <ScreenshotPlane
              alt="GoPro Mountain Games Event Map"
              caption="event map sheet · rgb-split wave shader"
              src="/gopro.webp"
            />
          }
          vignette="sheet"
        >
          <Text
            className="text-[length:var(--type-heading2-size)] leading-[1.22] font-[number:var(--weight-light)] text-fg-2"
            variant="heading2"
          >
            GoPro Mountain Games Event Map
          </Text>
          <MetaGrid
            items={[
              { label: 'client', value: '970 Design' },
              { label: 'year', value: 2017 },
              { label: 'product', value: 'Event map' },
            ]}
          />
          <Pager
            next={{ href: '#', label: '3d asset viewer' }}
            prev={{ href: '#', label: 'sports events finder' }}
          />
        </SceneStage>
      </Frame>
    </div>
  ),
};

export default composed;
