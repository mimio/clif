import * as THREE from 'three';

export const getLargestComponent = vector => {
  let largest = vector.x;
  if (vector.y > largest) {
    largest = vector.y;
  } else if (vector.z > largest) {
    largest = vector.z;
  }
  return largest;
};

export const getDifference = (a, b) => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});

export const getModelScale = (object, multiplier = 1) => {
  const box = new THREE.Box3().setFromObject(object);
  const diff = getDifference(box.max, box.min);

  const largestDiff = getLargestComponent(diff);
  if (largestDiff < 0.9) return 15 * multiplier;

  if (largestDiff < 1) return 10 * multiplier;

  if (largestDiff < 5) return 5 * multiplier;

  if (largestDiff < 20) return 1 * multiplier;

  if (largestDiff < 50) return 0.5 * multiplier;

  if (largestDiff < 100) return 0.25 * multiplier;

  if (largestDiff < 150) return 0.2 * multiplier;

  if (largestDiff < 200) return 0.1 * multiplier;

  if (largestDiff < 250) return 0.07 * multiplier;

  if (largestDiff < 350) return 0.05 * multiplier;

  if (largestDiff < 800) return 0.025 * multiplier;
  return 0.002 * multiplier;
};
