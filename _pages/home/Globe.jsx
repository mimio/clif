import React, { Component } from 'react';
import get from 'lodash.get';
import * as d3 from 'd3';
import styled from '@emotion/styled';

const normalizeCursorLocation = ([x, y]) => {
  const { innerWidth, innerHeight } = window;
  const _x = (x - innerWidth / 2) / (innerWidth / 2);
  const _y = -(y - innerHeight / 2) / (innerHeight / 2);
  return [_x, _y];
};

const bufferChange = (val, oldVal) => {
  const difference = oldVal - val;
  const max = 0.1;
  const smallerChange = difference < 0 ? max : -max;
  return Math.abs(difference) > max ? oldVal + smallerChange : val;
};

const Canvas = styled.canvas`
  fill: transparent;
`;

export default class Globe extends Component {
  coords = [0, 0];

  rotationY = 0;

  state = {
    size: 0,
  };

  componentDidMount() {
    const { countries } = this.props;

    const size =
      Math.max(window.innerHeight, window.innerWidth) + 200;
    this.setState({ size });
    this.translateX = size / 2;
    this.translateY = size / 2;
    this.rotationX = size;

    const svg = d3.select('#globe');
    const context = svg.node().getContext('2d');
    const projection = d3
      .geoOrthographic()
      .fitSize([size, size], countries)
      .rotate([this.rotationX, this.rotationY])
      .clipAngle(180)
      .translate([this.translateX, this.translateY]);
    const path = d3.geoPath().projection(projection).context(context);
    this.timer = d3.timer(() => {
      const change = this.coords[0] >= 0 ? -0.02 : 0.02;
      this.rotationX += change;
      this.rotationY = bufferChange(this.coords[1], this.rotationY);
      this.translateX = bufferChange(
        size / 2 + this.coords[0],
        this.translateX,
      );
      this.translateY = bufferChange(
        size / 2 + this.coords[1],
        this.translateY,
      );
      projection
        .rotate([this.rotationX, this.rotationY])
        .translate([this.translateX, this.translateY]);
      context.clearRect(0, 0, size, size);
      context.beginPath();
      path(countries);
      context.fillStyle = '#111';
      context.fill();
      context.lineWidth = 0.5;
      context.strokeColor = '#000';
      context.stroke();
    });

    this.mouseListener = window.addEventListener(
      'mousemove',
      this.onGlobalMouseMove,
    );
    this.touchListener = window.addEventListener(
      'touchmove',
      this.onGlobalTouchMove,
    );
  }

  componentWillUnmount() {
    window.removeEventListener('touchmove', this.touchListener);
    window.removeEventListener('mousemove', this.mouseListener);
    this.timer.stop();
  }

  onGlobalTouchMove = (e) => {
    const { clientX, clientY } = get(e, 'touches[0]');
    if (!clientX || !clientY) return;
    this.coords = normalizeCursorLocation([clientX, clientY]);
  };

  onGlobalMouseMove = ({ clientX, clientY }) => {
    this.coords = normalizeCursorLocation([clientX, clientY]);
  };

  getPathString = () => {};

  render() {
    const { size } = this.state;
    return (
      <Canvas
        id="globe"
        width={`${size}`}
        height={`${size}`}
        viewBox={`0 0 ${size} ${size}`}
      />
    );
  }
}
