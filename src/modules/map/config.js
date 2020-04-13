import { BOUNDS_PADDING } from 'constants/map';

export const config = {
  accessToken: __MAPBOX_KEY__,
  maxZoom: 18,
  bearing: 0,
  pitch: 34,
  style: 'mapbox://styles/chiefkleef/ck8yx5uws03fh1ir30w1qkprd',
  attributionControl: false,
  fitBoundsOptions: {
    padding: BOUNDS_PADDING,
  },
};
