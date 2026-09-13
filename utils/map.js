export const setMap = (mapboxMap) => {
  globalThis.map = mapboxMap;
  return globalThis.map;
};

export const getMap = () => globalThis.map;
