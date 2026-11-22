const cache=new Map();let queue=Promise.resolve(),lastRequest=0;
const validCoord=coord=>Array.isArray(coord)&&coord.length===2&&coord.every(Number.isFinite)&&Math.abs(coord[0])<=90&&Math.abs(coord[1])<=180;
export function geocodingURL(query,{focus,endpoint='https://photon.komoot.io/api/'}={}){
 const url=new URL(endpoint);if(url.protocol!=='https:'||url.username||url.password)throw new Error('Invalid geocoder endpoint');
 url.search=new URLSearchParams({q:query.trim(),limit:'5',lang:'en'});
 if(validCoord(focus)){url.searchParams.set('lat',focus[0]);url.searchParams.set('lon',focus[1]);url.searchParams.set('zoom','8')}
 return url;
}
export function parseCandidates(data){
 if(!Array.isArray(data?.features))throw new Error('Invalid place-search response');
 const seen=new Set();return data.features.flatMap(feature=>{
  const coordinates=feature.geometry?.coordinates,p=feature.properties||{},coord=coordinates?.length===2?[coordinates[1],coordinates[0]]:null;
  if(!validCoord(coord))return [];
  const street=[p.housenumber,p.street].filter(Boolean).join(' '),title=String(p.name||street||p.city||p.district||p.state||p.country||'').trim();if(!title)return [];
  const parts=[street,p.name,p.district,p.city,p.county,p.state,p.postcode,p.country].filter(value=>typeof value==='string'&&value.trim());
  const label=[...new Set(parts)].join(', '),key=label.toLocaleLowerCase();if(seen.has(key))return [];seen.add(key);
  return [{title,label,country:String(p.country||''),coord}];
 }).slice(0,5);
}
export async function searchCandidates(query,options={}){
 const url=geocodingURL(query,options),key=url.toString(),cached=cache.get(key);if(cached&&Date.now()-cached.fetched<600000)return cached.results;
 const work=async()=>{
  const wait=Math.max(0,1100-(Date.now()-lastRequest));if(wait)await new Promise(resolve=>setTimeout(resolve,wait));lastRequest=Date.now();
  const response=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Place search unavailable');
  const results=parseCandidates(await response.json());cache.set(key,{results,fetched:Date.now()});return results;
 };
 const result=queue.then(work,work);queue=result.catch(()=>{});return result;
}
