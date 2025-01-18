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

    // スポットライトをシーンに追加
    scene.add(this.spotlight);

    // ヘルパーの追加
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotlight);
    scene.add(this.spotLightHelper);

    // パラメータの初期設定
    this.params = {
      color: this.spotlight.color.getHex(),
      intensity: this.spotlight.intensity,
      distance: this.spotlight.distance,
      angle: this.spotlight.angle,
      penumbra: this.spotlight.penumbra,
      decay: this.spotlight.decay,
      focus: this.spotlight.shadow.focus,
      shadows: true,
      helper: true,
      // 位置パラメータ
      positionX: this.spotlight.position.x,
      positionY: this.spotlight.position.y,
      positionZ: this.spotlight.position.z,
      // ターゲット位置パラメータ
      targetX: this.spotlight.target.position.x,
      targetY: this.spotlight.target.position.y,
      targetZ: this.spotlight.target.position.z,
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
    const folder = gui.addFolder("Spotlight Settings");

    // 基本パラメータ
    folder
      .addColor(this.params, "color")
      .name("Light Color")
      .onChange(val => {
        this.spotlight.color.setHex(val);
        this.spotLightHelper.update();
      });

    folder
      .add(this.params, "intensity", 0, 10)
      .name("Intensity")
      .onChange(val => {
        this.spotlight.intensity = val;
        this.spotLightHelper.update();
      });

    folder
      .add(this.params, "distance", 0, 100)
      .name("Distance")
      .onChange(val => {
        this.spotlight.distance = val;
        this.spotLightHelper.update();
      });

    folder
      .add(this.params, "angle", 0, Math.PI / 2)
      .name("Angle")
      .onChange(val => {
        this.spotlight.angle = val;
        this.spotLightHelper.update();
      });

    folder
      .add(this.params, "penumbra", 0, 1)
      .name("Penumbra")
      .onChange(val => {
        this.spotlight.penumbra = val;
        this.spotLightHelper.update();
      });

    folder
      .add(this.params, "decay", 0, 2)
      .name("Decay")
      .onChange(val => {
        this.spotlight.decay = val;
        this.spotLightHelper.update();
      });

    // 位置の制御
    const positionFolder = gui.addFolder("Light Position");
    positionFolder
      .add(this.params, "positionX", -50, 50)
      .name("X")
      .onChange(val => {
        this.spotlight.position.x = val;
        this.spotLightHelper.update();
      });
    positionFolder
      .add(this.params, "positionY", 0, 50)
      .name("Y")
      .onChange(val => {
        this.spotlight.position.y = val;
        this.spotLightHelper.update();
      });
    positionFolder
      .add(this.params, "positionZ", -50, 50)
      .name("Z")
      .onChange(val => {
        this.spotlight.position.z = val;
        this.spotLightHelper.update();
      });

    // ターゲット位置の制御
    const targetFolder = gui.addFolder("Target Position");
    targetFolder
      .add(this.params, "targetX", -50, 50)
      .name("X")
      .onChange(val => {
        this.spotlight.target.position.x = val;
        this.spotLightHelper.update();
      });
    targetFolder
      .add(this.params, "targetY", -50, 50)
      .name("Y")
      .onChange(val => {
        this.spotlight.target.position.y = val;
        this.spotLightHelper.update();
      });
    targetFolder
      .add(this.params, "targetZ", -50, 50)
      .name("Z")
      .onChange(val => {
        this.spotlight.target.position.z = val;
        this.spotLightHelper.update();
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
    folder.open();
    positionFolder.open();
    shadowFolder.open();
    helperFolder.open();
  }

  update() {
    // 必要に応じてアップデート処理を追加
    this.spotLightHelper.update();
    this.shadowCameraHelper.update();
  }
}
