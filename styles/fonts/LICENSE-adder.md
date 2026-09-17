# Adder Super-Extended — license status: UNCONFIRMED

`adder-superextended.woff2` (80,748 bytes) ships in this repository and is
the site's display face: the lowercase page word set in Adder is the only
mark the brand has.

**No license accompanies it.** This file records that, so the gap is a
known one rather than a surprise.

## What is known

- The binary was carried forward from the previous version of this site
  (`mimio/clif`, `public/adder-superextended.woff2`) and again into the
  One Globe design bundle (`assets/fonts/adder-superextended.woff2`).
  Neither copy has a license file, a foundry note, a purchase record or an
  EULA beside it.
- The sibling face in this directory, Roboto Mono, does ship its license
  (`LICENSE-roboto-mono.txt`, SIL Open Font License 1.1). The asymmetry is
  the point: one of the two faces has documented redistribution rights and
  the other does not.
- The bundle also ships `FatFontSlanted.woff2` with the same problem. That
  one is not used by any route and was not carried into this repository.

## What is not known

- The foundry or designer.
- Whether the original acquisition included web-embedding rights, and
  whether those rights extend to redistributing the `.woff2` from a public
  repository and serving it from a public domain.

## Until that is settled

- Treat this face as **not cleared for redistribution**. Do not copy it
  into another project, and do not publish it as a downloadable asset.
- `styles/fonts.ts` gives it a fallback stack and
  `styles/tokens/fonts.css` gives `--family-display` a `var()` fallback, so
  deleting the `.woff2` and the `adder` export degrades the page word to a
  wide, heavy fallback instead of breaking the type system. Removal is a
  two-line change, not a redesign.
- If the rights are confirmed, replace this file with the actual license.
  If they cannot be, the display face has to be repurchased or replaced.
