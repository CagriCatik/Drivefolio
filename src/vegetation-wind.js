export function createVegetationWind(wind,strength=1){
 return shader=>{shader.uniforms.uCampusWind=wind;shader.vertexShader='uniform float uCampusWind;\n'+shader.vertexShader.replace('#include <project_vertex>',`vec4 mvPosition=vec4(transformed,1.0);
 #ifdef USE_INSTANCING
 mvPosition=instanceMatrix*mvPosition;
 #endif
 float sway=sin(uCampusWind*0.85+mvPosition.x*0.38+mvPosition.z*0.31);
 mvPosition.x+=sway*${(0.065*strength).toFixed(5)}*min(mvPosition.y,4.0);
 mvPosition.z+=sin(uCampusWind*0.67+mvPosition.z*0.4)*${(0.035*strength).toFixed(5)}*min(mvPosition.y,4.0);
 mvPosition=modelViewMatrix*mvPosition;
 gl_Position=projectionMatrix*mvPosition;`);};
}
