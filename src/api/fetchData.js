// import data from '../../data/trailData.json';

const url =
  'https://sageoutdooradventures.com/wp-json/maps-api/locations';

const type = {
  point: 'Point',
  line: 'LineString',
  area: 'Polygon',
};

export const fetchData = async () => {
  const resp = await fetch(url);
  const json = await resp.json();

  const fixed = Object.entries(json).reduce((acc, [k, v]) => {
    // eslint-disable-next-line no-param-reassign
    acc[k] = {
      ...v,
      source: type[v.type], // todo: this is a hack to get selection working
    };
    return acc;
  }, {});
  return fixed;
};
