import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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

    // Clock
    this.clock = new THREE.Clock();

    // GLTF Loader
    this.loader = new GLTFLoader();
    this.mixer = null;
    this.currentModel = null;

    // Models and textures
    this.models = [
      "the queen of swords",
      "treeman",
      "santa muerte",
      "ectoparasitoid",
      "Michelle",
      "Soldier",
      "Walking astronaut",
    ];
    this.textures = { none: null };

    // Load initial model
    this.loadModel(this.models[0]);

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

    const params = {
      model: this.models[0],
      // ...existing spotlight params...
    };

    gui.add(params, "model", this.models).onChange(value => this.loadModel(value));
    // ...existing GUI setup...
  }

  loadModel(modelName) {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.currentModel.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    }

    this.loader.load(`/resources/models/gltf/${modelName}.glb`, gltf => {
      if (!gltf) {
        console.error(`Failed to load model: ${modelName}`);
        return;
      }
      this.currentModel = gltf.scene;
      this.currentModel.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      this.currentModel.scale.set(1, 1, 1);
      this.currentModel.position.set(0, 0, 0);
      this.scene.add(this.currentModel);

      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.currentModel);
        const action = this.mixer.clipAction(gltf.animations[0]);
        action.play();
      } else {
        this.mixer = null;
      }
    });
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

    // Update mixer
    const delta = this.clock.getDelta();
    if (this.mixer) this.mixer.update(delta);

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Start application
window.addEventListener("DOMContentLoaded", () => {
  new App();
});
