import type { Map as MapboxMap } from 'mapbox-gl';
import { WORK_SOURCE } from 'constants/source';
import { startAppListening } from 'modules/listenerMiddleware';
import {
  selectHoveredFeatureId,
  selectMapLoaded,
  selectSelectedFeatureId,
} from './mapSlice';

// Moves a boolean feature-state flag from one feature to another. Mapbox keeps
// this highlighting state outside React, so it has to be told about every
// change; doing it here means no action creator has to remember to.
const moveFlag = (
  map: MapboxMap,
  flag: 'selected' | 'hover',
  previousId: number | null,
  nextId: number | null,
) => {
  if (previousId === nextId) return;
  if (previousId !== null) {
    map.setFeatureState(
      { source: WORK_SOURCE, id: previousId },
      { [flag]: false },
    );
  }
  if (nextId !== null) {
    map.setFeatureState(
      { source: WORK_SOURCE, id: nextId },
      { [flag]: true },
    );
  }
};

// The map's highlighting is a projection of store state, so it is kept in sync
// by a listener reacting to the change rather than by each thunk repeating the
// "unset the old id, set the new one" bookkeeping.
// https://redux-toolkit.js.org/api/createListenerMiddleware
export default function setupMapListeners(): void {
  startAppListening({
    predicate: (_action, currentState, previousState) =>
      selectSelectedFeatureId(currentState) !==
        selectSelectedFeatureId(previousState) ||
      selectHoveredFeatureId(currentState) !==
        selectHoveredFeatureId(previousState),
    effect: (_action, listenerApi) => {
      const map = listenerApi.extra.getMap();
      const state = listenerApi.getState();
      // Read after the reducer ran, so the `mapReset` an unmount dispatches has
      // already cleared mapLoaded and the outgoing map is left untouched, as it
      // was before.
      if (!map || !selectMapLoaded(state)) return;
      const previousState = listenerApi.getOriginalState();

      moveFlag(
        map,
        'selected',
        selectSelectedFeatureId(previousState),
        selectSelectedFeatureId(state),
      );
      moveFlag(
        map,
        'hover',
        selectHoveredFeatureId(previousState),
        selectHoveredFeatureId(state),
      );
    },
  });
}
