import { v4 as uuid } from 'uuid';
import type {
  Map as MapboxMap,
  MapMouseEvent,
  Popup,
} from 'mapbox-gl';
import mapboxGl from 'mapbox-gl-ssr';
import sizes from 'styles/theme/sizes';
import { WORK_SOURCE } from 'constants/source';
import {
  BOUNDS_PADDING,
  BOUNDS_PADDING_MOBILE,
  MAP_PITCH,
} from 'constants/map';
import { featureLookup, historyBounds } from 'constants/history';
import type { AppThunk } from 'modules/store';
import { selectIsMobile } from '../app/selectors';
import {
  selectHoveredFeatureId,
  selectMapLoaded,
  selectSelectedFeatureId,
  selectPopupId,
  selectNextFeatureId,
  selectPrevFeatureId,
  selectIsFeatureSelected,
} from './selectors';
import {
  CLEAR_SELECTION,
  HOVER_FEATURE,
  SET_MAP_LOADED,
  SELECT_FEATURE,
  UNHOVER_FEATURE,
  SET_POPUP_ID,
  RESET_MAP,
  type MapAction,
} from './types';

// Map event handlers receive the Mapbox event; the prev/next controls pass
// a feature id directly.
export type FeatureRef = MapMouseEvent | number;

export const setMapLoaded = (isLoaded: boolean): MapAction => ({
  type: SET_MAP_LOADED,
  payload: isLoaded,
});

export const setPopupId = (id: string | null): MapAction => ({
  type: SET_POPUP_ID,
  payload: id,
});

export const resetMap = (): MapAction => ({ type: RESET_MAP });

export const fitBounds =
  (): AppThunk => (_dispatch, getState, getMap) => {
    const map = getMap();
    if (!map) return;
    const state = getState();
    const isMobile = selectIsMobile(state);
    const isFeatureSelected = selectIsFeatureSelected(state);

    map.fitBounds(historyBounds, {
      padding:
        isMobile && isFeatureSelected
          ? BOUNDS_PADDING_MOBILE
          : BOUNDS_PADDING,
      pitch: MAP_PITCH,
      essential: true,
    });
  };

export const unhoverFeature =
  (): AppThunk => (dispatch, getState, getMap) => {
    const map = getMap();
    if (!map || !selectMapLoaded(getState())) return;
    const hoveredId = selectHoveredFeatureId(getState());

    if (hoveredId !== null) {
      map.setFeatureState(
        { source: WORK_SOURCE, id: hoveredId },
        { hover: false },
      );
    }

    map.getCanvas().style.cursor = 'grab';
    dispatch({ type: UNHOVER_FEATURE });
  };

let popup: Popup | undefined;
const removePopup = () => {
  if (popup?.isOpen()) popup.remove();
};

export const clearSelection =
  (): AppThunk => (dispatch, getState, getMap) => {
    const map = getMap();
    if (!map || !selectMapLoaded(getState())) return;
    const selectedId = selectSelectedFeatureId(getState());

    removePopup();

    if (selectedId !== null) {
      map.setFeatureState(
        { source: WORK_SOURCE, id: selectedId },
        { selected: false },
      );
    }

    dispatch({ type: CLEAR_SELECTION });
  };

const getId = (map: MapboxMap, ref: FeatureRef): number | null => {
  if (typeof ref === 'number') return ref;
  const id: unknown = map.queryRenderedFeatures(ref.point)[0]
    ?.properties?.id;
  if (typeof id === 'number') return id;
  if (typeof id === 'string' && id !== '') return Number(id);
  return null;
};

export const selectFeature =
  (ref: FeatureRef): AppThunk =>
  (dispatch, getState, getMap) => {
    const state = getState();
    const map = getMap();
    if (!map || !selectMapLoaded(state)) return;

    const isMobile = selectIsMobile(state);
    const prevPopupId = selectPopupId(state);
    const prevSelectedId = selectSelectedFeatureId(state);

    const id = getId(map, ref);
    if (id === null) return;
    const feature = featureLookup[id];
    if (!feature) return;

    map.flyTo({
      center: feature.coordinates,
      offset: [0, isMobile ? -60 : 180],
      zoom: 12,
      essential: true,
    });

    if (id !== prevSelectedId) {
      if (prevSelectedId !== null) {
        map.setFeatureState(
          { source: WORK_SOURCE, id: prevSelectedId },
          { selected: false },
        );
      }
      map.setFeatureState(
        { source: WORK_SOURCE, id },
        { selected: true },
      );
      dispatch({ type: SELECT_FEATURE, payload: id });
    }

    if ((id !== prevSelectedId || !prevPopupId) && !isMobile) {
      removePopup();
      const popupId = uuid();
      popup = new mapboxGl.Popup({
        closeButton: false,
        offset: 30,
        maxWidth: sizes.popupWidth,
      })
        .once('close', () => dispatch(setPopupId(null)))
        .setLngLat(feature.coordinates)
        .setHTML(`<div id="${popupId}"></div>`)
        .addTo(map);
      dispatch(setPopupId(popupId));
    }
  };

export const selectNextFeature =
  (): AppThunk => (dispatch, getState) => {
    const nextFeatureId = selectNextFeatureId(getState());
    if (nextFeatureId !== null)
      dispatch(selectFeature(nextFeatureId));
  };

export const selectPrevFeature =
  (): AppThunk => (dispatch, getState) => {
    const prevFeatureId = selectPrevFeatureId(getState());
    if (prevFeatureId !== null)
      dispatch(selectFeature(prevFeatureId));
  };

export const hoverFeature =
  (ref: FeatureRef): AppThunk =>
  (dispatch, getState, getMap) => {
    const state = getState();
    const map = getMap();
    if (!map || !selectMapLoaded(state)) return;
    const hoveredId = selectHoveredFeatureId(state);

    const id = getId(map, ref);
    if (id === null) return;

    map.getCanvas().style.cursor = 'pointer';

    if (hoveredId !== id) dispatch(unhoverFeature());
    if (hoveredId === id) return;

    map.setFeatureState({ source: WORK_SOURCE, id }, { hover: true });
    dispatch({ type: HOVER_FEATURE, payload: id });
  };
