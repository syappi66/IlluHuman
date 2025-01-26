import * as THREE from "three";
import { SubsurfaceScatteringShader } from "three/addons/shaders/SubsurfaceScatteringShader.js";

export class SSSController {
  constructor(scene, renderer, model) {
    this.scene = scene;
    this.renderer = renderer;
    this.model = model;
    this.uniforms = null;
    this.lights = [];
    this.originalMaterials = {};

    this.initMaterial();

    // Initial parameter settings
    this.params = {
      enableSSS: false,
      // map: this.uniforms["map"].value,
      diffuse: this.uniforms["diffuse"].value.getHex(),
      shininess: this.uniforms["shininess"].value,
      // thicknessMap: this.uniforms["thicknessMap"].value,
      thicknessColor: this.uniforms["thicknessColor"].value.getHex(),
      distortion: this.uniforms["thicknessDistortion"].value,
      ambient: this.uniforms["thicknessAmbient"].value,
      attenuation: this.uniforms["thicknessAttenuation"].value,
      power: this.uniforms["thicknessPower"].value,
      scale: this.uniforms["thicknessScale"].value,
    };
  }

  initMaterial() {
    const loader = new THREE.TextureLoader();
    const imgTexture = loader.load("./resources/textures/white.jpg");
    imgTexture.colorSpace = THREE.SRGBColorSpace;

    const thicknessTexture = loader.load("./resources/textures/water.jpg");
    imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;

    const shader = SubsurfaceScatteringShader;
    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    this.uniforms["map"].value = imgTexture;
    this.uniforms["diffuse"].value = new THREE.Color(1.0, 0.2, 0.2);
    this.uniforms["shininess"].value = 500;
    this.uniforms["thicknessMap"].value = thicknessTexture;
    this.uniforms["thicknessColor"].value = new THREE.Color(0.5, 0.3, 0.0);
    this.uniforms["thicknessDistortion"].value = 0.1;
    this.uniforms["thicknessAmbient"].value = 0.4;
    this.uniforms["thicknessAttenuation"].value = 0.8;
    this.uniforms["thicknessPower"].value = 2.0;
    this.uniforms["thicknessScale"].value = 16.0;
  }

  // Method to toggle SSS on/off
  toggleSSS(enable) {
    if (enable) {
      console.log("Applying SSS"); // debug
      this.applySSS(this.model);
    } else {
      console.log("Removing SSS"); // debug
      this.removeSSS(this.model);
    }
  }

  // Method to apply SSS material to a model
  applySSS(model) {
    // Save original materials
    model.traverse((child) => {
      if (child.isMesh) {
        this.originalMaterials[child.uuid] = child.material;
      }
    });

    // Apply SSS material
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: SubsurfaceScatteringShader.vertexShader,
      fragmentShader: SubsurfaceScatteringShader.fragmentShader,
      lights: true,
    });

    model.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
      }
    });
  }

  removeSSS(model) {
    console.log("Removing SSS"); // debug
    console.log(this.originalMaterials); // debug

    // Restore original materials
    model.traverse((child) => {
      if (child.isMesh && this.originalMaterials[child.uuid]) {
        child.material = this.originalMaterials[child.uuid];
      }
    });
  }

  // Method to update uniforms
  updateUniforms(params) {
    for (const [key, value] of Object.entries(params)) {
      if (this.uniforms[key]) {
        this.uniforms[key].value = value;
      }
    }
  }

  // Method to clean up resources
  dispose() {
    this.lights.forEach((light) => {
      if (light.parent) {
        light.parent.remove(light);
      }
      if (light.geometry) {
        light.geometry.dispose();
      }
      if (light.material) {
        light.material.dispose();
      }
    });
    this.lights = [];
  }

  // Method to add SSS settings to GUI
  addToGUI(gui) {
    const sssFolder = gui.addFolder("Subsurface Scattering");

    sssFolder
      .add(this.params, "enableSSS")
      .name("Enable SSS")
      .onChange((value) => {
        this.toggleSSS(value);
      });

    sssFolder.addColor(this.params, "diffuse").onChange((val) => {
      this.uniforms["diffuse"].value = new THREE.Color(val);
    });

    sssFolder.add(this.params, "shininess", 0, 1000).onChange((val) => {
      this.uniforms["shininess"].value = val;
    });

    sssFolder.addColor(this.params, "thicknessColor").onChange((val) => {
      this.uniforms["thicknessColor"].value = new THREE.Color(val);
    });

    sssFolder.add(this.params, "distortion", 0.01, 1).onChange((val) => {
      this.uniforms["thicknessDistortion"].value = val;
    });

    sssFolder.add(this.params, "ambient", 0.01, 5.0).onChange((val) => {
      this.uniforms["thicknessAmbient"].value = val;
    });

    sssFolder.add(this.params, "attenuation", 0.01, 5.0).onChange((val) => {
      this.uniforms["thicknessAttenuation"].value = val;
    });

    sssFolder.add(this.params, "power", 0.01, 16.0).onChange((val) => {
      this.uniforms["thicknessPower"].value = val;
    });

    sssFolder.add(this.params, "scale", 0.01, 50.0).onChange((val) => {
      this.uniforms["thicknessScale"].value = val;
    });

    sssFolder.open();
  }
}
