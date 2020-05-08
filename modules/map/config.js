import { BOUNDS_PADDING } from 'constants/map';

export const config = {
  accessToken:
    'pk.eyJ1IjoiY2hpZWZrbGVlZiIsImEiOiJjaWhkbnE5cGEwYnltdnFrbHBwaHd0NXhuIn0.SXxGsE9D61dU7gWmWEV71Q',
  maxZoom: 18,
  bearing: 0,
  pitch: 120,
  style: 'mapbox://styles/chiefkleef/ck8yx5uws03fh1ir30w1qkprd',
  attributionControl: false,
  fitBoundsOptions: {
    padding: BOUNDS_PADDING,
  },
};
