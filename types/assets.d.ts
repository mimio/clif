// SVG files import as React components through @svgr/webpack (see
// next.config.ts); GLSL files import as their source text through
// raw-loader + glslify-loader.
declare module '*.svg' {
  import type { FC, SVGProps } from 'react';

  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.glsl' {
  const source: string;
  export default source;
}
