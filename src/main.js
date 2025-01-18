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

    // オブジェクト作成関数の呼び出し
    this.createObjects();

    // スポットライトコントローラーの初期化
    this.spotlightController = new SpotLightController(this.scene, this.renderer);

    // GUIの設定
    this.setupGUI();

    // ウィンドウリサイズへの対応設定
    window.addEventListener("resize", this.onWindowResize.bind(this), false);

    // アニメーションの開始
    this.animate();
  }

  createObjects() {
    // 地面の作成（スポットライトの効果を確認するため）
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // テスト用の箱を追加
    const boxGeometry = new THREE.BoxGeometry(2, 4, 2);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      roughness: 0.7,
      metalness: 0.3,
    });
    this.box = new THREE.Mesh(boxGeometry, boxMaterial);
    this.box.position.y = 1;
    this.box.castShadow = true;
    this.scene.add(this.box);
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
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.spotlightController.update();
  }
}

// アプリケーションの開始
window.addEventListener("DOMContentLoaded", () => {
  new App();
});
