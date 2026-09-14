import { Component } from 'react';
import {
  geoPath,
  geoOrthographic,
  select,
  timer,
  type Timer,
} from 'd3';
import { feature } from 'topojson-client';
import type {
  Topology,
  MultiPolygon as TopoMultiPolygon,
} from 'topojson-specification';
import type { Feature, MultiPolygon } from 'geojson';
import styled from '@emotion/styled';

type Land = Feature<MultiPolygon>;

// The Natural Earth 110m land topology is about 200 KB, so it is not part of
// the page's props. It loads after mount as its own content-hashed chunk,
// which the browser caches across visits, and the land object is a single
// MultiPolygon so feature() yields one Feature.
const loadLand = async (): Promise<Land> => {
  const { default: json } = await import('./ne110m_land.json');
  const topology = json as unknown as Topology;
  return feature(topology, topology.objects.land as TopoMultiPolygon);
};

const normalizeCursorLocation = ([x, y]: [number, number]): [
  number,
  number,
] => {
  const { innerWidth, innerHeight } = window;
  const nx = (x - innerWidth / 2) / (innerWidth / 2);
  const ny = -(y - innerHeight / 2) / (innerHeight / 2);
  return [nx, ny];
};

const bufferChange = (val: number, oldVal: number): number => {
  const difference = oldVal - val;
  const max = 0.1;
  const smallerChange = difference < 0 ? max : -max;
  return Math.abs(difference) > max ? oldVal + smallerChange : val;
};

const Canvas = styled.canvas`
  fill: transparent;
`;

type GlobeState = {
  size: number;
};

export default class Globe extends Component<object, GlobeState> {
  coords: [number, number] = [0, 0];

  rotationX = 0;

  rotationY = 0;

  translateX = 0;

  translateY = 0;

  timer: Timer | null = null;

  unmounted = false;

  state: GlobeState = {
    size: 0,
  };

  componentDidMount() {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchmove', this.onTouchMove);

    const size =
      Math.max(window.innerHeight, window.innerWidth) + 200;
    this.setState({ size });
    this.translateX = size / 2;
    this.translateY = size / 2;
    this.rotationX = size;

    loadLand().then(
      (land) => {
        if (!this.unmounted) this.draw(land, size);
      },
      (error: unknown) => {
        // The globe is a decorative background; leave it blank.
        console.warn('Globe: land topology failed to load', error);
      },
    );
  }

  componentWillUnmount() {
    this.unmounted = true;
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.timer?.stop();
  }

  onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch || !touch.clientX || !touch.clientY) return;
    this.coords = normalizeCursorLocation([
      touch.clientX,
      touch.clientY,
    ]);
  };

  onMouseMove = ({ clientX, clientY }: MouseEvent) => {
    this.coords = normalizeCursorLocation([clientX, clientY]);
  };

  draw(land: Land, size: number) {
    const canvas = select<HTMLCanvasElement, unknown>(
      '#globe',
    ).node();
    const context = canvas?.getContext('2d');
    if (!context) return;
    const projection = geoOrthographic()
      .fitSize([size, size], land)
      .rotate([this.rotationX, this.rotationY])
      .clipAngle(180)
      .translate([this.translateX, this.translateY]);

    const path = geoPath().projection(projection).context(context);

    this.timer = timer(() => {
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
      path(land);
      context.fillStyle = '#111';
      context.fill();
      context.lineWidth = 0.5;
      context.strokeStyle = '#000';
      context.stroke();
    });
  }

  render() {
    const { size } = this.state;
    return <Canvas id="globe" width={size} height={size} />;
  }
}
