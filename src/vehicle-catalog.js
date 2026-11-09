export const vehicles = [
  { id: 'offroader', name: 'Offroader', description: 'Brunos Offroader · wendig und verspielt', asset: 'models/bruno/offroader.glb', acceleration:19, maxSpeed:16, boostSpeed:26, steering:1.75, halfWidth:0.8, halfLength:1.45 },
  { id: 'sport', name: 'Sportwagen', description: 'Kenney Sports Sedan · schneller und direkter', asset:'models/car/car.glb', acceleration:24, maxSpeed:21, boostSpeed:31, steering:2.0, halfWidth:0.85, halfLength:1.8 },
  { id:'suv',name:'SUV',description:'Kenney SUV · höher und gelassener',asset:'models/car/suv.glb',acceleration:17,maxSpeed:16,boostSpeed:23,steering:1.45,halfWidth:0.9,halfLength:1.75,visualWidth:1.9,lightHeight:0.85,paintFamily:'green' },
  { id:'race',name:'Rennwagen',description:'Kenney Race · offen, leicht und schnell',asset:'models/car/race.glb',acceleration:28,maxSpeed:27,boostSpeed:36,steering:2.15,halfWidth:0.9,halfLength:1.88,visualWidth:1.9,lightHeight:0.44 },
];
export const paints = [
  {id:'red',name:'Rot',color:'#db3b32'}, {id:'orange',name:'Orange',color:'#f19836'},
  {id:'white',name:'Weiß',color:'#eae4da'}, {id:'black',name:'Graphit',color:'#46434f'},
];
export function getVehicle(id) {
  const item=vehicles.find(v=>v.id===id);
  if(!item)throw new Error(`Unknown vehicle: ${id}`);
  return item;
}
export function getPaint(id) {
  const item=paints.find(p=>p.id===id);
  if(!item)throw new Error(`Unknown paint: ${id}`);
  return item;
}
