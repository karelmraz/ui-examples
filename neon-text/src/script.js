import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Canvas & Scene Setup
 */
// Selects the canvas in HTML
const canvas = document.querySelector('canvas.webgl');
// Main container for all objects
const scene = new THREE.Scene();

/**
 * Camera Setup
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// FOV, aspect ratio
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
// Slightly offset for perspective
camera.position.set(2.5, 0, 5);
scene.add(camera);

/**
 * Renderer Setup
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true // Smooth edges
});
// Match window size
renderer.setSize(sizes.width, sizes.height); 
// Optimize for HiDPI screens
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Tone mapping for HDR effect
renderer.toneMapping = THREE.ReinhardToneMapping;
// Brightness control
renderer.toneMappingExposure = 1.8;

/**
 * Postprocessing (Bloom effect)
 */
const composer = new EffectComposer(renderer);

// Base render pass
composer.addPass(new RenderPass(scene, camera));

// Bloom effect for neon glow
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.15, // Strength
    0.1,  // Radius
    0.01  // Threshold
);
composer.addPass(bloomPass);

// Final pass for color correction/output
const outputPass = new OutputPass();
composer.addPass(outputPass);

/**
 * Function for creating a 3D text mesh with material
 */
const createTextMesh = (
    text, font, color, emissiveColor, emissiveIntensity, 
    position, size = 0.5, depth = 0.2, curveSegments = 10
) => {
    const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        depth: depth,
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

/**
 * Mouse Tracking (for camera rotation)
 */
const mouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
    // Normalize mouse to range [-1, 1]
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

/**
 * Scroll Zoom Handling
 */
let targetZoom = camera.position.z;
window.addEventListener("wheel", (event) => {
  targetZoom += event.deltaY * 0.01;

  // Limit zoom range
  targetZoom = THREE.MathUtils.clamp(targetZoom, 2, 15);
});

/**
 * Handle resizing of window
 */
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    composer.setSize(sizes.width, sizes.height);
});

/**
 * Text Mesh Setup
 */
let titleMesh, subtitleMesh;
const minBrightness = 0;
const maxBrightness = 20;

// Randomized blinking effect
let blinkTimer = Math.random() * 10;
let blinkSpeed = Math.random() * 0.2;

/**
 * Animation Loop
 */
const animate = () => {
    requestAnimationFrame(animate);

    // Randomize blink speed slightly every frame
    blinkSpeed = Math.random() * 0.3;

    // Smooth camera rotation based on mouse position
    const targetRotationX = mouse.y * 0.2;
    const targetRotationY = mouse.x * 0.2;
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotationX, 0.05);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotationY, 0.05);

    // Smooth zoom transition
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZoom, 0.05);

    // Update blink timer
    blinkTimer += blinkSpeed + (Math.random() - 0.5) * 0.02;

    // Neon blinking effect (brightness controlled by sine wave)
    const blinkIntensity1 =
        Math.abs(Math.sin(blinkTimer)) * (maxBrightness - minBrightness) + minBrightness;

    if (titleMesh) {
        titleMesh.material.emissiveIntensity =
            THREE.MathUtils.clamp(blinkIntensity1, minBrightness, maxBrightness);
    }

    // Render with postprocessing
    composer.render();
};

// Call animate function
animate();

/**
 * Load Custom Font & Create Text
 */
const loader = new FontLoader();
loader.load(
    './neon-club-music.json', // Custom font file
    (font) => {
        // Create main title
        titleMesh = createTextMesh(
            'cyberpunk', font, 
            0xba008b, 0xba008b, 10,
            new THREE.Vector3(0, 0, 0.01)
        );

        // Create subtitle
        subtitleMesh = createTextMesh(
            'studios', font, 
            0xffdd00, 0xffdd00, 10, 
            new THREE.Vector3(0, -0.9, 0.01), 
            0.72
        );
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (err) => {
        console.error('An error happened while loading the font:', err);
    }
);