async function read(relative){
 const response=await fetch(new URL(relative,import.meta.url));
 if(!response.ok)throw new Error(`Catalog unavailable: ${relative}`);
 return response.json();
}
export async function loadCatalog(){
 try{
  const [catalog,config]=await Promise.all([read('data/catalog.json'),read('config.json')]);
  const sport=catalog.sports.find(s=>s.id==='skydiving'&&s.status==='active');
  if(!sport)throw new Error('Skydiving catalog is not configured');
  const entries=await Promise.all(sport.regions.map(async id=>{
   const base=`data/skydiving/regions/${id}/`;
   const [region,zones,courses,indoor]=await Promise.all(['region','venues','courses','indoor'].map(name=>read(base+name+'.json')));
   return {region,zones,courses,indoor};
  }));
  return {regions:entries.map(e=>e.region),zones:entries.flatMap(e=>e.zones),courses:entries.flatMap(e=>e.courses),indoorVenues:entries.flatMap(e=>e.indoor),repository:config.repository};
 }catch(error){
  document.querySelector('#app').textContent='资料暂时无法加载。请刷新重试。 / Unable to load information. Please reload.';
  throw error;
 }
}
