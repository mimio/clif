import { get } from 'lodash-es';
import { createSelector } from 'reselect';
import { selectGeoJson } from 'modules/geojson';
import bbox from '@turf/bbox';
import turfCenter from '@turf/center';

import {
  selectSelectedFeature,
  selectMapLoaded,
  selectMapState,
  selectSelectedBasemapUrl,
} from '../map/selectors';
import { isSmallScreen } from '../../utils/device';

export const selectAppState = state => state.app;
export const selectSidePanelOpen = createSelector(
  selectAppState,
  app => get(app, 'sidePanelOpen', true),
);

export const selectShowDetailView = createSelector(
  selectSelectedFeature,
  feature => !!feature.id,
);

export const selectIsLoading = createSelector(
  selectMapLoaded,
  mapLoaded => !mapLoaded,
);

export const selectMapConfig = createSelector(
  selectMapState,
  selectGeoJson,
  selectSelectedBasemapUrl,
  selectSidePanelOpen,
  (map, geojson, style, sidePanelOpen) => {
    if (!geojson.features.length) return undefined;
    const bounds = bbox(geojson);
    const {
      geometry: { coordinates: center },
    } = turfCenter(geojson);

    return {
      ...map.config,
      bounds,
      center,
      style,
      fitBoundsOptions: {
        ...map.config.fitBoundsOptions,
        padding: {
          top: 20,
          left: !isSmallScreen() && sidePanelOpen ? 530 : 20,
          right: 20,
          bottom: isSmallScreen() && sidePanelOpen ? 350 : 20,
        },
      },
    };
  },
);
