export const vehicles = [
  { id: 'offroader', name: 'Offroader', description: 'Brunos Offroader · wendig und verspielt', asset: 'models/bruno/offroader.glb', acceleration:19, maxSpeed:16, boostSpeed:26, steering:1.75, halfWidth:0.8, halfLength:1.45 },
  { id: 'sport', name: 'Sportwagen', description: 'Kenney Sports Sedan · schneller und direkter', asset:'models/car/car.glb', acceleration:24, maxSpeed:21, boostSpeed:31, steering:2.0, halfWidth:0.85, halfLength:1.8 },
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
