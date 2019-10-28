import React, { Component, createRef } from 'react';
import styled from '@emotion/styled';
import mapboxgl from 'mapbox-gl';
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

  hoveredFeature = null;

  map = null;

  componentDidUpdate(prevProps) {
    const {
      geojson: prevGeoJson,
      mapConfig: { prevMapConfig },
    } = prevProps;

    const { geojson } = this.props;
    if (this.props.mapConfig && !prevMapConfig) {
      this.initialize();
    }
    if (geojson.features.length !== prevGeoJson.features.length) {
      this.updateData();
    }
  }

  initialize = () => {
    const { mapConfig, mapLayers } = this.props;
    const layerIds = mapLayers.map(layer => layer.id);
    console.log(layerIds);
    this.map = new mapboxgl.Map({
      ...mapConfig,
      container: this.mapRef.current,
    });
    this.map.on('load', this.onMapLoaded);
    this.map.on('mousemove', 'trails', this.onMouseMove);
    this.map.on('mousemove', 'waypoints', this.onMouseMove);
    this.map.on('mouseleave', 'trails', () =>
      this.onMouseLeave('trails'),
    );
    this.map.on('mouseleave', 'waypoints', () =>
      this.onMouseLeave('waypoints'),
    );
  };

  addLayers = () => {
    const { mapLayers } = this.props;
    mapLayers.forEach(layer => this.map.addLayer(layer));
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
    this.map.on('idle', () => {
      this.mapLoaded = true;
    });
  };

  updateCursor = (pointer = false) => {
    this.map.getCanvas().style.cursor = pointer
      ? 'pointer'
      : 'initial';
  };

  onMouseMove = e => {
    if (!this.mapLoaded) return;
    const feature = e.features[0];

    this.updateCursor();
    if (feature) {
      if (this.hoveredFeature) {
        this.map.setFeatureState(
          {
            source: feature.source,
            id: this.hoveredFeature,
          },
          { hover: false },
        );
        this.hoveredFeature = null;
      }

      this.updateCursor(true);
      this.hoveredFeature = feature.id;

      this.map.setFeatureState(
        { source: feature.source, id: this.hoveredFeature },
        { hover: true },
      );
    }
  };

  onMouseLeave = layer => {
    if (this.hoveredFeature) {
      this.updateCursor(false);
      this.map.setFeatureState(
        { source: layer, id: this.hoveredFeature },
        { hover: false },
      );
    }
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
