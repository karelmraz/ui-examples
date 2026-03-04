import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene, camera, renderer
const scene = new THREE.Scene();
// White background
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Set up renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lights
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Hemisphere sky light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 7.5);
dirLight.castShadow = true;
scene.add(dirLight);

// Fill light to brighten shadowed areas
const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

// Ground plane
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Load GLTF model
const loader = new GLTFLoader();
// "APX '70 - Low poly model" (https://skfb.ly/pANy8) by Daniel Zhabotinsky is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
loader.load('/low-poly-car.glb', (gltf) => {
  const model = gltf.scene;

  // Enable shadows and tweak materials
  model.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
    if (child.material) {
    // add roughness on material
    child.material.roughness = 0.6;

    // subtle metallic look
    child.material.metalness = 0.15;
    }
  });

  // Center model on ground
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += (box.max.y - box.min.y) / 2;

  scene.add(model);

  // Position camera and controls
  camera.position.set(3, 2, 2.5);
  controls.target.set(0, 0.5, 0);
  controls.update();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

}, undefined, (error) => {
  console.error(error);
});


