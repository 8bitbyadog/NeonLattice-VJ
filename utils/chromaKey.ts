import * as THREE from 'three';

export const injectChromaKey = (shader: THREE.Shader) => {
  // Add uniforms
  shader.uniforms.uChromaKeyColor = { value: new THREE.Color(0x000000) };
  shader.uniforms.uChromaKeyThreshold = { value: 0.0 };
  shader.uniforms.uChromaKeyEnabled = { value: 0 };

  // Inject uniform definitions
  shader.fragmentShader = `
    uniform vec3 uChromaKeyColor;
    uniform float uChromaKeyThreshold;
    uniform float uChromaKeyEnabled;
    ${shader.fragmentShader}
  `;

  // Inject logic before dithering (end of main)
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <dithering_fragment>',
    `
    #include <dithering_fragment>
    if (uChromaKeyEnabled > 0.5) {
      // Calculate distance between fragment color and key color
      // gl_FragColor is the final output color
      float dist = distance(gl_FragColor.rgb, uChromaKeyColor);
      
      // Hard cutoff
      // if (dist < uChromaKeyThreshold) discard;
      
      // Soft cutoff using alpha
      float alphaFactor = smoothstep(uChromaKeyThreshold * 0.8, uChromaKeyThreshold * 1.2, dist);
      gl_FragColor.a *= alphaFactor;
      
      if (gl_FragColor.a < 0.01) discard;
    }
    `
  );
};

// Helper to update uniforms on frame
export const updateChromaKeyUniforms = (
  material: THREE.Material | THREE.PointsMaterial, 
  layer: { chromaKeyColor: string, chromaKeyThreshold: number, chromaKeyEnabled: boolean }
) => {
  if (material.userData.shader) {
    const s = material.userData.shader;
    s.uniforms.uChromaKeyColor.value.set(layer.chromaKeyColor);
    s.uniforms.uChromaKeyThreshold.value = layer.chromaKeyThreshold;
    s.uniforms.uChromaKeyEnabled.value = layer.chromaKeyEnabled ? 1 : 0;
  }
};