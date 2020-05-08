let __ssr_safe__mapboxgl = {};

if (process.browser) {
  __ssr_safe__mapboxgl = require('mapbox-gl');
}

export default __ssr_safe__mapboxgl;
