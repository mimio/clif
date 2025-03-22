import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import glsl from 'glslify';
import * as THREE from 'three';
import vertex from './glsl/vertex.glsl';
import fragment from './glsl/fragment.glsl';

const vertexShader = glsl(vertex);
const fragmentShader = glsl(fragment);

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

class GlitchImage extends Component {
  containerRef = null;

  width = null;

  height = null;

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
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.scene.dispose();
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
    this.containerRef.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
  };

  setSize = () => {
    this.width = this.containerRef.clientWidth;
    this.height = this.width * (5 / 12);
    this.containerRef.style.height = `${this.height}px`;
  };

  onResize = () => {
    this.setSize();

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.mesh.scale.set(
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
    this.material.uniforms.uTime.value = this.clock.getElapsedTime();
    this.renderer.render(this.scene, this.camera);
  };

  createMesh = () => {
    try {
      const { src } = this.props;
      this.geometry = new THREE.PlaneGeometry(1, 1, 16, 16);
      const texture = new THREE.TextureLoader().load(src);
      texture.minFilter = THREE.LinearFilter;
      this.material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0.0 },
          uTexture: {
            value: texture,
          },
        },
      });
      this.mesh = new THREE.Mesh(this.geometry, this.material);

      this.scene.add(this.mesh);
    } catch (e) {
      alert(e);
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

GlitchImage.propTypes = {
  src: PropTypes.string.isRequired,
  ga: PropTypes.string,
};

export default GlitchImage;
