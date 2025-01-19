import * as THREE from "three";

export class SpotLightController {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    // Create spotlight
    this.spotlight = new THREE.SpotLight(0xffffff, 100);
    this.spotlight.position.set(5, 10, 0);
    this.spotlight.angle = Math.PI / 6;
    this.spotlight.penumbra = 0.1;
    this.spotlight.decay = 1.5;
    this.spotlight.distance = 50;

    // Shadow settings
    this.spotlight.castShadow = true;
    this.spotlight.shadow.mapSize.width = 1024;
    this.spotlight.shadow.mapSize.height = 1024;
    this.spotlight.shadow.camera.near = 1;
    this.spotlight.shadow.camera.far = 60;
    this.spotlight.shadow.focus = 1;

    // Spotlight target
    this.spotlight.target.position.set(0, 0, 0);
    scene.add(this.spotlight.target);
    scene.add(this.spotlight);

    // Add helper
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotlight);
    scene.add(this.spotLightHelper);

    // Parameters for animation
    this.animationParams = {
      enabled: false,
      speed: 1,
      rotationCenter: new THREE.Vector3(0, 0, 0),
      lastTime: 0, // Store the last animation time
    };

    // Calculate initial rotation angle based on position
    const initialRotationAngle = Math.atan2(
      this.spotlight.position.z - this.animationParams.rotationCenter.z,
      this.spotlight.position.x - this.animationParams.rotationCenter.x
    );

    // Initial parameter settings
    this.params = {
      color: this.spotlight.color.getHex(),
      intensity: this.spotlight.intensity,
      distance: this.spotlight.distance,
      angle: this.spotlight.angle,
      height: this.spotlight.position.y,
      rotationRadius: 5,
      rotationAngle: initialRotationAngle,
      penumbra: this.spotlight.penumbra,
      decay: this.spotlight.decay,
      focus: this.spotlight.shadow.focus,
      shadows: true,
      helper: true,
      // Animation settings
      animation: this.animationParams.enabled,
      animationSpeed: this.animationParams.speed,
      // Shadow quality settings
      shadowMapSize: this.spotlight.shadow.mapSize.width,
      shadowCameraNear: this.spotlight.shadow.camera.near,
      shadowCameraFar: this.spotlight.shadow.camera.far,
      // Additional settings
      showFrustum: false,
    };

    // Set initial position based on rotation angle
    this.updateSpotlightPosition();

    // Camera helper for shadows
    this.shadowCameraHelper = new THREE.CameraHelper(this.spotlight.shadow.camera);
    this.shadowCameraHelper.visible = false;
    scene.add(this.shadowCameraHelper);
  }

  updateSpotlightPosition() {
    this.spotlight.position.x =
      this.animationParams.rotationCenter.x +
      this.params.rotationRadius * Math.cos(this.params.rotationAngle);
    this.spotlight.position.z =
      this.animationParams.rotationCenter.z +
      this.params.rotationRadius * Math.sin(this.params.rotationAngle);
    this.spotLightHelper.update();
  }

  addToGUI(gui) {
    const spotlightFolder = gui.addFolder("Spotlight Settings");
    // Basic parameters
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
      .add(this.params, "rotationRadius", 0, 20)
      .name("Rotation Radius")
      .onChange(val => {
        if (!this.animationParams.enabled) {
          this.updateSpotlightPosition();
        }
      });

    spotlightFolder
      .add(this.params, "rotationAngle", 0, Math.PI * 2)
      .name("Rotation Angle")
      .onChange(val => {
        if (!this.animationParams.enabled) {
          this.updateSpotlightPosition();
        }
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

    // Animation settings
    const animationFolder = gui.addFolder("Animation Settings");
    animationFolder
      .add(this.params, "animation")
      .name("Enable Animation")
      .onChange(val => {
        this.animationParams.enabled = val;
        if (val) {
          // Store the current time when animation starts
          this.animationParams.lastTime = performance.now() / 1000;
        }
      });

    animationFolder
      .add(this.params, "animationSpeed", 0.1, 5)
      .name("Speed")
      .onChange(val => {
        this.animationParams.speed = val;
      });

    // Shadow settings
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

    // Show/hide helpers
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

    // Open folders
    spotlightFolder.open();
    animationFolder.open();
    shadowFolder.open();
    helperFolder.open();
  }

  update() {
    // Update animation
    if (this.animationParams.enabled) {
      const currentTime = performance.now() / 1000;
      const deltaTime = currentTime - this.animationParams.lastTime;

      // Update rotation angle based on time difference
      this.params.rotationAngle += deltaTime * this.animationParams.speed;

      // Keep the angle within 0 to 2π
      this.params.rotationAngle %= Math.PI * 2;

      // Update spotlight position based on current angle
      this.updateSpotlightPosition();

      // Update last time
      this.animationParams.lastTime = currentTime;

      // Always point the spotlight to the center
      this.spotlight.target.position.set(
        this.animationParams.rotationCenter.x,
        0,
        this.animationParams.rotationCenter.z
      );
    }

    // Update helper
    if (this.spotLightHelper) {
      this.spotLightHelper.update();
    }
  }
}
