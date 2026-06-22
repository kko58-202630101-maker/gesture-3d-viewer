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

  // 🔥 조명 (필수)
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  animate();
}

function loadSTL(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const loader = new THREE.STLLoader();
    const geometry = loader.parse(e.target.result);

    // 🔥 중심 정렬 (안 하면 화면 밖에 있음)
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      metalness: 0.3,
      roughness: 0.5,
    });

    if (model) scene.remove(model);

    model = new THREE.Mesh(geometry, material);

    // 🔥 크기 자동 조절 (STL 크기 문제 해결)
    model.scale.set(0.01, 0.01, 0.01);

    scene.add(model);
  };

  reader.readAsArrayBuffer(file);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// ======================
// 🖐 HAND TRACKING
// ======================

function initHandTracking() {
  const videoElement = document.getElementById("video");

  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  hands.onResults(onHandResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  camera.start();
}

function onHandResults(results) {
  if (!model) return;

  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return;
  }

  const hand = results.multiHandLandmarks[0];
  const wrist = hand[0];

  const x = wrist.x;
  const y = wrist.y;

  // 🎮 손 움직임 → 회전
  model.rotation.y = (x - 0.5) * 5;
  model.rotation.x = (y - 0.5) * 5;
}
