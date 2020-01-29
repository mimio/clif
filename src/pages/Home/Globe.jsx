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

const normalizeCursorLocation = ([x, y]) => {
  const { innerWidth, innerHeight } = window;
  const _x = (x - innerWidth / 2) / (innerWidth / 2);
  const _y = -(y - innerHeight / 2) / (innerHeight / 2);
  return [_x, _y];
};

const Svg = styled.svg`
  fill: transparent;
  stroke: ${getStyle('text2')};
  stroke-width: 0.2;
`;

export default class Globe extends Component {
  coords = [0, 0];

  state = {
    rotationX: 1000,
  };

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState(({ rotationX }) => ({
        rotationX: rotationX + 0.1,
      }));
    }, 20);
    this.mouseListener = window.addEventListener(
      'mousemove',
      ({ clientX, clientY }) => {
        this.coords = normalizeCursorLocation([clientX, clientY]);
      },
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    window.removeEventListener('mousemove', this.mouseListener);
  }

  getPathString = () => {
    const { rotationX } = this.state;
    const globeSize = 400;
    const rotationY = this.coords[1] * 8;
    const translateX = globeSize / 2 + this.coords[0] * 4;
    const translateY = globeSize / 2 + this.coords[1] * 8;
    const projection = geoOrthographic()
      .fitSize([globeSize, globeSize], geojson)
      .rotate([rotationX, rotationY])
      .translate([translateX, translateY]);

    const geoGenerator = geoPath().projection(projection);
    return geoGenerator(geojson);
  };

  render() {
    return (
      <Svg width="100%" height="100%" viewBox="0 0 400 400">
        <path d={this.getPathString()} />
      </Svg>
    );
  }
}
