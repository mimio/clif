export default {
  main: {
    id: 'main',
    type: 'circle',
    source: 'main',
    paint: {
      'circle-radius': 7,
      'circle-color': { type: 'identity', property: 'CategoryColor' },
      'circle-stroke-width': 0.8,
      'circle-stroke-color': 'white',
      'circle-stroke-opacity': 0.4,
    },
  },
};
