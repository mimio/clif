import React, { Component, createRef } from 'react';
import styled from '@emotion/styled';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { config } from './config';

const MapContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  .mapboxgl-map {
    height: 100%;
    width: 100%;
  }
`;

class Map extends Component {
  mapRef = createRef();

  map = null;

  componentDidMount() {
    this.map = new mapboxgl.Map({
      ...config,
      container: this.mapRef.current,
    });
  }

  render() {
    return (
      <MapContainer>
        <div ref={this.mapRef} />
      </MapContainer>
    );
  }
}

export default Map;
