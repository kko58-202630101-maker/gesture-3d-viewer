let scene, camera, renderer, model;

// ======================
// THREE.JS 초기화
// ======================
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
  renderer.setClearColor(0x111111);

  document.getElementById("container").appendChild(renderer.domElement);

  // 🔥 조명 (필수)
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

// ======================
// STL LOAD (핵심 수정)
// ======================
function loadSTL(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const loader = new THREE.STLLoader();
    const geometry = loader.parse(e.target.result);

    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
    });

    if (model) scene.remove(model);

    model = new THREE.Mesh(geometry, material);

    // 🔥 자동 크기 보정 (핵심)
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    const max = Math.max(size.x, size.y, size.z);
    const scale = 2 / max;

    model.scale.set(scale, scale, scale);

    scene.add(model);
  };

  reader.readAsArrayBuffer(file);
}

// ======================
// HAND TRACKING (핵심 안정버전)
// ======================
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
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

    const hand = results.multiHandLandmarks[0];
    const wrist = hand[0];

    const x = wrist.x;
    const y = wrist.y;

    // 🎮 회전 (이게 핵심)
    model.rotation.y = (x - 0.5) * 6;
    model.rotation.x = (y - 0.5) * 6;
  });

  const cam = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  cam.start();
}
