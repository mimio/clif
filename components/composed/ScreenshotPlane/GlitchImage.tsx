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
 */
type GlitchImageProps = {
  src: string;
  alt: string;
  /** grid-area to place the image in */
  ga?: string;
};

type GlitchImageState = {
  /** WebGL setup failed, so the image itself is shown instead. */
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

  componentDidMount() {
    window.addEventListener('resize', this.onResize, false);
    this.setSize();
    try {
      this.init();
      this.createMesh();
      this.animationRequest = requestAnimationFrame(this.animate);
      this.renderScene();
      this.onResize();
    } catch (error) {
      console.warn(
        'GlitchImage: WebGL setup failed, showing the plain image',
        error,
      );
      this.disposeScene();
      this.setState({ fallback: true });
    }
  }

  componentDidUpdate(previous: GlitchImageProps) {
    // A new project, not a new plane: swap the texture on the live material
    // so the mounted mesh keeps waving through the route change.
    if (previous.src === this.props.src) return;
    if (!this.material) return;
    const next = new THREE.TextureLoader().load(this.props.src);
    next.minFilter = THREE.LinearFilter;
    this.texture?.dispose();
    this.texture = next;
    this.material.uniforms.uTexture.value = next;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    this.disposeScene();
  }

  disposeScene = () => {
    cancelAnimationFrame(this.animationRequest);
    this.texture?.dispose();
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.renderer = undefined;
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
    this.texture = new THREE.TextureLoader().load(src);
    this.texture.minFilter = THREE.LinearFilter;
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
