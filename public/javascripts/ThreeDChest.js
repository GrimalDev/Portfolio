import * as THREE from '/threebuild/three.module.js';
import {GLTFLoader} from '/threejsm/loaders/GLTFLoader.js';

let scene;
let camera;
let renderer;
let model;
const modelContainer = await document.querySelector('.ddd-head');
let canvasHeight = modelContainer.clientHeight;
let canvasWidth = modelContainer.clientWidth;

let mouse = new THREE.Vector2();

let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1);
let raycaster = new THREE.Raycaster();
let pointOfIntersection = new THREE.Vector3();

const baseRotation = {
    x: 0.3,
    y: 2.2
}

const init = async () => {
    scene = new THREE.Scene();

    const fov = 40;
    const aspect = canvasWidth / canvasHeight;
    const near = 0.1;
    const far = 1000;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(0, 0, 8.5);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        antialias: false,
        canvas: modelContainer
    });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const loader = new GLTFLoader();
    await loader.load('/model/chest-model-v2-trimed.glb', (gltf)=>{
        model = gltf.scene.children[0];

        model.rotation.x += 0.5;

        scene.add(gltf.scene);
    });

    animate();
};

const render = () => {
    renderer.render(scene, camera);
};

const animate = () => {
    requestAnimationFrame(animate);

    if (model) { model.rotation.z += 0.02; }

    render();
};

window.onload = init;

// window.addEventListener("mousemove", onMouseMove, false);
// window.addEventListener("resize", onWindowResize, false);
//
// function onWindowResize() {
//     const modelContainerTemp = document.querySelector('.ddd-head');
//     camera.aspect = modelContainerTemp.clientWidth / modelContainerTemp.clientHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(modelContainerTemp.clientWidth, modelContainerTemp.clientHeight, false);
// }

function onMouseMove(event){
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, pointOfIntersection);
    model.lookAt(pointOfIntersection);
}

export default function loadThreeJS() {
    window.onload = init;
}