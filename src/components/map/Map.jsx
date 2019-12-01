import React, { Component, createRef } from 'react';
import styled from '@emotion/styled';
import mapboxgl from 'mapbox-gl';
import { setMap } from 'utils/map';
import 'mapbox-gl/dist/mapbox-gl.css';
import Controls from './controls';

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

  componentDidUpdate(prevProps) {
    const { isMapLoaded: wasMapLoaded } = prevProps;
    if (!wasMapLoaded && !this.props.isMapLoaded) {
      this.initialize();
    }
  }

  initialize = () => {
    const { mapConfig, isMapLoaded } = this.props;
    if (isMapLoaded) return;
    this.map = setMap(
      new mapboxgl.Map({
        ...mapConfig,
        container: this.mapRef.current,
      }),
    );

    this.map.on('load', this.onMapLoaded);
  };

  addLayers = () => {
    const {
      mapLayers,
      hoverFeature,
      unhoverFeature,
      selectFeature,
    } = this.props;
    mapLayers.forEach(layer => {
      this.map.addLayer(layer);
      this.map.on('mousemove', layer.id, hoverFeature);
      this.map.on('mouseleave', layer.id, unhoverFeature);
      this.map.on('click', layer.id, selectFeature);
    });
  };

  addControls = () =>
    this.map.addControl(
      new mapboxgl.NavigationControl(),
      'top-right',
    );

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
    const { mapLoaded } = this.props;
    this.addLayers();
    this.addControls();
    this.map.on('idle', () => {
      mapLoaded();
    });
  };

  render() {
    const { className, css } = this.props;
    return (
      <MapContainer className={className} css={css}>
        <div id="mapbox-map" ref={this.mapRef} />
        <Controls />
      </MapContainer>
    );
  }
}

export default Map;
