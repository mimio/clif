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
    this.map.on('load', this.onMapLoaded);
  }

  componentDidUpdate(prevProps) {
    const { geojson: prevGeoJson } = prevProps;
    const { geojson } = this.props;
    if (geojson.features.length !== prevGeoJson.features.length) {
      this.updateData();
    }
  }

  addLayers = () => {
    const { mapLayers } = this.props;
    this.map.addLayer(mapLayers);
  };

  getLayer = id =>
    new Promise(resolve => {
      const resolver = () => {
        const layer = this.map.getLayer(id);
        resolve(layer);
        this.map.off('idle', resolver);
      };
      this.map.on('idle', resolver);
    });

  // todo: move into utils? safe getSource/getLayer
  // wait until map is idle (all is loaded) before
  // trying to access source / layer
  getSource = id =>
    new Promise(resolve => {
      const resolver = () => {
        const source = this.map.getSource(id);
        resolve(source);
        this.map.off('idle', resolver);
      };
      this.map.on('idle', resolver);
    });

  updateData = async () => {
    // const { geojson } = this.props;
    // Object.keys(layers).forEach(async k => {
    //   const source = await this.getSource(k);
    //   source.setData(geojson);
    // });
  };

  onMapLoaded = () => {
    this.addLayers();
  };

  render() {
    return (
      <MapContainer>
        <div ref={this.mapRef} />
      </MapContainer>
    );
  }
}

export default Map;
