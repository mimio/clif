const bounds = [
  -106.80062770843506,
  39.70441225823208,
  -106.72648072242737,
  39.741355536001635,
];

export const longLatToMercator = ll => {
  const xy = [
    A * ll[0] * D2R,
    A * Math.log(Math.tan(Math.PI * 0.25 + 0.5 * ll[1] * D2R)),
  ];
  // if xy value is beyond maxextent (e.g. poles), return maxextent.
  xy[0] > MAXEXTENT && (xy[0] = MAXEXTENT);
  xy[0] < -MAXEXTENT && (xy[0] = -MAXEXTENT);
  xy[1] > MAXEXTENT && (xy[1] = MAXEXTENT);
  xy[1] < -MAXEXTENT && (xy[1] = -MAXEXTENT);
  return xy;
};
