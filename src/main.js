import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { SpotLightController } from "./SpotLight";

class App {
  constructor() {
    // シーンの作成
    this.scene = new THREE.Scene();

    // カメラの設定
    this.camera = new THREE.PerspectiveCamera(
      75, // 視野角（FOV）
      window.innerWidth / window.innerHeight, // アスペクト比
      0.1, // near plane
      1000 // far plane
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // レンダラーの設定
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // OrbitControlsの設定
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // 床の作成
    this.createGround();

    // テスト用のオブジェクトを追加（スポットライトの効果を確認するため）
    this.addTestObjects();

    // スポットライトコントローラーの初期化
    this.spotlightController = new SpotLightController(this.scene, this.renderer);

    // GUIの設定
    this.setupGUI();

    // ウィンドウリサイズへの対応設定
    window.addEventListener("resize", this.onWindowResize.bind(this), false);

    // アニメーションの開始
    this.animate();
  }

  createGround() {
    // 床の作成
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
    // 複数の箱を配置
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

    // スポットライトの更新
    this.spotlightController.update();

    // コントロールの更新
    this.controls.update();

    // シーンのレンダリング
    this.renderer.render(this.scene, this.camera);
  }
}

// アプリケーションの開始
window.addEventListener("DOMContentLoaded", () => {
  new App();
});
