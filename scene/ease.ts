/*
 * The scene's easing curve, as a function of t.
 *
 * Every camera move is `ease-in-out-cubic` -- cubic-bezier(.65,0,.35,1) --
 * and mapbox-gl's `easeTo` takes an `easing: (t) => t` callback, not a CSS
 * string. So the curve has to be evaluated here.
 *
 * A CSS cubic-bezier is a parametric curve: both x and y are cubic
 * polynomials of a parameter s, and the animation wants y at a given x.
 * There is no closed form, so x is inverted numerically. Newton-Raphson
 * converges in a couple of steps on these well-behaved control points, and
 * bisection is the fallback for the flat regions where the derivative is
 * near zero.
 */

/** Newton needs a slope; below this it cannot be trusted. */
const MIN_SLOPE = 1e-6;
const EPSILON = 1e-7;
const NEWTON_STEPS = 8;
const BISECTION_STEPS = 24;

const bezier = (a: number, b: number, s: number): number => {
  // 3a(1-s)^2 s + 3b(1-s) s^2 + s^3, expanded to Horner form.
  const c = 3 * a;
  const d = 3 * (b - a) - c;
  const e = 1 - c - d;
  return ((e * s + d) * s + c) * s;
};

const slope = (a: number, b: number, s: number): number => {
  const c = 3 * a;
  const d = 3 * (b - a) - c;
  const e = 1 - c - d;
  return (3 * e * s + 2 * d) * s + c;
};

/** Solves x(s) = target for s. */
const solve = (a: number, b: number, target: number): number => {
  let s = target;
  for (let i = 0; i < NEWTON_STEPS; i += 1) {
    const error = bezier(a, b, s) - target;
    if (Math.abs(error) < EPSILON) return s;
    const slop = slope(a, b, s);
    if (Math.abs(slop) < MIN_SLOPE) break;
    s -= error / slop;
  }

  let low = 0;
  let high = 1;
  s = target;
  for (let i = 0; i < BISECTION_STEPS; i += 1) {
    const x = bezier(a, b, s);
    if (Math.abs(x - target) < EPSILON) return s;
    if (x > target) high = s;
    else low = s;
    s = (low + high) / 2;
  }
  return s;
};

/**
 * A CSS cubic-bezier as an easing function. The endpoints are returned
 * exactly: a camera move must land on its target, not near it.
 */
export const cubicBezier =
  (
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
  ): ((t: number) => number) =>
  (t: number): number => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return bezier(p1y, p2y, solve(p1x, p2x, t));
  };
