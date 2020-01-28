import React, { Component, createRef } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getBool, getStyle } from 'styles';
import { Full } from 'components';
import { setMap } from 'utils/map';

const MapContainer = styled(Full)`
  .mapboxgl-map {
    height: 100%;
    width: 100%;
    pointer-events: ${getBool('isLoaded', 'auto', 'none')};
  }
  .mapboxgl-popup {
    width: ${getStyle('popupWidth')};
    height: ${getStyle('popupMaxHeight')};
  }
  .mapboxgl-popup-content {
    padding: 0;
    box-shadow: 0 2px 4px rgba(180, 180, 180, 0.3);
    @keyframes slidein {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    animation: 0.22s linear forwards slidein;
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
    isMapLoaded: PropTypes.bool.isRequired,
    mapConfig: PropTypes.object,
    mapLayers: PropTypes.array.isRequired,
    setMapLoaded: PropTypes.func.isRequired,
    selectFeature: PropTypes.func.isRequired,
    unhoverFeature: PropTypes.func.isRequired,
    resetMap: PropTypes.func.isRequired,
  };

  static defaultProps = {
    mapConfig: {},
  };

  componentDidMount() {
    this.initialize();
  }

  componentWillUnmount() {
    this.props.resetMap();
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
    const { clearSelection, setMapLoaded, mapLayers } = this.props;
    this.addLayers();
    // this.addControls();
    this.map.on('idle', () => setMapLoaded(true));
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
    const { className, css, isMapLoaded } = this.props;

    return (
      <MapContainer
        isLoaded={isMapLoaded}
        className={className}
        css={css}
      >
        <div id="mapbox-map" ref={this.mapRef} />
      </MapContainer>
    );
  }
}

export default Map;
