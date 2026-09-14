import { getMap, type GetMap } from 'utils/map';

// Dependencies injected into the store rather than imported by the logic that
// uses them: thunks receive this object as their third argument (the
// redux-thunk `extraArgument`) and listener effects read it from
// `listenerApi.extra`. Keeping the Mapbox accessor here means modules/ never
// reaches for the map itself, so a test can drive the same logic with a stub.
export const thunkExtra = { getMap };

export type ThunkExtra = { getMap: GetMap };
