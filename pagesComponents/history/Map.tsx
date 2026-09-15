import { Component, createRef, useMemo } from 'react';
import styled from '@emotion/styled';
import type { Map as MapboxMap, MapMouseEvent } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl-ssr';
import mapConfig from 'public/history/mapConfig.json';
import { MAP_PITCH } from 'constants/map';
import {
  historyBounds,
  mapLayerIds,
  mapLayers,
} from 'constants/history';
import { getBool, getStyle } from 'styles/utils';
import { Full } from 'components/layout';
import { clearMap, setMap } from 'utils/map';
import { useAppDispatch, useAppSelector } from 'modules/hooks';
import {
  mapLoaded,
  mapReset,
  selectMapLoaded,
} from 'modules/map/mapSlice';
import {
  clearSelection,
  hoverFeature,
  selectFeature,
  unhoverFeature,
} from 'modules/map/mapThunks';

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

type MapCanvasProps = {
  className?: string;
  clearSelection: () => void;
  hoverFeature: (event: MapMouseEvent) => void;
  isMapLoaded: boolean;
  onMapLoaded: () => void;
  selectFeature: (event: MapMouseEvent) => void;
  unhoverFeature: () => void;
  reveal: boolean;
  resetMap: () => void;
};

// Mapbox owns its own DOM and needs the lifecycle hooks, so the canvas stays a
// class component; only the store wiring below moved to hooks.
class MapCanvas extends Component<MapCanvasProps> {
  mapRef = createRef<HTMLDivElement>();

  map: MapboxMap | null = null;

  componentDidMount() {
    this.initialize();
  }

  shouldComponentUpdate({ isMapLoaded, reveal }: MapCanvasProps) {
    return (
      (isMapLoaded && !this.props.isMapLoaded) ||
      reveal !== this.props.reveal
    );
  }

  componentWillUnmount() {
    // Store first, map second: the listener in modules/map/mapListeners.ts
    // reads selectMapLoaded after the reducer, and remove() can re-enter the
    // store itself — Mapbox's 'remove' event closes an open popup, whose
    // 'close' handler dispatches popupClosed — so both find it already reset.
    // The reverse order is not unsafe, since the listener would bail on the
    // cleared handle instead; it just leaves more moving parts to follow.
    this.props.resetMap();
    // React drops the container element, but the Mapbox instance it held owns
    // a WebGL context, a render loop, the window listeners it registered and
    // a slot in Mapbox's shared worker pool, none of which it gives up
    // without remove(). Skipping it stranded a context per visit to /history,
    // up to the browser's per-tab cap.
    this.map?.remove();
    this.map = null;
    clearMap();
  }

  initialize = () => {
    if (!this.mapRef.current) return;
    this.map = setMap(
      new mapboxgl.Map({
        ...mapConfig,
        // Inlined at build time; scripts/check-env.mts stops the build and
        // the dev server when it is missing.
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        bounds: historyBounds,
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

    this.map.on('load', this.handleMapLoad);
  };

  addLayers = () => {
    const { map } = this;
    if (!map) return;
    const { hoverFeature, unhoverFeature, selectFeature } =
      this.props;
    mapLayers.forEach((layer) => {
      map.addLayer(layer);
      map.on('mousemove', layer.id, hoverFeature);
      map.on('mouseleave', layer.id, unhoverFeature);
      map.on('click', layer.id, selectFeature);
    });
  };

  // Named apart from the `onMapLoaded` prop it calls: this runs on Mapbox's
  // own 'load' event, which fires before the first idle frame.
  handleMapLoad = () => {
    const { map } = this;
    if (!map) return;
    const { clearSelection, onMapLoaded } = this.props;
    this.addLayers();
    map.on('idle', onMapLoaded);
    map.on('click', (e) => {
      if (
        map.queryRenderedFeatures(e.point, { layers: mapLayerIds })
          .length === 0
      )
        clearSelection();
    });
  };

  render() {
    const { className, isMapLoaded, reveal } = this.props;

    return (
      <StyledMap
        className={className}
        isLoaded={isMapLoaded}
        ref={this.mapRef}
        reveal={reveal}
      />
    );
  }
}

export type MapProps = {
  className?: string;
  reveal: boolean;
};

const Map = ({ className, reveal }: MapProps) => {
  const dispatch = useAppDispatch();
  const isMapLoaded = useAppSelector(selectMapLoaded);

  // dispatch is stable, so the Mapbox event handlers registered once at load
  // stay valid for the life of the map.
  const handlers = useMemo(
    () => ({
      clearSelection: () => dispatch(clearSelection()),
      hoverFeature: (event: MapMouseEvent) =>
        dispatch(hoverFeature(event)),
      onMapLoaded: () => dispatch(mapLoaded()),
      resetMap: () => dispatch(mapReset()),
      selectFeature: (event: MapMouseEvent) =>
        dispatch(selectFeature(event)),
      unhoverFeature: () => dispatch(unhoverFeature()),
    }),
    [dispatch],
  );

  return (
    <MapCanvas
      {...handlers}
      className={className}
      isMapLoaded={isMapLoaded}
      reveal={reveal}
    />
  );
};

export default Map;
