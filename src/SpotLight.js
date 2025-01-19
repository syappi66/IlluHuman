import * as THREE from "three";

export class SpotLightController {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    // スポットライトの作成
    this.spotlight = new THREE.SpotLight(0xffffff, 100);
    this.spotlight.position.set(5, 10, 0);
    this.spotlight.angle = Math.PI / 6;
    this.spotlight.penumbra = 0.1;
    this.spotlight.decay = 1.5;
    this.spotlight.distance = 50;

    // 影の設定
    this.spotlight.castShadow = true;
    this.spotlight.shadow.mapSize.width = 1024;
    this.spotlight.shadow.mapSize.height = 1024;
    this.spotlight.shadow.camera.near = 1;
    this.spotlight.shadow.camera.far = 60;
    this.spotlight.shadow.focus = 1;

    // スポットライトのターゲット
    this.spotlight.target.position.set(0, 0, 0);
    scene.add(this.spotlight.target);
    scene.add(this.spotlight);

    // ヘルパーの追加
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotlight);
    scene.add(this.spotLightHelper);
    // アニメーション用のパラメータ
    this.animationParams = {
      enabled: false,
      speed: 1,
      rotationCenter: new THREE.Vector3(0, 0, 0),
    };

    // パラメータの初期設定
    this.params = {
      color: this.spotlight.color.getHex(),
      intensity: this.spotlight.intensity,
      distance: this.spotlight.distance,
      angle: this.spotlight.angle,
      height: this.spotlight.position.y,
      penumbra: this.spotlight.penumbra,
      decay: this.spotlight.decay,
      focus: this.spotlight.shadow.focus,
      shadows: true,
      helper: true,
      // アニメーション設定
      animation: this.animationParams.enabled,
      animationSpeed: this.animationParams.speed,
      // 影の品質設定
      shadowMapSize: this.spotlight.shadow.mapSize.width,
      shadowCameraNear: this.spotlight.shadow.camera.near,
      shadowCameraFar: this.spotlight.shadow.camera.far,
      // 追加の設定
      showFrustum: false,
    };

    // 影用のカメラヘルパー
    this.shadowCameraHelper = new THREE.CameraHelper(this.spotlight.shadow.camera);
    this.shadowCameraHelper.visible = false;
    scene.add(this.shadowCameraHelper);
  }

  addToGUI(gui) {
    const spotlightFolder = gui.addFolder("Spotlight Settings");
    // 基本パラメータ
    spotlightFolder
      .addColor(this.params, "color")
      .name("Light Color")
      .onChange(val => {
        this.spotlight.color.setHex(val);
        this.spotLightHelper.update();
      });

    spotlightFolder
      .add(this.params, "intensity", 0, 200)
      .name("Intensity")
      .onChange(val => {
        this.spotlight.intensity = val;
        this.spotLightHelper.update();
      });

    spotlightFolder
      .add(this.params, "distance", 0, 100)
      .name("Distance")
      .onChange(val => {
        this.spotlight.distance = val;
        this.spotLightHelper.update();
      });

    spotlightFolder
      .add(this.params, "angle", 0, Math.PI / 2)
      .name("Angle")
      .onChange(val => {
        this.spotlight.angle = val;
        this.spotLightHelper.update();
      });

    spotlightFolder
      .add(this.params, "height", 0, 20)
      .name("Height")
      .onChange(val => {
        this.spotlight.position.y = val;
        this.spotLightHelper.update();
      });

    spotlightFolder
      .add(this.params, "penumbra", 0, 1)
      .name("Penumbra")
      .onChange(val => {
        this.spotlight.penumbra = val;
        this.spotLightHelper.update();
      });

    spotlightFolder
      .add(this.params, "decay", 0, 2)
      .name("Decay")
      .onChange(val => {
        this.spotlight.decay = val;
        this.spotLightHelper.update();
      });

    // アニメーション設定
    const animationFolder = gui.addFolder("Animation Settings");
    animationFolder
      .add(this.params, "animation")
      .name("Enable Animation")
      .onChange(val => {
        this.animationParams.enabled = val;
      });

    animationFolder
      .add(this.params, "animationSpeed", 0.1, 5)
      .name("Speed")
      .onChange(val => {
        this.animationParams.speed = val;
      });

    // 影の設定
    const shadowFolder = gui.addFolder("Shadow Settings");
    shadowFolder
      .add(this.params, "shadows")
      .name("Enable Shadows")
      .onChange(val => {
        this.renderer.shadowMap.enabled = val;
        this.spotlight.castShadow = val;
        this.scene.traverse(child => {
          if (child.material) {
            child.material.needsUpdate = true;
          }
        });
      });

    shadowFolder
      .add(this.params, "focus", 0, 1)
      .name("Shadow Focus")
      .onChange(val => {
        this.spotlight.shadow.focus = val;
      });

    shadowFolder
      .add(this.params, "shadowMapSize", [256, 512, 1024, 2048, 4096])
      .name("Shadow Map Size")
      .onChange(val => {
        this.spotlight.shadow.mapSize.width = val;
        this.spotlight.shadow.mapSize.height = val;
        this.spotlight.shadow.map?.dispose();
        this.spotlight.shadow.map = null;
      });

    shadowFolder
      .add(this.params, "shadowCameraNear", 0.1, 10)
      .name("Shadow Camera Near")
      .onChange(val => {
        this.spotlight.shadow.camera.near = val;
        this.spotlight.shadow.camera.updateProjectionMatrix();
        this.shadowCameraHelper.update();
      });

    shadowFolder
      .add(this.params, "shadowCameraFar", 10, 100)
      .name("Shadow Camera Far")
      .onChange(val => {
        this.spotlight.shadow.camera.far = val;
        this.spotlight.shadow.camera.updateProjectionMatrix();
        this.shadowCameraHelper.update();
      });

    // ヘルパーの表示/非表示
    const helperFolder = gui.addFolder("Helpers");
    helperFolder
      .add(this.params, "helper")
      .name("Show Light Helper")
      .onChange(val => {
        this.spotLightHelper.visible = val;
      });

    helperFolder
      .add(this.params, "showFrustum")
      .name("Show Shadow Camera")
      .onChange(val => {
        this.shadowCameraHelper.visible = val;
      });

    // フォルダーを開いておく
    spotlightFolder.open();
    animationFolder.open();
    shadowFolder.open();
    helperFolder.open();
  }

  update() {
    // アニメーションの更新
    if (this.animationParams.enabled) {
      const time = (performance.now() / 1000) * this.animationParams.speed;

      // 固定の円周上の移動
      this.spotlight.position.x = Math.cos(time) * 5 + this.animationParams.rotationCenter.x;
      this.spotlight.position.z = Math.sin(time) * 5 + this.animationParams.rotationCenter.z;

      // スポットライトを常に中心を向くように設定
      this.spotlight.target.position.set(
        this.animationParams.rotationCenter.x,
        0,
        this.animationParams.rotationCenter.z
      );
    }

    // ヘルパーの更新
    if (this.spotLightHelper) {
      this.spotLightHelper.update();
    }
  }
}
