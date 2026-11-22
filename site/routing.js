const cache=new Map();let queue=Promise.resolve(),lastRequest=0;
const routeKey=(origin,venue)=>origin.join(',')+'>'+venue.coord.join(',');
export function formatDriving(route,lang){
 if(!route)return lang==='zh'?'驾车路线待查询':'Driving route pending';
 if(route.status==='loading')return lang==='zh'?'正在查询驾车路线…':'Loading driving route…';
 if(route.status!=='ok')return lang==='zh'?'驾车路线暂不可用 · 可打开导航':'Driving route unavailable · open Maps';
 const km=(route.distance/1000).toFixed(1),minutes=Math.max(1,Math.round(route.duration/60));
 const time=lang==='zh'?(minutes>=60?Math.floor(minutes/60)+' 小时 '+minutes%60+' 分钟':minutes+' 分钟'):(minutes>=60?Math.floor(minutes/60)+' h '+minutes%60+' min':minutes+' min');
 return lang==='zh'?`驾车 ${km} km · 约 ${time}`:`Drive ${km} km · about ${time}`;
}
export function getRoute(origin,venue){return origin?cache.get(routeKey(origin,venue)):null}
export function routeSummary(origin,venue,lang){return formatDriving(getRoute(origin,venue),lang)}
export function parseRouteTable(data,count){
 if(data.code!=='Ok'||!Array.isArray(data.distances?.[0])||!Array.isArray(data.durations?.[0]))throw new Error('Invalid route table');
 return Array.from({length:count},(_,i)=>{
  const distance=data.distances[0][i+1],duration=data.durations[0][i+1];
  return Number.isFinite(distance)&&distance>=0&&Number.isFinite(duration)&&duration>=0?{status:'ok',distance,duration}:{status:'unavailable'};
 });
}
export async function ensureRoutes(origin,venues,{force=false}={}){
 if(!origin||!venues.length)return false;
 const pending=venues.filter(z=>force||!cache.has(routeKey(origin,z))||Date.now()-cache.get(routeKey(origin,z)).fetched>1800000);
 if(!pending.length)return false;
 const fetched=Date.now();for(const z of pending)cache.set(routeKey(origin,z),{status:'loading',fetched});
 const work=async()=>{
  const wait=Math.max(0,1100-(Date.now()-lastRequest));if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
  lastRequest=Date.now();
  try{
   const coordinates=[origin,...pending.map(z=>z.coord)].map(([lat,lon])=>`${lon},${lat}`).join(';');
   const url=`https://router.project-osrm.org/table/v1/driving/${coordinates}?sources=0&annotations=distance,duration`;
   const response=await fetch(url,{signal:AbortSignal.timeout(18000)});if(!response.ok)throw new Error('Route service unavailable');
   const routes=parseRouteTable(await response.json(),pending.length);
   pending.forEach((z,i)=>cache.set(routeKey(origin,z),{...routes[i],fetched:Date.now()}));
  }catch{pending.forEach(z=>cache.set(routeKey(origin,z),{status:'unavailable',fetched:Date.now()}))}
 };
 queue=queue.then(work,work);await queue;return true;
}
