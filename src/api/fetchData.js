// import data from '../../data/trailData.json';

const url = 'https://sageoutdooradventures.com/wp-json/maps-api/locations';

export const fetchData = async () => {
  const resp = await fetch(url);
  const json = await resp.json();
  
  
  return json;
};
