/*
 * Mapbox's style specification, as data.
 *
 * mapbox-gl ships it at dist/style-spec/ with a declaration file beside
 * it, but its package `exports` map sends `./dist/*` straight through
 * with no `types` condition, so TypeScript resolves the module and finds
 * no types for it. This is that one condition, written out.
 *
 * It is read by TESTS ONLY, and by one of them: test/scene-layers.test.ts
 * checks that every `<property>-use-theme` sentinel scene/layers/sets.ts
 * derives names a property mapbox itself types as a colour. That is a
 * question about mapbox's spec rather than about this codebase, so it is
 * answered out of mapbox's spec rather than out of a list here that a
 * version bump would silently outdate.
 *
 * Only the shape that test reads is declared. The real file's type is
 * thousands of lines of literal types and importing it would not make the
 * lookup any better typed: the test indexes it by strings it builds at
 * runtime.
 */
declare module 'mapbox-gl/dist/style-spec/index.cjs' {
  export const latest: Record<
    string,
    Record<string, { type?: string } | undefined> | undefined
  >;
}
