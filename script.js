let scene, camera, renderer, model;

initThree();
initHandTracking();

document.getElementById("fileInput").addEventListener("change", loadSTL);

function initThree() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight * 0.8);

  document.getElementById("container").appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  animate();
}

function loadSTL(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const loader = new THREE.STLLoader();
    const geometry = loader.parse(e.target.result);

    const material = new THREE.MeshNormalMaterial();
    model = new THREE.Mesh(geometry, material);

    scene.add(model);
  };

  reader.readAsArrayBuffer(file);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// ===== HAND TRACKING =====
function initHandTracking() {
  const videoElement = document.getElementById("video");

  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  hands.onResults(onHandResults);

  const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  cameraUtils.start();
}

function onHandResults(results) {
  if (!model) return;
  if (!results.multiHandLandmarks) return;

  const hand = results.multiHandLandmarks[0];

  // 손 기준점 (손목)
  const wrist = hand[0];

  const x = wrist.x;
  const y = wrist.y;

  // 회전 변환
  model.rotation.y = (x - 0.5) * 5;
  model.rotation.x = (y - 0.5) * 5;
}
