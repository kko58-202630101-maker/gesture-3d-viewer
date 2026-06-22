console.log("SCRIPT LOADED");

let scene, camera, renderer, model;

initThree();
initHand();

document.getElementById("fileInput").addEventListener("change", loadSTL);

// =====================
// THREE INIT
// =====================
function initThree() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
  renderer.setClearColor(0x222222);

  document.getElementById("container").appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5,5,5);
  scene.add(light);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// =====================
// STL LOAD
// =====================
function loadSTL(e) {
  console.log("FILE LOADED");

  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const loader = new THREE.STLLoader();
    const geo = loader.parse(event.target.result);

    geo.center();

    const mat = new THREE.MeshStandardMaterial({ color:0x00ffcc });

    if (model) scene.remove(model);

    model = new THREE.Mesh(geo, mat);
    model.scale.set(0.02,0.02,0.02);

    scene.add(model);

    console.log("MODEL ADDED");
  };

  reader.readAsArrayBuffer(file);
}

// =====================
// HAND TRACKING
// =====================
function initHand() {
  const video = document.getElementById("video");

  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands:1,
    minDetectionConfidence:0.6,
    minTrackingConfidence:0.6
  });

  hands.onResults(results => {
    if (!model) return;
    if (!results.multiHandLandmarks) return;

    const hand = results.multiHandLandmarks[0];
    const w = hand[0];

    model.rotation.y = (w.x - 0.5) * 6;
    model.rotation.x = (w.y - 0.5) * 6;
  });

  const cam = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480
  });

  cam.start();
}
