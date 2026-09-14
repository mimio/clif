type MapboxGl = typeof import('mapbox-gl');

// mapbox-gl touches `window` at import time, so it is only loaded in the
// browser; on the server this module exports an empty stand-in that pages
// never call into.
const mapboxgl: MapboxGl =
  typeof window !== 'undefined'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('mapbox-gl') as MapboxGl)
    : ({} as MapboxGl);

export default mapboxgl;
