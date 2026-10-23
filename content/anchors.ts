/*
 * The eight city anchors the scene flies between. Coordinates are [lng, lat],
 * taken verbatim from the design system's CITIES table (design inventory
 * §6.7). Hovering a project eases 600ms toward its anchor and lights that
 * point; the three Colorado sites collapse into one "Vail Valley" point at
 * world zoom and fan back out in the city view.
 */
export type AnchorId =
  | 'portland'
  | 'beaverton'
  | 'sanFrancisco'
  | 'cambridge'
  | 'vail'
  | 'beaverCreek'
  | 'wolcott'
  | 'newYork';

export type Anchor = {
  id: AnchorId;
  /** Uppercased on the map, title case in tables. */
  name: string;
  center: [number, number];
};

export const anchors: Record<AnchorId, Anchor> = {
  portland: {
    id: 'portland',
    name: 'Portland OR',
    center: [-122.68, 45.52],
  },
  beaverton: {
    id: 'beaverton',
    name: 'Beaverton OR',
    center: [-122.8, 45.49],
  },
  sanFrancisco: {
    id: 'sanFrancisco',
    name: 'San Francisco CA',
    center: [-122.42, 37.77],
  },
  cambridge: {
    id: 'cambridge',
    name: 'Cambridge MA',
    center: [-71.11, 42.37],
  },
  vail: { id: 'vail', name: 'Vail CO', center: [-106.36, 39.64] },
  beaverCreek: {
    id: 'beaverCreek',
    name: 'Beaver Creek CO',
    center: [-106.52, 39.6],
  },
  wolcott: {
    id: 'wolcott',
    name: 'Wolcott CO',
    center: [-106.67, 39.7],
  },
  newYork: {
    id: 'newYork',
    name: 'New York NY',
    center: [-74.0, 40.71],
  },
};

export const anchorList: Anchor[] = Object.values(anchors);

/** The collapsed world-zoom point the three Colorado anchors share. */
export const VAIL_VALLEY: Anchor = {
  id: 'beaverCreek',
  name: 'Vail Valley CO',
  center: [-106.52, 39.65],
};
