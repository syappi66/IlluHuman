import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SpotLightController } from "./SpotLight";
import { TextureController } from "./Texture";
import { GuiStyler } from "./GUIStyle";
import { SSSController } from "./SSS";

class App {
  constructor() {
    // Create scene
    this.scene = new THREE.Scene();

    // Camera settings
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer settings
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    // OrbitControls settings
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target.set(0, 1, 0);
    this.controls.update();

    // Lighting
    // const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.15);
    // this.scene.add(ambient);

    // Create ground
    this.createGround();

    // Initialize Spotlight Controller with different settings
    this.spotlightController1 = new SpotLightController(
      this.scene,
      this.renderer,
      {
        color: 0xd5f1ff, // blue
        position: [5, 10, 5], // start point
      }
    );

    this.spotlightController2 = new SpotLightController(
      this.scene,
      this.renderer,
      {
        color: 0xfffef4, // yellow
        position: [-5, 8, -5], // start point
      }
    );

    // Initialize Texture Controller
    this.textureController = new TextureController(this.renderer);

    // Initialize SSS Controller
    this.sssController = new SSSController(
      this.scene,
      this.renderer,
      this.currentModel
    );

    // Clock
    this.clock = new THREE.Clock();

    // GLTF Loader
    this.loader = new GLTFLoader();
    this.mixer = null;
    this.currentModel = null;

    // Models and textures
    this.models = [
      "Sphere", // For Debugging
      "Wave hand astronaut",
      "the queen of swords",
      "treeman",
      "santa muerte",
      "ectoparasitoid",
      "Michelle",
      "Soldier",
      "Walking astronaut",
    ];

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
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x606060,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.set(0, 0, 0);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  setupGUI() {
    const gui = new GUI();

    // Spotlight settings in GUI
    this.spotlightController1.addToGUI(gui, "1");
    this.spotlightController2.addToGUI(gui, "2");

    const textures = this.textureController.getTextures();
    const backgrounds = this.textureController.getBackgrounds();

    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // this.scene.add(ambientLight);

    const params = {
      Model: this.models[0],
      "Light Map": "none",
      Background: "none",
      roughness: 0.5,
      metalness: 0.5,
      reflection: 0.5,
    };

    const modelFolder = gui.addFolder("Model");
    modelFolder
      .add(params, "Model", this.models)
      .onChange((value) => this.loadModel(value));
    modelFolder
      .add(params, "Light Map", Object.keys(textures))
      .onChange((value) => {
        this.spotlightController1.spotlight.map = textures[value];
      });
    modelFolder
      .add(params, "Background", Object.keys(backgrounds))
      .onChange((value) => {
        this.textureController.switchBackground(this.scene, value);
      });
    modelFolder.open();

    // Physical properties settings in GUI
    const sssFolder = gui.addFolder("Physical Properties");
    sssFolder.add(params, "reflection", 0, 1).onChange((val) => {
      if (this.currentModel) {
        this.currentModel.traverse((child) => {
          if (child.isMesh) {
            child.material.reflection = val;
          }
        });
      }
    });
    sssFolder.add(params, "roughness", 0, 1).onChange((val) => {
      if (this.currentModel) {
        this.currentModel.traverse((child) => {
          if (child.isMesh) {
            child.material.roughness = val;
          }
        });
      }
    });
    sssFolder.add(params, "metalness", 0, 1).onChange((val) => {
      if (this.currentModel) {
        this.currentModel.traverse((child) => {
          if (child.isMesh) {
            child.material.metalness = val;
          }
        });
      }
    });
    sssFolder.open();

    // SSS settings in GUI
    this.sssController.addToGUI(gui);

    //GUI style
    GuiStyler.styleExistingFolders(gui);
  }

  loadModel(modelName) {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.currentModel.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      this.sssController.dispose();
    }

    if (modelName === "Sphere") {
      const sphere = this.createSphere();
      this.currentModel = sphere;
      this.scene.add(sphere);

      // Update SSSController
      this.updateSSSController();
    } else {
      this.loader.load(`./resources/models/gltf/${modelName}.glb`, (gltf) => {
        if (!gltf) {
          console.error(`Failed to load model: ${modelName}`);
          return;
        }
        this.currentModel = gltf.scene;
        this.currentModel.traverse((child) => {
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

        // Update SSSController
        this.updateSSSController();
      });
    }
  }

  updateSSSController() {
    // Update SSSController model
    this.sssController.model = this.currentModel;
    // Reapply SSS if enabled
    if (this.sssController.params.enableSSS) {
      this.sssController.applySSS(this.currentModel);
    }
  }

  createSphere() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.position.set(0, 3, 0);
    return sphere;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Update Spotlight
    this.spotlightController1.update("clock");
    this.spotlightController2.update("anti");

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
