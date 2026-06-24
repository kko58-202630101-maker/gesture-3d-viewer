let scene;
let camera;
let renderer;
let model;

initThree();
initHandTracking();

function initThree(){

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.z = 100;

renderer = new THREE.WebGLRenderer({
antialias:true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff,2);

light.position.set(50,50,50);

scene.add(light);

animate();
}

function animate(){

requestAnimationFrame(animate);

renderer.render(scene,camera);

}
