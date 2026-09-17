import { anchors } from 'content/anchors';

export type FogPreset = 'space' | 'dusk' | 'night';

export type CameraSpec = {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  /** Terrain exaggeration, or null for a flat globe. */
  terrain: number | null;
  fog: FogPreset;
  /** False on the detail route, where the map is HELD. */
  interactive: boolean;
  /** Degrees of bearing per frame, or null for a still camera. */
  spin: number | null;
};

/** Every scene the camera has a resting position for. */
export type SceneId =
  'hello' | 'projects' | 'projectDetail' | 'about' | 'notFound';

/*
 * Values are the ARTBOARD numbers from design inventory §6.2, which
 * supersede the scene-cameras card wherever the two disagree.
 *
 * The one real conflict is `projects`. The card says
 * centre -100.200, 39.600 / zoom 3.4 / pitch 55 / bearing -20, with the
 * hover state at zoom 3.9. Every artboard (1b, 1c desktop; 1g mobile) says
 * -98, 39 / zoom 2.6 / pitch 25 / bearing -12, and describes the hover as a
 * nudge 8% toward the anchor rather than a zoom step. The artboards win.
 *
 * Mobile variants, also from §6.2, are not separate scenes: hello drops to
 * zoom 1.4, projects to 2.2/pitch 20, about to 10.2/pitch 55 with terrain
 * exaggeration 1.0. The scene layer applies those; they are not routes.
 */
export const cameras: Record<SceneId, CameraSpec> = {
  hello: {
    center: [-122.7, 45.5],
    zoom: 1.6,
    pitch: 0,
    bearing: 0,
    terrain: null,
    fog: 'space',
    interactive: true,
    // One revolution per four minutes, at 60fps.
    spin: 0.0015,
  },
  projects: {
    center: [-98.0, 39.0],
    zoom: 2.6,
    pitch: 25,
    bearing: -12,
    terrain: null,
    fog: 'dusk',
    interactive: true,
    spin: null,
  },
  projectDetail: {
    // Overridden per project with the client city; 1d's gopro is the default.
    center: [-106.355, 39.641],
    zoom: 10,
    pitch: 60,
    bearing: -20,
    terrain: 1.4,
    fog: 'night',
    // The one route where the camera is not yours: drag, scroll-zoom and
    // rotate are all off and the readout reads HELD.
    interactive: false,
    spin: null,
  },
  about: {
    center: [-122.658, 45.512],
    zoom: 10.5,
    pitch: 60,
    bearing: -12,
    terrain: 1.4,
    fog: 'night',
    interactive: true,
    spin: null,
  },
  notFound: {
    // No 404 artboard exists; these are the card's values, the only ones.
    center: [-122.7, 45.5],
    zoom: 0.8,
    pitch: 0,
    bearing: 0,
    terrain: null,
    fog: 'space',
    interactive: true,
    spin: 0.0015,
  },
};

export type FogSpec = {
  /** Mapbox fog `range`, in units of the camera's field of view. */
  range: [number, number];
  color: string;
  highColor: string;
};

export const fogPresets: Record<FogPreset, FogSpec> = {
  space: {
    range: [0.6, 12],
    color: '#161616',
    highColor: 'rgba(255, 229, 32, 0.2)',
  },
  dusk: {
    range: [0.4, 6],
    color: '#1b1a14',
    highColor: 'rgba(255, 229, 32, 0.3)',
  },
  night: {
    range: [0.2, 4],
    color: '#121212',
    highColor: 'rgba(255, 229, 32, 0.12)',
  },
};

/** Every route change is an easeTo on this curve (900ms into the detail). */
export const SCENE_MOVE_MS = 800;
export const SCENE_MOVE_LONG_MS = 900;
export const SCENE_EASE: [number, number, number, number] = [
  0.65, 0, 0.35, 1,
];
/** The foreground starts entering once the scene is this far through. */
export const SCENE_HANDOFF = 0.6;

/** Re-centres a camera on one of the city anchors, keeping its framing. */
export const cameraAtAnchor = (
  spec: CameraSpec,
  anchorId: keyof typeof anchors,
): CameraSpec => ({ ...spec, center: anchors[anchorId].center });
