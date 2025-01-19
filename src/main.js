import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { SpotLightController } from "./SpotLight";

class App {
  constructor() {
    // Create scene
    this.scene = new THREE.Scene();

    // Camera settings
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view (FOV)
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // near plane
      1000 // far plane
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer settings
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // OrbitControls settings
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Create ground
    this.createGround();

    // Add test objects (to check the effect of the spotlight)
    this.addTestObjects();

    // Initialize spotlight controller
    this.spotlightController = new SpotLightController(this.scene, this.renderer);

    // GUI settings
    this.setupGUI();

    // Handle window resize
    window.addEventListener("resize", this.onWindowResize.bind(this), false);

    // Start animation
    this.animate();
  }

  createGround() {
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  addTestObjects() {
    // Place multiple boxes
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const boxMaterial = new THREE.MeshStandardMaterial({
          color: 0x808080,
          roughness: 0.7,
          metalness: 0.3,
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(i * 4, 0.75, j * 4);
        box.castShadow = true;
        box.receiveShadow = true;
        this.scene.add(box);
      }
    }
  }

  setupGUI() {
    const gui = new GUI();
    this.spotlightController.addToGUI(gui);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Update spotlight
    this.spotlightController.update();

    // Update controls
    this.controls.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Start application
window.addEventListener("DOMContentLoaded", () => {
  new App();
});
