import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js";
import { STLLoader } from "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/STLLoader.js";

import { Hands } from "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
import { Camera } from "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

let scene, camera, renderer, model;

initThree();
initHandTracking();

document.getElementById("fileInput").addEventListener("change", loadSTL);

// =====================
// THREE INIT
// =====================
function initThree() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight * 0.8);

  document.getElementById("container").appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// =====================
// STL LOAD (FIXED)
// =====================
function loadSTL(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const loader = new STLLoader();
    const geometry = loader.parse(e.target.result);

    geometry.center();

    const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });

    if (model) scene.remove(model);

    model = new THREE.Mesh(geometry, material);

    model.scale.set(0.02, 0.02, 0.02);

    scene.add(model);
  };

  reader.readAsArrayBuffer(file);
}

// =====================
// HAND TRACKING (FIXED)
// =====================
function initHandTracking() {
  const video = document.getElementById("video");

  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  hands.onResults((results) => {
    if (!model) return;
    if (!results.multiHandLandmarks) return;

    const hand = results.multiHandLandmarks[0];
    const wrist = hand[0];

    model.rotation.y = (wrist.x - 0.5) * 6;
    model.rotation.x = (wrist.y - 0.5) * 6;
  });

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  camera.start();
}
