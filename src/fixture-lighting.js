// A fixture's luminous surface and its actual light always switch together.
export function switchFixtures(lights,materials,night,power){
  lights.forEach(light=>{light.intensity=night?power:0;});
  materials.forEach(material=>{material.emissiveIntensity=night?1.6:0;});
}
