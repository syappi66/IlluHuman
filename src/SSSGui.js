import * as THREE from 'three';

export class SSSGuiController {
    constructor(gui, currentModel) {
        this.gui = gui;
        this.currentModel = currentModel;
        this.params = {
            reflection: 0.5,
            roughness: 0.5,
            metalness: 0.5,
        };
        this.init();
    }

    init() {
        const sssFolder = this.gui.addFolder('Subsurface Scattering');
        sssFolder.add(this.params, 'reflection', 0, 1).onChange((val) => this.updateMaterial('reflection', val));
        sssFolder.add(this.params, 'roughness', 0, 1).onChange((val) => this.updateMaterial('roughness', val));
        sssFolder.add(this.params, 'metalness', 0, 1).onChange((val) => this.updateMaterial('metalness', val));

        sssFolder.open();
    }

    updateMaterial(property, value) {
        if (this.currentModel) {
            this.currentModel.traverse((child) => {
                if (child.isMesh) {
                    child.material[property] = value;
                    child.material.needsUpdate = true;
                }
            });
        } 
    }
}
