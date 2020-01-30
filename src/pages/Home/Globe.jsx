import React, { Component } from 'react';
import { get } from 'lodash-es';
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

const bufferChange = (val, oldVal) => {
  const difference = oldVal - val;
  const max = 0.3;
  const smallerChange = difference < 0 ? max : -max;
  return Math.abs(difference) > max ? oldVal + smallerChange : val;
};

const Svg = styled.svg`
  fill: transparent;
  stroke: ${getStyle('text2')};
  stroke-width: 0.2;
`;

export default class Globe extends Component {
  coords = [0, 0];

  translateX = 200;

  rotationY = 0;

  translateY = 200;

  state = {
    rotationX: 1000,
  };

  componentDidMount() {
    this.interval = setInterval(this.rotate, 20);
    this.mouseListener = window.addEventListener(
      'mousemove',
      this.onMouseMove,
    );
    this.touchListener = window.addEventListener(
      'touchmove',
      this.onTouchMove,
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    window.removeEventListener('touchmove', this.touchListener);
    window.removeEventListener('mousemove', this.mouseListener);
  }

  // rotation drives this animation -- putting mouse movement on component state froze animation so opted to set cursor related state on a non-state object
  rotate = () => {
    const change = this.coords[0] >= 0 ? 0.1 : -0.1;
    this.setState(({ rotationX }) => ({
      rotationX: rotationX + change,
    }));
  };

  onTouchMove = e => {
    const { clientX, clientY } = get(e, 'touches[0]');
    if (!clientX || !clientY) return;
    this.coords = normalizeCursorLocation([clientX, clientY]);
  };

  onMouseMove = ({ clientX, clientY }) => {
    this.coords = normalizeCursorLocation([clientX, clientY]);
  };

  getPathString = () => {
    const { rotationX } = this.state;
    const globeSize = 400;

    this.rotationY = bufferChange(this.coords[1] * 8, this.rotationY);
    this.translateX = bufferChange(
      globeSize / 2 + this.coords[0] * 4,
      this.translateX,
    );
    this.translateY = bufferChange(
      globeSize / 2 + this.coords[1] * 8,
      this.translateY,
    );

    const projection = geoOrthographic()
      .fitSize([globeSize, globeSize], geojson)
      .rotate([rotationX, this.rotationY])
      .translate([this.translateX, this.translateY]);

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
