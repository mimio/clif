import React, { Component } from 'react';
import get from 'lodash.get';
import { geoPath, geoOrthographic, select, timer } from 'd3';
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
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchmove', this.onTouchMove);
    this.initGlobe();
  }

  componentWillUnmount() {
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.timer.stop();
  }

  onTouchMove = (e) => {
    const { clientX, clientY } = get(e, 'touches[0]');
    if (!clientX || !clientY) return;
    this.coords = normalizeCursorLocation([clientX, clientY]);
  };

  onMouseMove = ({ clientX, clientY }) => {
    this.coords = normalizeCursorLocation([clientX, clientY]);
  };

  initGlobe() {
    return new Promise((res) => {
      const { countries } = this.props;

      const size =
        Math.max(window.innerHeight, window.innerWidth) + 200;
      this.setState({ size });
      this.translateX = size / 2;
      this.translateY = size / 2;
      this.rotationX = size;

      const svg = select('#globe');
      const context = svg.node().getContext('2d');
      const projection = geoOrthographic()
        .fitSize([size, size], countries)
        .rotate([this.rotationX, this.rotationY])
        .clipAngle(180)
        .translate([this.translateX, this.translateY]);

      const path = geoPath().projection(projection).context(context);

      this.timer = timer(async () => {
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
      res();
    });
  }

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
