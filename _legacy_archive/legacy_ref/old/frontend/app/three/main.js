import * as THREE from "three";

export default function _Render_(element) {
  const width = window.innerWidth,
    height = window.innerHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(0, 5, 5); // up + back
  camera.lookAt(0, 0, 0); // look at center

  const geometry = new THREE.PlaneGeometry(3, 3);
  const material = new THREE.MeshBasicMaterial({
    color: "gray",
    side: THREE.DoubleSide,
  });

  const floor = new THREE.Mesh(geometry, material);

  floor.rotation.x = -Math.PI / 1.7;

  scene.add(floor);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  element.appendChild(renderer.domElement);

  renderer.render(scene, camera);
}
 
