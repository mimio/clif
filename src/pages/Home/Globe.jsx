import React, { Component } from 'react';
import styled from '@emotion/styled';
import { getStyle } from 'styles';
import { geoOrthographic, geoPath } from 'd3';
import { feature } from 'topojson';
import lands from './ne110m_land.json';

const continents = feature(lands, lands.objects.land);
const countries = feature(lands, lands.objects.countries);

const geojson = {
  ...countries,
  features: [continents, ...countries.features],
};

const Svg = styled.svg`
  fill: transparent;
  stroke: ${getStyle('text2')};
  stroke-width: 0.2;
`;

export default class Globe extends Component {
  state = {
    rotation: 1000,
  };

  componentDidMount() {
    this.interval = setInterval(
      () =>
        this.setState(({ rotation }) => ({
          rotation: rotation + 0.3,
        })),
      50,
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const projection = geoOrthographic()
      .fitSize([500, 500], geojson)
      .rotate([this.state.rotation]);

    const geoGenerator = geoPath().projection(projection);

    const pathString = geoGenerator(geojson);

    return (
      <Svg width="100%" height="100%" viewBox="40 20 400 400">
        <path d={pathString} />
      </Svg>
    );
  }
}
