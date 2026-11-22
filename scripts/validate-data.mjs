import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const defaultRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const idPattern=/^[a-z0-9][a-z0-9-]*$/;
function check(ok,message){if(!ok)throw new Error(message)}
function date(value,label){check(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value).toISOString().slice(0,10)===value,`${label}: expected ISO date`)}
function bi(value,label){check(value&&typeof value.zh==='string'&&value.zh.trim()&&typeof value.en==='string'&&value.en.trim(),`${label}: provide zh and en`)}
function text(value,label){check(typeof value==='string'&&value.trim(),`${label}: expected nonempty text`)}
function url(value,label){let u;try{u=new URL(value)}catch{}check(u&&u.protocol==='https:'&&!u.username&&!u.password,`${label}: expected public HTTPS URL`)}
function coord(value,label){check(Array.isArray(value)&&value.length===2&&value.every(Number.isFinite)&&Math.abs(value[0])<=90&&Math.abs(value[1])<=180,`${label}: expected [latitude, longitude]`)}
function price(value,label,allowFalse=false){check(value===null||(allowFalse&&value===false)||(Number.isFinite(value)&&value>=0),`${label}: expected nonnegative price, null${allowFalse?' or false':''}`)}
function plain(value,label){if(typeof value==='string'){check(!/[<>\u0000]/.test(value),`${label}: plain text only, no HTML`)}else if(Array.isArray(value))value.forEach((v,i)=>plain(v,`${label}[${i}]`));else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>{plain(v,`${label}.${k}`);if((k==='source'||k.endsWith('Source'))&&v!==null)url(v,`${label}.${k}`)})}
function common(z,label,region){
 check(idPattern.test(z.id),`${label}: invalid id`);check(z.region===region,`${label}: region mismatch`);
 for(const key of ['name','city','address','country','subdivision','phone'])text(z[key],`${label}.${key}`);
 coord(z.coord,label);date(z.reviewedAt,label);url(z.source,label);plain(z,label);
 check(/^[+0-9() .-]+$/.test(z.phone),`${label}: invalid phone`);
 if(z.email!==undefined)check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(z.email),`${label}: invalid email`);
}
export function validateCatalog(root=defaultRoot){
 const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
 const catalog=read('data/catalog.json');check(catalog.schemaVersion===1,'Unsupported catalog schema');check(Array.isArray(catalog.sports),'Expected sports array');
 const sportIds=new Set(),venueIds=new Set(),courseIds=new Set(),regionIds=new Set();let venueCount=0,courseCount=0;
 for(const sport of catalog.sports){
  check(idPattern.test(sport.id)&&!sportIds.has(sport.id),'Invalid/duplicate sport id');sportIds.add(sport.id);bi(sport.name,sport.id);check(['active','planned'].includes(sport.status),'Invalid sport status');check(Array.isArray(sport.regions),'Expected sport.regions');
  check(sport.status!=='planned'||sport.regions.length===0,'Planned sports cannot publish regions');
  check(sport.id==='skydiving'||sport.status==='planned','New active sports need their own UI and qualification model');
  for(const id of sport.regions){
   check(idPattern.test(id)&&!regionIds.has(id),'Invalid/duplicate region id');regionIds.add(id);const base=`data/${sport.id}/regions/${id}/`;
   const region=read(base+'region.json');check(region.id===id,'Region id mismatch');bi(region.name,id);check(region.certificationSystem==='USPA','This skydiving UI currently supports USPA; another system requires a separate adapter');check(Array.isArray(region.origins),'Expected region origins');region.origins.forEach(o=>{text(o.name,'Origin name');bi(o.label,'Origin label');coord(o.coord,'Origin')});plain(region,id);
   const venues=read(base+'venues.json'),indoor=read(base+'indoor.json'),courses=read(base+'courses.json');
   check([venues,indoor,courses].every(Array.isArray),'Expected venue/course arrays');
   const localOutdoorIds=new Set(venues.map(v=>v.id));
   for(const z of [...venues,...indoor]){common(z,z.id,id);check(!venueIds.has(z.id),'Duplicate venue id: '+z.id);venueIds.add(z.id);venueCount++}
   for(const z of venues){
    check(/^[A-Z]{3}$/.test(z.currency),`${z.id}: ISO currency required`);check(z.minimum===null||(Number.isInteger(z.minimum)&&z.minimum>=2&&z.minimum<=5),`${z.id}: invalid license minimum`);
    check(typeof z.affGraduateAccepted==='boolean',`${z.id}: AFF graduate eligibility required`);bi(z.eligibility,z.id);bi(z.tandemNote,z.id);bi(z.note,z.id);bi(z.rentalNote,z.id);bi(z.learn,z.id);bi(z.learnNote,z.id);price(z.learnPrice,z.id);check(Array.isArray(z.policyQuotes)&&z.policyQuotes.every(q=>typeof q==='string'),`${z.id}: policy quotes required (empty array if none)`);
    for(const key of ['eligSource','addrSource','tandemSource','learnSource'])url(z[key],`${z.id}.${key}`);
    check(Array.isArray(z.tandemPrices)&&Array.isArray(z.liftPrices),`${z.id}: price arrays required`);
    const altitudes=new Set();for(const r of z.tandemPrices){check(Number.isFinite(r.altitude)&&r.altitude>0&&!altitudes.has(r.altitude),`${z.id}: invalid/duplicate tandem altitude`);altitudes.add(r.altitude);price(r.price,z.id);price(r.alternatePrice,z.id);bi(r.condition,z.id)}
    for(const r of z.liftPrices){check(r.altitude===null||(Number.isFinite(r.altitude)&&r.altitude>0),`${z.id}: invalid lift altitude`);price(r.own,z.id);price(r.rental,z.id,true)}
   }
   for(const z of indoor)url(z.sportSource,z.id);
   for(const c of courses){check(idPattern.test(c.id)&&!courseIds.has(c.id),'Invalid/duplicate course id');courseIds.add(c.id);check(localOutdoorIds.has(c.zone),`${c.id}: course points to unknown venue`);check(Number.isInteger(c.min)&&Number.isInteger(c.max)&&c.min>=0&&c.max<=5&&c.min<=c.max,`${c.id}: invalid experience range`);check(['license','skills','camera','wingsuit','balloon','teaching'].includes(c.kind),`${c.id}: invalid course kind`);for(const key of ['title','unit','note','tags'])bi(c[key],`${c.id}.${key}`);price(c.price,c.id);date(c.reviewedAt,c.id);url(c.source,c.id);check(/^[A-Z]{3}$/.test(c.currency),`${c.id}: currency required`);plain(c,c.id);courseCount++}
  }
 }
 const config=read('site/config.json');url(config.repository,'repository');url(config.geocodingEndpoint,'geocoding endpoint');return {regions:regionIds.size,venues:venueCount,courses:courseCount};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log('Catalog valid:',validateCatalog());
