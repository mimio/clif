import React, { Component, createRef } from 'react';
import styled from '@emotion/styled';
import mapboxgl from 'mapbox-gl';
import { setMap } from 'utils/map';
import 'mapbox-gl/dist/mapbox-gl.css';

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

  mapLoaded = false;

  map = null;

  componentDidUpdate(prevProps) {
    const {
      mapConfig: { prevMapConfig },
    } = prevProps;

    if (this.props.mapConfig && !prevMapConfig && !this.mapLoaded) {
      this.initialize();
    }
  }

  initialize = () => {
    const { mapConfig } = this.props;
    if (this.mapLoaded) return;
    this.map = setMap(
      new mapboxgl.Map({
        ...mapConfig,
        container: this.mapRef.current,
      }),
    );

    this.map.on('load', this.onMapLoaded);
  };

  addLayers = () => {
    const { mapLayers, hoverFeature, unhoverFeature } = this.props;
    mapLayers.forEach(layer => {
      this.map.addLayer(layer);
      this.map.on('mousemove', layer.id, hoverFeature);
      this.map.on('mouseleave', layer.id, unhoverFeature);
    });
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

  onMapLoaded = () => {
    this.addLayers();
    this.map.on('idle', () => {
      this.mapLoaded = true;
    });
  };

  render() {
    return (
      <MapContainer>
        <div id="mapbox-map" ref={this.mapRef} />
      </MapContainer>
    );
  }
}

export default Map;
