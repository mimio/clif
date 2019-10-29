/* eslint no-param-reassign:0 */
const fs = require('fs-extra');
const path = require('path');
const randomColor = require('random-color');

const files = [
  path.resolve(__dirname, '../data/trails.geojson'),
  path.resolve(__dirname, '../data/waypoints.geojson'),
];

let featId = 0;

async function convert() {
  const features = {};
  await Promise.all(
    files.flatMap(async file => {
      const json = await fs.readJson(file);

      return json.features.reduce((acc, curr) => {
        const { name: Name, miles } = curr.properties;
        const { type, coordinates } = curr.geometry;
        const UID = featId;
        const color = randomColor();
        acc[UID] = {
          UID,
          Name,
          miles,
          type,
          coordinates,
          color: color.hexString(),
        };
        featId += 1;
        return acc;
      }, features);
    }),
  );
  console.log(Object.keys(features).length);

  const fp = path.resolve(__dirname, '../data/trailData.json');
  fs.outputJSONSync(fp, features);
}

convert();

// takes a geojson and converts it to the agreed upon format for data
// Name, Category, UID, Longitude, Latitude, PageLink, ShortDescription, OfficialVendor
