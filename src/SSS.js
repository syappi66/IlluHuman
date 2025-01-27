import * as THREE from "three";
import { SubsurfaceScatteringShader } from "three/addons/shaders/SubsurfaceScatteringShader.js";

export class SSSController {
  constructor(scene, renderer, model) {
    this.scene = scene;
    this.renderer = renderer;
    this.model = model;
    this.uniforms = null;
    this.originalMaterials = new Map();

    this.initMaterial();

    this.params = {
      enableSSS: false,
      diffuse: this.uniforms.diffuse.value.getHex(),
      shininess: this.uniforms.shininess.value,
      thicknessColor: this.uniforms.thicknessColor.value.getHex(),
      distortion: this.uniforms.thicknessDistortion.value,
      ambient: this.uniforms.thicknessAmbient.value,
      attenuation: this.uniforms.thicknessAttenuation.value,
      power: this.uniforms.thicknessPower.value,
      scale: this.uniforms.thicknessScale.value,
    };
  }

  initMaterial() {
    const shader = SubsurfaceScatteringShader;
    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    // デフォルト値の設定
    this.uniforms.diffuse.value = new THREE.Color(1.0, 0.2, 0.2);
    this.uniforms.shininess.value = 100;
    this.uniforms.thicknessColor.value = new THREE.Color(0.5, 0.3, 0.0);
    this.uniforms.thicknessDistortion.value = 0.5;
    this.uniforms.thicknessAmbient.value = 0.01;
    this.uniforms.thicknessAttenuation.value = 0.7;
    this.uniforms.thicknessPower.value = 8.0;
    this.uniforms.thicknessScale.value = 4.0;

    // デフォルトのthicknessMap
    this.uniforms.thicknessMap.value = new THREE.TextureLoader().load(
      "./resources/textures/water.jpg"
    );
  }

  createSSSMaterial() {
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: SubsurfaceScatteringShader.vertexShader,
      fragmentShader: SubsurfaceScatteringShader.fragmentShader,
      lights: true,
    });

    return material;
  }

  toggleSSS(enable) {
    if (enable) {
      this.applySSS();
    } else {
      this.removeSSS();
    }
  }

  applySSS() {
    if (!this.model) return;

    this.model.traverse((child) => {
      if (child.isMesh) {
        // オリジナルのマテリアルを保存
        if (!this.originalMaterials.has(child.uuid)) {
          this.originalMaterials.set(child.uuid, child.material);
        }

        // 新しいSSSマテリアルを作成して適用
        child.material = this.createSSSMaterial();
      }
    });
  }

  removeSSS() {
    if (!this.model) return;

    this.model.traverse((child) => {
      if (child.isMesh) {
        const originalMaterial = this.originalMaterials.get(child.uuid);
        if (originalMaterial) {
          child.material = originalMaterial;
        }
      }
    });
  }

  // Method to update uniforms
  updateUniforms(params) {
    if (!this.model) return;

    for (const [key, value] of Object.entries(params)) {
      this.uniforms[key].value = value;
    }

    this.model.traverse((child) => {
      if (child.isMesh && child.material.type === "ShaderMaterial") {
        for (const [key, value] of Object.entries(params)) {
          if (child.material.uniforms[key]) {
            child.material.uniforms[key].value = value;
          }
        }
      }
    });
  }

  dispose() {
    this.originalMaterials.clear();
    this.model = null;
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
      this.updateUniforms({ diffuse: new THREE.Color(val) });
    });

    sssFolder.add(this.params, "shininess", 0, 1000).onChange((val) => {
      this.updateUniforms({ shininess: val });
    });

    sssFolder.addColor(this.params, "thicknessColor").onChange((val) => {
      this.updateUniforms({ thicknessColor: new THREE.Color(val) });
    });

    sssFolder.add(this.params, "distortion", 0.01, 1).onChange((val) => {
      this.updateUniforms({ thicknessDistortion: val });
    });

    sssFolder.add(this.params, "ambient", 0.0, 5.0).onChange((val) => {
      this.updateUniforms({ thicknessAmbient: val });
    });

    sssFolder.add(this.params, "attenuation", 0.01, 5.0).onChange((val) => {
      this.updateUniforms({ thicknessAttenuation: val });
    });

    sssFolder.add(this.params, "power", 0.01, 16.0).onChange((val) => {
      this.updateUniforms({ thicknessPower: val });
    });

    sssFolder.add(this.params, "scale", 0.01, 50.0).onChange((val) => {
      this.updateUniforms({ thicknessScale: val });
    });

    sssFolder.open();
  }
}
