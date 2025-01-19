from pygltflib import GLTF2

# Load the GLB file to check for animations
file_path = 'examples/sketchfab/Walking astronaut.glb'
gltf = GLTF2().load(file_path)

# Check if there are animations in the GLB file
animations = gltf.animations
animation_count = len(animations) if animations else 0

print(animation_count)
