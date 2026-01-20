import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

const geometry = new THREE.IcosahedronGeometry(2.8, 1);
const material = new THREE.MeshStandardMaterial({
  color: 0x4f46e5,
  metalness: 0.4,
  roughness: 0.2,
  emissive: 0x0f172a,
});
const shape = new THREE.Mesh(geometry, material);
shape.position.set(0, 0, 0);
scene.add(shape);

const ringGeometry = new THREE.TorusGeometry(4.2, 0.25, 16, 100);
const ringMaterial = new THREE.MeshStandardMaterial({
  color: 0x22d3ee,
  metalness: 0.3,
  roughness: 0.3,
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 3;
scene.add(ring);

const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

const pointLight = new THREE.PointLight(0xffffff, 1.2);
pointLight.position.set(5, 6, 4);
scene.add(pointLight);

camera.position.z = 8;

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animate() {
  shape.rotation.x += 0.003;
  shape.rotation.y += 0.002;
  ring.rotation.z += 0.0015;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
resize();
animate();
