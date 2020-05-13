const mapConstants = require('../constants/map');

module.exports = {
  accessToken:
    'pk.eyJ1IjoiY2hpZWZrbGVlZiIsImEiOiJjaWhkbnE5cGEwYnltdnFrbHBwaHd0NXhuIn0.SXxGsE9D61dU7gWmWEV71Q',
  minZoom: 7,
  maxZoom: 12,
  bearing: 0,
  pitch: 120,
  style:
    'mapbox://styles/chiefkleef/ck8yx5uws03fh1ir30w1qkprd?optimize=true',
  attributionControl: false,
  fitBoundsOptions: {
    padding: mapConstants.BOUNDS_PADDING,
  },
};
