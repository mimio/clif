/*
 * Re-encodes the project images referenced from constants/projects.tsx as
 * WebP at display-appropriate sizes. Run it again whenever a new project
 * image is added:
 *
 *   pnpm images            (or: node scripts/optimize-images.mts [--dry-run])
 *
 * - imgSrc (full image, used as a three.js texture on the project page):
 *   resized to at most FULL_MAX_WIDTH wide. The alpha channel is dropped
 *   because the glitch shader ignores it.
 * - imgSrcSkinny (filmstrip preview, rendered through next/image at
 *   160-200 CSS px wide): resized to at most SKINNY_MAX_WIDTH wide; alpha
 *   is kept.
 *
 * An image is only touched when it is wider than its target or larger than
 * MIN_BYTES, and a re-encode without a resize is only kept when it shrinks
 * the file by at least MIN_REDUCTION, so re-running is safe. The output
 * replaces the source file; PNG sources are removed and constants/projects.tsx
 * is updated to point at the .webp file.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

type ImageKind = 'full' | 'skinny';

const ROOT = path.join(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PROJECTS_FILE = path.join(ROOT, 'constants', 'projects.tsx');

const FULL_MAX_WIDTH = 2000;
const SKINNY_MAX_WIDTH = 640;
const MIN_BYTES = 150 * 1024;
const MIN_REDUCTION = 0.2;
const QUALITY = 82;

const dryRun = process.argv.includes('--dry-run');

const kb = (bytes: number): string =>
  `${Math.round(bytes / 1024)} KB`;

// Returns the file name the reference should point at afterwards and the
// number of bytes saved.
async function optimize(
  file: string,
  kind: ImageKind,
): Promise<{ outFile: string; saved: number }> {
  const src = path.join(PUBLIC_DIR, file);
  if (!fs.existsSync(src)) {
    console.warn(`skip   ${file}: not found in public/`);
    return { outFile: file, saved: 0 };
  }
  const maxWidth =
    kind === 'full' ? FULL_MAX_WIDTH : SKINNY_MAX_WIDTH;
  const before = fs.statSync(src).size;
  const meta = await sharp(src).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const needsResize = width > maxWidth;

  if (!needsResize && before <= MIN_BYTES) {
    console.log(`keep   ${file} (${width}x${height}, ${kb(before)})`);
    return { outFile: file, saved: 0 };
  }

  let pipeline = sharp(src);
  if (kind === 'full') pipeline = pipeline.removeAlpha();
  if (needsResize) {
    pipeline = pipeline.resize({
      width: maxWidth,
      withoutEnlargement: true,
    });
  }
  const output = await pipeline
    .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
    .toBuffer({ resolveWithObject: true });

  if (
    !needsResize &&
    output.data.length > before * (1 - MIN_REDUCTION)
  ) {
    console.log(
      `keep   ${file}: re-encoding would not shrink it enough`,
    );
    return { outFile: file, saved: 0 };
  }

  const outFile = `${path.basename(file, path.extname(file))}.webp`;
  const dest = path.join(PUBLIC_DIR, outFile);
  console.log(
    `write  ${file} -> ${outFile}: ${width}x${height} ${kb(before)}` +
      ` -> ${output.info.width}x${output.info.height} ${kb(output.data.length)}`,
  );

  if (!dryRun) {
    fs.writeFileSync(dest, output.data);
    if (dest !== src) fs.unlinkSync(src);
  }
  return { outFile, saved: before - output.data.length };
}

const original = fs.readFileSync(PROJECTS_FILE, 'utf8');
let source = original;
const refs = [
  ...original.matchAll(/imgSrc(Skinny)?:\s*'\/([^']+)'/g),
].map((m): { kind: ImageKind; file: string } => ({
  kind: m[1] ? 'skinny' : 'full',
  file: m[2],
}));

let saved = 0;
for (const ref of refs) {
  const result = await optimize(ref.file, ref.kind);
  if (result.outFile !== ref.file) {
    source = source
      .split(`'/${ref.file}'`)
      .join(`'/${result.outFile}'`);
  }
  saved += result.saved;
}

if (source !== original && !dryRun)
  fs.writeFileSync(PROJECTS_FILE, source);
console.log(
  `${dryRun ? '(dry run) ' : ''}${refs.length} images checked, ${kb(saved)} saved`,
);
