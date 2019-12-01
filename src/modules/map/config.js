import { desktopPadding } from 'constants/map';

export const config = {
  accessToken: __MAPBOX_KEY__,
  maxZoom: 18,
  zoom: 5.6,
  center: [-83.03721979999995, 34.30808378645919],
  bearing: 0,
  fitBoundsOptions: {
    padding: desktopPadding,
    duration: 0,
  },
};
