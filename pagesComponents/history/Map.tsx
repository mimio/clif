import { Component, createRef } from 'react';
import styled from '@emotion/styled';
import type { Interpolation, Theme } from '@emotion/react';
import type { Map as MapboxMap, MapMouseEvent } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl-ssr';
import mapLayers from 'public/history/mapLayers.json';
import mapLayerIds from 'public/history/mapLayerIds.json';
import mapConfig from 'public/history/mapConfig.json';
import { MAP_PITCH } from 'constants/map';
import { getBool, getStyle } from 'styles/utils';
import { Full } from 'components/layout';
import { setMap } from 'utils/map';

// The layer type accepted by Map#addLayer, which allows inline sources.
type MapLayer = Parameters<MapboxMap['addLayer']>[0];

const layers = mapLayers as unknown as MapLayer[];
const layerIds = mapLayerIds as string[];

const StyledMap = styled(Full)<{
  isLoaded: boolean;
  reveal: boolean;
}>`
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

export type MapProps = {
  className?: string;
  css?: Interpolation<Theme>;
  clearSelection: () => void;
  hoverFeature: (event: MapMouseEvent) => void;
  isMapLoaded: boolean;
  setMapLoaded: (isLoaded: boolean) => void;
  selectFeature: (event: MapMouseEvent) => void;
  unhoverFeature: () => void;
  reveal: boolean;
  resetMap: () => void;
};

class Map extends Component<MapProps> {
  mapRef = createRef<HTMLDivElement>();

  map: mapboxgl.Map | null = null;

  componentDidMount() {
    this.initialize();
  }

  shouldComponentUpdate({ isMapLoaded, reveal }: MapProps) {
    return (
      (isMapLoaded && !this.props.isMapLoaded) ||
      reveal !== this.props.reveal
    );
  }

  componentWillUnmount() {
    this.props.resetMap();
  }

  initialize = () => {
    if (!this.mapRef.current) return;
    this.map = setMap(
      new mapboxgl.Map({
        ...mapConfig,
        bounds: mapConfig.bounds as [number, number, number, number],
        // mapbox-gl >= 2.7 resets pitch to 0 in fitBounds(), which the
        // `bounds` option runs on construction, unless a pitch is given.
        pitch: MAP_PITCH,
        fitBoundsOptions: {
          ...mapConfig.fitBoundsOptions,
          pitch: MAP_PITCH,
        },
        container: this.mapRef.current,
      }),
    );

    this.map.on('load', this.onMapLoaded);
  };

  addLayers = () => {
    const { map } = this;
    if (!map) return;
    const { hoverFeature, unhoverFeature, selectFeature } =
      this.props;
    layers.forEach((layer) => {
      map.addLayer(layer);
      map.on('mousemove', layer.id, hoverFeature);
      map.on('mouseleave', layer.id, unhoverFeature);
      map.on('click', layer.id, selectFeature);
    });
  };

  onMapLoaded = () => {
    const { map } = this;
    if (!map) return;
    const { clearSelection, setMapLoaded } = this.props;
    this.addLayers();
    map.on('idle', () => setMapLoaded(true));
    map.on('click', (e) => {
      if (
        map.queryRenderedFeatures(e.point, { layers: layerIds })
          .length === 0
      )
        clearSelection();
    });
  };

  render() {
    const { className, css, isMapLoaded, reveal } = this.props;

    return (
      <StyledMap
        className={className}
        css={css}
        isLoaded={isMapLoaded}
        ref={this.mapRef}
        reveal={reveal}
      />
    );
  }
}

export default Map;
