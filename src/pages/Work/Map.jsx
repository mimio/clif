import React, { Component, createRef } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getStyle } from 'styles';
import { Full } from 'components';
import { setMap } from 'utils/map';

const MapContainer = styled(Full)`
  .mapboxgl-map {
    height: 100%;
    width: 100%;
  }
  .mapboxgl-popup {
    width: ${getStyle('popupWidth')};
    height: ${getStyle('popupMaxHeight')};
  }
  .mapboxgl-popup-content {
    padding: 0;
  }
  .mapboxgl-popup-tip {
    display: none;
  }
`;

class Map extends Component {
  mapRef = createRef();

  map = null;

  static propTypes = {
    clearSelection: PropTypes.func.isRequired,
    hoverFeature: PropTypes.func.isRequired,
    mapConfig: PropTypes.object,
    mapLayers: PropTypes.array.isRequired,
    mapLoaded: PropTypes.func.isRequired,
    selectFeature: PropTypes.func.isRequired,
    unhoverFeature: PropTypes.func.isRequired,
  };

  static defaultProps = {
    mapConfig: {},
  };

  componentDidMount() {
    this.initialize();
  }

  initialize = () => {
    const { mapConfig } = this.props;
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

  getLayer = id =>
    new Promise(resolve => {
      const resolver = () => {
        const layer = this.map.getLayer(id);
        resolve(layer);
        this.map.off('idle', resolver);
      };
      this.map.on('idle', resolver);
    });

  onMapLoaded = () => {
    const { clearSelection, mapLoaded, mapLayers } = this.props;
    this.addLayers();
    // this.addControls();
    this.map.on('idle', () => mapLoaded());
    this.map.on('click', e => {
      if (
        this.map.queryRenderedFeatures(e.point, {
          layers: mapLayers.map(layer => layer.id),
        }).length === 0
      )
        clearSelection();
    });
  };

  render() {
    const { className, css } = this.props;

    return (
      <MapContainer className={className} css={css}>
        <div id="mapbox-map" ref={this.mapRef} />
      </MapContainer>
    );
  }
}

export default Map;
