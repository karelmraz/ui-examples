import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.x = 2;
camera.position.y = 0;  // Start position at the top
camera.position.z = 5;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.8;

// Add bloom effect
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.15,
    0.1, 
    0.01
);
composer.addPass(bloomPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// Mouse move effect for camera rotation
const mouse = {
    x: 0,
    y: 0
};

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

let textMesh1, textMesh2, textMesh3;
const minBrightness = 2; // Minimum brightness level
const maxBrightness = 10; // Maximum brightness level

// Variables to control the randomness
let blinkTimer1 = Math.random() * 10;
let blinkSpeed = Math.random() * 0.2; // Speed of the "wiggle"

// Target camera position for smooth scrolling
let targetCameraY = 0;

// Create text mesh
const createTextMesh = (text, font, color, emissiveColor, emissiveIntensity, position, size = 0.5, height = 0.3, curveSegments = 10) => {
    const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: height,
        curveSegments: curveSegments,
    });

    const neonMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissiveColor,
        emissiveIntensity: emissiveIntensity,
    });

    const textMesh = new THREE.Mesh(textGeometry, neonMaterial);
    textMesh.position.copy(position);
    scene.add(textMesh);

    return textMesh;
};

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);

    blinkSpeed = Math.random() * 0.3;

    // Calculate target camera rotation based on mouse movement
    const targetRotationX = mouse.y * 0.2; // Adjust the factor for sensitivity
    const targetRotationY = mouse.x * 0.2;

    // Smoothly interpolate the camera rotation towards the target
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotationX, 0.05);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotationY, 0.05);

    // Smoothly interpolate the camera position towards the target position
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCameraY, 0.1);

    // Random blinking effect with wiggle
    blinkTimer1 += blinkSpeed + (Math.random() - 0.5) * 0.02; // Add some randomness

    const blinkIntensity1 = Math.abs(Math.sin(blinkTimer1)) * (maxBrightness - minBrightness) + minBrightness;

    if (textMesh1) {
        textMesh1.material.emissiveIntensity = THREE.MathUtils.clamp(blinkIntensity1, minBrightness, maxBrightness);
    }

    if (textMesh3) {
        textMesh3.material.emissiveIntensity = THREE.MathUtils.clamp(blinkIntensity1, minBrightness, maxBrightness);
    }

    composer.render();
};

animate();

const loader = new FontLoader();

loader.load(
    './neon-club-music.json',
    (font) => {
        textMesh1 = createTextMesh('cyberpunk', font, 0xba008b, 0xba008b, 10, new THREE.Vector3(0, 0, 0.01));
        textMesh2 = createTextMesh('studios', font, 0xffdd00, 0xffdd00, 10, new THREE.Vector3(0, -0.9, 0.01), 0.72);
        textMesh3 = createTextMesh('lets start', font, 0xff0000, 0xff0000, 10, new THREE.Vector3(-1, -10, 0.1), 0.6, 0.2, 5);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (err) => {
        console.error('An error happened while loading the font:', err);
    }
);

// Scroll Control with Smooth Scrolling
window.addEventListener('wheel', (event) => {
    const deltaY = event.deltaY;

    const maxScrollY = 0;  // Adjust this value as needed (top to bottom)
    const minScrollY = -10; // Bottom end position

    // Adjust the target position based on scroll input
    targetCameraY = THREE.MathUtils.clamp(targetCameraY - deltaY * 0.005, minScrollY, maxScrollY);

    // Hide the explore button when user scrolls
    const exploreButton = document.getElementById('exploreButton');
    if (exploreButton) {
        if (Math.abs(targetCameraY) > 0.1) {
            exploreButton.style.display = 'none';
        } else {
            exploreButton.style.display = 'block';
        }
    }
});

// Explore Button Click Event to Scroll to Bottom
const exploreButton = document.getElementById('exploreButton');
exploreButton.addEventListener('click', () => {
    exploreButton.style.display = 'none'; // Hide the button after it's clicked

    // Animate camera position change to scroll to bottom text
    const targetY = -10; // Bottom end position
    const duration = 1.5; // Duration of the animation in seconds
    const startTime = performance.now();

    const animateCameraMovement = (currentTime) => {
        const elapsedTime = (currentTime - startTime) / 1000;
        const progress = Math.min(elapsedTime / duration, 1); // Clamp to [0, 1]

        targetCameraY = THREE.MathUtils.lerp(0, targetY, progress);

        if (progress < 1) {
            requestAnimationFrame(animateCameraMovement);
        }
    };

    requestAnimationFrame(animateCameraMovement);
});
