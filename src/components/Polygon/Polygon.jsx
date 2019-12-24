import React, { Component } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import 'utils/OrbitControls';
import * as THREE from 'three';
import { getModelScale } from './utils';

const Canvas = styled.canvas`
  touch-action: none;
  user-select: none;
  cursor: none;
  pointer-events: none;
`;

let camera;
let scene;
let renderer;
let controls;
let updateId;

export default class Polygon extends Component {
  static propTypes = {
    className: PropTypes.string,
    model: PropTypes.object,
  };

  static defaultProps = {
    className: '',
    model: null,
  };

  componentDidMount() {
    const { model } = this.props;
    this.draw(model);
  }

  componentDidUpdate({ model: prevModel }) {
    const { model } = this.props;
    console.log('COMPONENT DID UPDATE', { model });
    if (model !== prevModel) {
      if (scene) {
        scene.children.forEach(child => scene.remove(child));
      }
      this.draw(model);
    }
  }

  componentWillUnmount() {
    this.isUnmounting = true;
    if (scene && scene.children.length) {
      scene.children.forEach(child => scene.remove(child));
    }
    cancelAnimationFrame(updateId);
    window.removeEventListener('resize', this.onWindowResize, false);
  }

  onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  draw = model => {
    console.log('DRAWING MODEL', model);
    if (!model) return;
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );

    camera.position.set(20, 10, 25);

    controls = new THREE.OrbitControls(camera, this.root);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = 0.2;
    scene = new THREE.Scene();

    // grid useful for debuggin
    // scene.background = new THREE.Color(0xf0f0f0);
    // const gridHelper = new THREE.GridHelper(1000, 10);
    // scene.add(gridHelper);

    // renderer
    renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // model
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(light);
    scene.add(directionalLight);
    scene.add(model);
    model.position.z = 0;
    model.position.y = 0;
    model.position.x = 0;

    const sc = getModelScale(model);
    model.scale.x = sc;
    model.scale.y = sc;
    model.scale.z = sc;

    // this.setState({ camera, scene, renderer });
    window.addEventListener('resize', this.onWindowResize, false);
    this.animate();
  };

  animate = () => {
    updateId = requestAnimationFrame(this.animate);
    this.renderObj();
  };

  renderObj = () => {
    controls.update();
    renderer.render(scene, camera);
  };

  render() {
    const { className } = this.props;
    return (
      <Canvas
        className={className}
        ref={el => {
          this.canvas = el;
        }}
      />
    );
  }
}
