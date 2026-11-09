export const experimentIds=['jetracer','radar','frenet'];
export const relatedProjects={jetracer:['radar','autonomy'],radar:['autonomy','frenet'],autonomy:['frenet','fmt'],frenet:['fmt','dynamics'],fmt:['dynamics','jetracer'],dynamics:['jetracer','agents'],agents:['autonomy','radar']};
export function createDiscovery(ids,storage){
 const allowed=new Set(ids),key='drivefolio-discovery-v1';let saved={};try{saved=JSON.parse(storage?.getItem(key)??'{}')??{};}catch{}
 const clean=(values)=>new Set(Array.isArray(values)?values.filter(id=>allowed.has(id)):[]);
 const viewed=clean(saved.viewed),tried=clean(saved.tried),completed=clean(saved.completed);
 const save=()=>{try{storage?.setItem(key,JSON.stringify({viewed:[...viewed],tried:[...tried],completed:[...completed]}));}catch{}};
 return {viewed,tried,completed,mark(id,kind='viewed'){if(!allowed.has(id))return;viewed.add(id);if(kind==='tried'||kind==='completed')tried.add(id);if(kind==='completed')completed.add(id);save();},next(id){const order=[...(relatedProjects[id]??[]),...ids];return order.find(next=>next!==id&&!viewed.has(next))??order.find(next=>next!==id&&experimentIds.includes(next)&&!tried.has(next))??order.find(next=>next!==id);}};
}
