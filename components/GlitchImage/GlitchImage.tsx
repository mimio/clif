import { Component } from 'react';
import styled from '@emotion/styled';
import * as THREE from 'three';
import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';

const Container = styled.div`
  position: relative;
  width: 100%;
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
  }
`;

type GlitchImageProps = {
  src: string;
  /** grid-area to place the image in */
  ga?: string;
};

class GlitchImage extends Component<GlitchImageProps> {
  containerRef: HTMLDivElement | null = null;

  width = 0;

  height = 0;

  scene!: THREE.Scene;

  camera!: THREE.PerspectiveCamera;

  renderer!: THREE.WebGLRenderer;

  clock!: THREE.Clock;

  // Created in createMesh(), which can bail before assigning them.
  geometry?: THREE.PlaneGeometry;

  material?: THREE.ShaderMaterial;

  texture?: THREE.Texture;

  mesh?: THREE.Mesh;

  animationRequest = 0;

  componentDidMount() {
    this.setSize();
    this.init();
    this.createMesh();
    this.addEvents();
    this.renderScene();
    this.onResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.animationRequest);
    this.texture?.dispose();
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer.dispose();
  }

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

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.mesh?.scale.set(
      this.width / this.height - (this.width / this.height) * 0.2,
      0.8,
      1,
    );
  };

  addEvents = () => {
    this.animationRequest = requestAnimationFrame(this.animate);
    window.addEventListener('resize', this.onResize, false);
  };

  animate = () => {
    this.renderScene();
    this.animationRequest = requestAnimationFrame(this.animate);
  };

  renderScene = () => {
    if (this.material) {
      this.material.uniforms.uTime.value =
        this.clock.getElapsedTime();
    }
    this.renderer.render(this.scene, this.camera);
  };

  createMesh = () => {
    try {
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
    } catch (e) {
      alert(String(e));
    }
  };

  render() {
    const { ga = '' } = this.props;
    return (
      <Container
        style={{
          gridArea: ga,
        }}
        ref={(ref) => {
          this.containerRef = ref;
        }}
      />
    );
  }
}

export default GlitchImage;
