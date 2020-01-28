import { BOUNDS_PADDING } from 'constants/map';

export const config = {
  accessToken: __MAPBOX_KEY__,
  maxZoom: 18,
  bearing: 0,
  pitch: 34,
  style: 'mapbox://styles/chiefkleef/cihdnr5x000hm6vm5mcjpv36m',
  attributionControl: false,
  fitBoundsOptions: {
    padding: BOUNDS_PADDING,
  },
};
