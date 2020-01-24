import React, { Component } from 'react';
import { geoOrthographic, geoPath } from 'd3';
import { feature } from 'topojson';
import lands from './ne110m_land.json';

const geojson = feature(lands, lands.objects.land);

export default class Globe extends Component {
  state = {
    rotation: 0,
  };

  componentDidMount() {
    window.requestAnimationFrame(() => {
      this.setState(({ rotation }) => ({
        rotation: rotation + 0.2,
      }));
    });
  }

  render() {
    const projection = geoOrthographic()
      .fitSize([500, 500], geojson)
      .rotate([this.state.rotation]);

    console.log(projection);

    const geoGenerator = geoPath().projection(projection);

    const pathString = geoGenerator(geojson);

    return (
      <svg width={500} height={500}>
        <path d={pathString} />
      </svg>
    );
  }
}
