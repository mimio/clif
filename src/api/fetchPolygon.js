import { get } from 'lodash-es';
import OBJLoader from 'utils/OBJLoader';
import MTLLoader from 'utils/MTLLoader';



const API_KEY = 'AIzaSyAEDvi3k5FZP9oMX3Nls-Xa0HLYDhQVGjc';

const fetchToJson = (url, options) =>
  fetch(url, options).then(res => res.json());

export const loadPolyModel = async obj => new Promise (res => {
  const objLoader = new OBJLoader();
  const mtlLoader = new MTLLoader();

  if (obj.resources) {
    // objects with materials associated with them
    mtlLoader.load(obj.resources[0].url, async material => {
      objLoader.setMaterials(material);
      objLoader.load(obj.root.url, object => res(object));
    });
  } else {
    // object has no material
    objLoader.load(obj.root.url, object => res(object));
  }
});

export default async id => {
  const polygon = await fetchToJson(
    `https://poly.googleapis.com/v1/assets/${id}?key=${API_KEY}`,
  );
  const asset = get(polygon, 'formats[0]');
  if (!asset) return null;

  const model = await loadPolyModel(asset);

  return {
    ...asset,
    model,
  };
};
