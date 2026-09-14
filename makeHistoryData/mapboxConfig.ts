import type { MapOptions } from 'mapbox-gl';
import { BOUNDS_PADDING } from '../constants/map.ts';

// Options for the history map, written to public/history/mapConfig.json by
// index.mts (which adds the bounds). The access token is deliberately not
// here: the app reads it from NEXT_PUBLIC_MAPBOX_TOKEN at build time, so no
// token is committed to the repo (see .env.example and the README).
const mapboxConfig = {
  minZoom: 7,
  maxZoom: 12,
  bearing: 0,
  pitch: 120,
  style:
    'mapbox://styles/chiefkleef/ck8yx5uws03fh1ir30w1qkprd?optimize=true',
  attributionControl: false,
  fitBoundsOptions: {
    padding: BOUNDS_PADDING,
  },
} satisfies Partial<MapOptions>;

export default mapboxConfig;
