import { Component } from 'react';
import Image from 'next/image';
import * as THREE from 'three';
import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';

/*
 * The RGB-split wave shader, as a three.js plane. It lives beside
 * ScreenshotPlane because that is its only consumer.
 *
 * IT MUST SURVIVE A ROUTE CHANGE. The plane does not re-enter on the way to a
 * project detail -- the same plane re-anchors right -- so a new project has
 * to arrive as a new `src` on a mounted component, never as a remount.
 * componentDidUpdate swaps the texture in place for exactly that.
 *
 * Coverage-excluded (vitest.config.mts): it needs a real GL context, which
 * jsdom has not got. Its no-WebGL fallback to next/image is covered by e2e.
 *
 * THREE THINGS THE SUCCESS PATH OWES THE READER, none of which the fallback
 * path can pay on its behalf -- it is the path that does NOT run in a normal
 * browser:
 *
 *   the name     the canvas three.js appends is the image. `render` emits a
 *                bare container, so unless the canvas itself carries
 *                role/aria-label the capture is invisible to assistive tech
 *                on every detail route -- `alt` reached only the <Image> in
 *                the fallback, which a working browser never renders.
 *   the failure  TextureLoader.load is asynchronous and swallows its own
 *                errors. A 404 or a decode failure throws nothing, so the
 *                mount-time try/catch cannot see it: the shader would go on
 *                waving over an unpopulated texture for ever. Its onError is
 *                wired into the same `fallback` state WebGL setup uses, so a
 *                dead texture degrades to the next/image path that already
 *                exists -- with its alt.
 *   the motion   the wave is decorative, indefinite and un-pausable, which
 *                is exactly what prefers-reduced-motion is for. The globe is
 *                already frozen under it; this must not keep waving beside a
 *                still scene.
 */
/*
 * scene/budget.ts has the same two lines, and scene/useViewport.ts the same
 * query. They are NOT importable from here: the layer rule
 * (eslint.config.mjs) lets only pages/ and components/chrome/ reach into
 * scene/, and this is components/composed/. A shared home for it would be
 * utils/; until something else in this layer needs it, the query lives
 * beside its one consumer rather than growing a module for it.
 */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const prefersReducedMotion = (): boolean =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

type GlitchImageProps = {
  src: string;
  alt: string;
  /** grid-area to place the image in */
  ga?: string;
};

type GlitchImageState = {
  /**
   * WebGL setup failed, or the texture never loaded, so the image itself
   * is shown instead.
   */
  fallback: boolean;
};

class GlitchImage extends Component<
  GlitchImageProps,
  GlitchImageState
