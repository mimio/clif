import { get } from 'lodash-es';
import { createSelector } from 'reselect';

export const selectState = state => state.polygon;

export const selectPolygon = createSelector(selectState, app =>
  get(app, 'polygon'),
);

export const selectModel = createSelector(selectPolygon, polygon =>
  get(polygon, 'model'),
);

export const selectPolygonAuthor = createSelector(selectState, app =>
  get(app, 'polygon.author.name'),
);

export const selectPolygonAuthorUrl = createSelector(
  selectState,
  app => get(app, 'polygon.author.url'),
);

export const selectIsPolygonLoading = createSelector(
  selectState,
  app => get(app, 'isLoading'),
);
