// mapbox-gl touches `window` at import time, so only load it in the browser.
let mapboxgl = {};

if (typeof window !== 'undefined') {
  mapboxgl = require('mapbox-gl');
}

export default mapboxgl;
