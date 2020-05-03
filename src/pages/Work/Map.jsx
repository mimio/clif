import React, { Component, createRef } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getBool, getStyle } from 'styles';
import { Full } from 'components';
import { setMap } from 'utils/map';

const StyledMap = styled(Full)`
  z-index: 1;
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
    background: none;
  }
  .mapboxgl-popup-tip,
  .mapboxgl-ctrl-logo {
    display: none;
  }
  opacity: 0.3;
  transform: scale(1.1);
  ${getBool(
    'reveal',
    `
    @keyframes zoomin {
      from {
        opacity: 0.3;
        transform: scale(1.05);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    animation: 0.4s ease-out forwards zoomin;
  `,
  )};
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
    reveal: PropTypes.bool.isRequired,
    resetMap: PropTypes.func.isRequired,
  };

  static defaultProps = {
    mapConfig: {},
  };

  componentDidMount() {
    this.initialize();
  }

  shouldComponentUpdate({ isMapLoaded, reveal }) {
    return (
      (isMapLoaded && !this.props.isMapLoaded) ||
      reveal !== this.props.reveal
    );
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
    mapLayers.forEach((layer) => {
      this.map.addLayer(layer);
      this.map.on('mousemove', layer.id, hoverFeature);
      this.map.on('mouseleave', layer.id, unhoverFeature);
      this.map.on('click', layer.id, selectFeature);
    });
  };

  getLayer = (id) =>
    new Promise((resolve) => {
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
    this.map.on('idle', () => setMapLoaded(true));
    this.map.on('click', (e) => {
      if (
        this.map.queryRenderedFeatures(e.point, {
          layers: mapLayers.map((layer) => layer.id),
        }).length === 0
      )
        clearSelection();
    });
  };

  render() {
    const { className, css, isMapLoaded, reveal } = this.props;

    return (
      <StyledMap
        isLoaded={isMapLoaded}
        className={className}
        css={css}
        ref={this.mapRef}
        reveal={reveal}
      />
    );
  }
}

export default Map;
