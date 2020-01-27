/* eslint import/no-mutable-exports: 0 */

export const setMap = mapboxMap => {
  global.map = mapboxMap;
  return global.map;
};

export const getMap = () => global.map;