> {
  state: GlitchImageState = { fallback: false };

  containerRef: HTMLDivElement | null = null;

  width = 0;

  height = 0;

  scene!: THREE.Scene;

  camera!: THREE.PerspectiveCamera;

  clock!: THREE.Clock;

  // Created in init() and createMesh(), which can throw (no WebGL context,
  // for one) before assigning them.
  renderer?: THREE.WebGLRenderer;

  geometry?: THREE.PlaneGeometry;

  material?: THREE.ShaderMaterial;

  texture?: THREE.Texture;

  mesh?: THREE.Mesh;

  animationRequest = 0;

  /** The texture load can resolve after unmount; setState must not. */
  live = false;

  motion?: MediaQueryList;

  componentDidMount() {
    this.live = true;
    window.addEventListener('resize', this.onResize, false);
    // The preference can change while the plane is mounted -- a system
    // toggle, or a devtools emulation -- and the loop has to answer it.
    this.motion = window.matchMedia(REDUCED_MOTION_QUERY);
    this.motion.addEventListener('change', this.onMotionChange);
    this.setSize();
    try {
      this.init();
      this.createMesh();
      this.renderScene();
      this.startAnimation();
      this.onResize();
    } catch (error) {
      this.degrade('GlitchImage: WebGL setup failed', error);
    }
  }

  componentDidUpdate(previous: GlitchImageProps) {
    // The name is the canvas's, so it follows `alt` rather than the mount.
    if (previous.alt !== this.props.alt) this.labelCanvas();
    // A new project, not a new plane: swap the texture on the live material
    // so the mounted mesh keeps waving through the route change.
    if (previous.src === this.props.src) return;
    if (!this.material) return;
    const next = this.loadTexture(this.props.src);
    this.texture?.dispose();
    this.texture = next;
    this.material.uniforms.uTexture.value = next;
  }

  componentWillUnmount() {
    this.live = false;
    window.removeEventListener('resize', this.onResize);
    this.motion?.removeEventListener('change', this.onMotionChange);
    this.disposeScene();
  }

  /**
   * Gives up on the shader and shows the plain image instead. Every way
   * this component can fail -- no GL context, a texture that never
   * arrives -- lands here, so there is one degraded state and not two.
   */
  degrade = (message: string, error: unknown) => {
    console.warn(`${message}, showing the plain image`, error);
    this.disposeScene();
    if (this.live) this.setState({ fallback: true });
  };

  /**
   * TextureLoader's fourth argument is the only place a failed load is
   * ever reported: it neither throws nor rejects.
   */
  loadTexture = (src: string): THREE.Texture => {
    const texture = new THREE.TextureLoader().load(
      src,
      undefined,
      undefined,
      (error) => {
        this.degrade(`GlitchImage: ${src} did not load`, error);
      },
    );
    texture.minFilter = THREE.LinearFilter;
    return texture;
  };

  disposeScene = () => {
    cancelAnimationFrame(this.animationRequest);
    this.animationRequest = 0;
    this.texture?.dispose();
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.renderer = undefined;
    // componentDidUpdate reads `material` to decide whether there is a
    // live mesh to swap a texture on. After this there is not.
    this.material = undefined;
    this.texture = undefined;
    this.geometry = undefined;
    this.mesh = undefined;
  };

  /**
   * The canvas IS the image on the success path, so it carries the name.
   * An empty alt is the decorative case -- the same thing next/image does
   * with alt="" -- and a nameless role="img" would be worse than none.
   */
  labelCanvas = () => {
    const canvas = this.renderer?.domElement;
    if (!canvas) return;
    const { alt } = this.props;
    if (alt === '') {
      canvas.removeAttribute('role');
      canvas.removeAttribute('aria-label');
      canvas.setAttribute('aria-hidden', 'true');
      return;
    }
    canvas.removeAttribute('aria-hidden');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', alt);
  };

  init = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.1,
      100,
    );

    this.camera.position.z = 1;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x161616, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.labelCanvas();
    this.containerRef?.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
  };

  setSize = () => {
    if (!this.containerRef) return;
    this.width = this.containerRef.clientWidth;
    this.height = this.width * (5 / 12);
    this.containerRef.style.height = `${this.height}px`;
  };

  onResize = () => {
    this.setSize();
    if (!this.renderer) return;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.mesh?.scale.set(
      this.width / this.height - (this.width / this.height) * 0.2,
      0.8,
      1,
    );
    // setSize resets the drawing buffer; under reduced motion nothing is
    // going to repaint it on the next frame, so this has to.
    if (this.animationRequest === 0) this.renderScene();
  };

  onMotionChange = () => {
    if (!this.renderer) return;
    this.startAnimation();
  };

  /**
   * Runs the wave, or does not. Reduced motion gets the capture as a still
   * frame -- the plane is a picture either way, and the only thing lost is
   * a loop that never ends and that nothing on the page can pause.
   */
  startAnimation = () => {
    cancelAnimationFrame(this.animationRequest);
    this.animationRequest = 0;
    if (prefersReducedMotion()) {
      this.renderScene();
      return;
    }
    this.animationRequest = requestAnimationFrame(this.animate);
  };

  animate = () => {
    this.renderScene();
    this.animationRequest = requestAnimationFrame(this.animate);
  };

  renderScene = () => {
    if (!this.renderer) return;
    if (this.material) {
      this.material.uniforms.uTime.value =
        this.clock.getElapsedTime();
    }
    this.renderer.render(this.scene, this.camera);
  };

  createMesh = () => {
    const { src } = this.props;
    this.geometry = new THREE.PlaneGeometry(1, 1, 16, 16);
    this.texture = this.loadTexture(src);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0.0 },
        uTexture: {
          value: this.texture,
        },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
  };

  render() {
    const { ga = '', src, alt } = this.props;
    const { fallback } = this.state;
    return (
      <div
        className="relative w-full [&_canvas]:absolute [&_canvas]:top-0 [&_canvas]:left-0 [&_canvas]:bg-transparent [&_img]:object-contain"
        style={{
          gridArea: ga,
        }}
        ref={(ref) => {
          this.containerRef = ref;
        }}
      >
        {fallback && <Image src={src} alt={alt} fill sizes="100vw" />}
      </div>
    );
  }
}

export default GlitchImage;
