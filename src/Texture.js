import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export class TextureController {
  constructor(renderer) {
    this.renderer = renderer;
    this.textures = { none: null };
    this.backgrounds = { none: null };

    // Preload textures and backgrounds
    this.preloadTextures();
    this.preloadBackgrounds();
  }

  preloadTextures() {
    const textureLoader = new THREE.TextureLoader().setPath("/resources/textures/");
    const filenames = ["disturb.jpg", "water.jpg"];

    filenames.forEach((filename) => {
      const texture = textureLoader.load(filename);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      this.textures[filename] = texture;
    });
  }

  preloadBackgrounds() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
  
    const rgbeloader = new RGBELoader();
    const backgroundNames = ["Cloud Morning Bluesky", "Blue Local Star"];

    backgroundNames.forEach((filename) => {
      const texture = rgbeloader.load(`/resources/textures/equirectangular/${filename}.hdr`);
      this.backgrounds[filename] = texture;
    });
  
  }


  switchBackground(scene, backgroundName) {
    const texture = this.backgrounds[backgroundName];
    if (texture) {
      const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
      pmremGenerator.compileEquirectangularShader();
      const renderTarget = pmremGenerator.fromEquirectangular(texture);
      scene.background = renderTarget.texture; 
      scene.environment = renderTarget.texture; 
    } else {
      scene.background = new THREE.Color(0, 0, 0);
      scene.environment = null;
    }
  }

  getTextures() {
    return this.textures;
  }

  getBackgrounds() {
    return this.backgrounds;
  }
}
