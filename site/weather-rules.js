import {planningWindow} from './operating-window.js';
export const STUDENT_RAM_AIR_LIMIT_KT=14/1.150779448;
export const windUnits=knots=>({kmh:knots*1.852,mph:knots*1.150779448,ms:knots*.514444444});
export const WIND_SOURCES={student:'https://www.uspa.org/sim/2-1',licensed:'https://www.skydivecsc.com/blog/know-your-skydiving-wind-limit',tandem:'https://startskydiving.com/skydiving/licensed/weather-resources/',force:'https://weather.metoffice.gov.uk/guides/coast-and-sea/beaufort-scale'};
// Published examples, not verified policies of the Bay Area DZ being viewed.
export const WIND_REFERENCES=[
 {key:'student',label:'Student',limit:STUDENT_RAM_AIR_LIMIT_KT,source:WIND_SOURCES.student,sourceName:'USPA SIM 2-1.H',kind:'student'},
 {key:'a',label:'A',limit:17,source:WIND_SOURCES.licensed,sourceName:'CSC',kind:'external'},
 {key:'b',label:'B',limit:19,source:WIND_SOURCES.licensed,sourceName:'CSC',kind:'external'},
 {key:'c',label:'C',limit:21,source:WIND_SOURCES.licensed,sourceName:'CSC',kind:'external'},
 {key:'d',label:'D',limit:25,source:WIND_SOURCES.licensed,sourceName:'CSC',kind:'external'},
 {key:'tandem',label:'Tandem',limit:21,source:WIND_SOURCES.tandem,sourceName:'Start Skydiving',kind:'external'}
];
export function referenceFor({role,level}){return WIND_REFERENCES.find(r=>r.key===(role!=='sport'?'tandem':level<2?'student':({2:'a',3:'b',4:'c',5:'d'}[level]||'d')))}
export function assessWind({wind,gust,ageSeconds,role,level,personalLimit}){
 if(!Number.isFinite(ageSeconds)||ageSeconds>7200||ageSeconds< -3600)return {tone:'unknown',code:'stale'};
 if(!Number.isFinite(wind)||wind<0)return {tone:'unknown',code:'missing'};
 const reference=referenceFor({role,level});
 const personal=role==='sport'&&level>=2&&Number.isFinite(personalLimit)&&personalLimit>0;
 const limit=personal?personalLimit:reference.limit,code=personal?'personal':reference.kind==='student'?'student':'reference';
 const peak=Math.max(wind,Number.isFinite(gust)&&gust>=0?gust:wind);
 if(peak>limit)return {tone:'danger',code,limit,peak,reference};
 if(!Number.isFinite(gust)||gust<0)return {tone:'unknown',code:'gust-missing',limit,peak,reference};
 return {tone:'clear',code,limit,peak,reference};
}
// Approximate mean-wind descriptions from the Met Office Beaufort table, not jump-clearance categories.
export function windConcept(wind){if(!Number.isFinite(wind)||wind<0)return null;
 if(wind<11)return {key:'light',force:'0–3',en:'Calm to gentle breeze',zh:'微风到轻风'};
 if(wind<17)return {key:'moderate',force:'4',en:'Moderate breeze',zh:'和风'};
 if(wind<22)return {key:'fresh',force:'5',en:'Fresh breeze',zh:'清劲风，风力明显'};
 if(wind<28)return {key:'strong',force:'6',en:'Strong breeze',zh:'强风'};
 return {key:'very-strong',force:'7+',en:'Near gale or stronger',zh:'疾风或更强'};
}

export const STATUTE_MILE_M=1609.344;
// A planning screen using model signals, not observed flight-path clearance.
export function assessWeather(data,context,nowSeconds=Date.now()/1000){
 const c=data?.current||{},h=data?.hourly||{};
 const fresh=time=>Number.isFinite(time)&&nowSeconds-time<=7200&&nowSeconds-time>=-3600;
 const currentFresh=fresh(c.time);
 const index=Array.isArray(h.time)&&h.time.length?h.time.reduce((best,time,i)=>Math.abs(time-(Number.isFinite(c.time)?c.time:nowSeconds))<Math.abs(h.time[best]-(Number.isFinite(c.time)?c.time:nowSeconds))?i:best,0):-1;
 const hourlyFresh=index>=0&&fresh(h.time[index]);
 const visibility=hourlyFresh?h.visibility?.[index]:null;
 const wind=assessWind({wind:c.wind_speed_10m,gust:c.wind_gusts_10m,ageSeconds:nowSeconds-c.time,...context});
 let precipitation='missing';
 if(currentFresh){
  if([95,96,99].includes(c.weather_code))precipitation='thunder';
  else if([51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86].includes(c.weather_code)||(Number.isFinite(c.precipitation)&&c.precipitation>0))precipitation='precipitation';
  else if([45,48].includes(c.weather_code))precipitation='fog';
  else if([0,1,2,3].includes(c.weather_code)&&c.precipitation===0)precipitation='none';
 }
 const visibilityCode=!Number.isFinite(visibility)||visibility<0?'missing':visibility<3*STATUTE_MILE_M?'below3':visibility<5*STATUTE_MILE_M?'below5':'atLeast5';
 const clouds=currentFresh&&Number.isFinite(c.cloud_cover)&&c.cloud_cover>=0&&c.cloud_cover<=100?(c.weather_code===3||c.cloud_cover>=80?'overcast':'baseUnknown'):'missing';
 const danger=wind.tone==='danger'||['thunder','precipitation','fog'].includes(precipitation)||visibilityCode==='below3';
 // Even clear-looking model weather cannot establish cloud base or flight visibility.
 const tone=danger?'danger':!currentFresh&&!hourlyFresh?'unknown':'caution';
 return {tone,wind,precipitation,visibilityCode,visibility,clouds,currentFresh,hourlyFresh};
}

// Forecast targets are future valid times, not stale current observations.
// Freshness applies to retrieval; never run the current-observation age gate on a future hour.
export function assessForecast(data,context,nowSeconds=Date.now()/1000,retrievedSeconds=nowSeconds){
 const h=data?.hourly||{},fresh=Number.isFinite(retrievedSeconds)&&nowSeconds-retrievedSeconds<=7200&&nowSeconds-retrievedSeconds>=-3600;
 const horizonEnd=Math.ceil((nowSeconds+12*3600)/3600)*3600;
 const times=Array.isArray(h.time)?h.time:[];
 const indices=times.map((time,index)=>({time,index})).filter(p=>Number.isFinite(p.time)&&p.time>=Math.floor(nowSeconds/3600)*3600).sort((a,b)=>a.time-b.time).filter((p,i,all)=>i===0||p.time!==all[i-1].time);
 const allPoints=indices.map(({time,index})=>{
  const at=key=>h[key]?.[index],code=at('weather_code'),amount=at('precipitation');
  const wind=assessWind({wind:at('wind_speed_10m'),gust:at('wind_gusts_10m'),role:context.role,level:context.level,ageSeconds:fresh?0:Infinity});
  const precipitation=[95,96,99].includes(code)?'thunder':[51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86].includes(code)||(Number.isFinite(amount)&&amount>0)?'precipitation':[45,48].includes(code)?'fog':[0,1,2,3].includes(code)&&amount===0?'none':'missing';
  const visibility=at('visibility'),visibilityCode=!Number.isFinite(visibility)||visibility<0?'missing':visibility<3*STATUTE_MILE_M?'below3':visibility<5*STATUTE_MILE_M?'below5':'atLeast5';
  const cover=at('cloud_cover'),probability=at('precipitation_probability'),signals=[];
  if(['thunder','precipitation','fog'].includes(precipitation))signals.push(precipitation);
  if(wind.tone==='danger')signals.push('wind');
  if(visibilityCode==='below3')signals.push('visibility');
  const incomplete=wind.tone==='unknown'||precipitation==='missing'||visibilityCode==='missing'||!Number.isFinite(cover);
  const tone=!fresh?'unknown':signals.length?'danger':incomplete?'unknown':visibilityCode==='below5'||code===3||cover>=80?'caution':'neutral';
  return {time,tone,signals:fresh?signals:[],wind,windSpeed:at('wind_speed_10m'),gust:at('wind_gusts_10m'),windDirection:at('wind_direction_10m'),weatherCode:code,precipitation,amount,probability:Number.isFinite(probability)&&probability>=0&&probability<=100?probability:null,visibility,visibilityCode,cloudCover:cover,isDay:at('is_day'),temperature:at('temperature_2m'),incomplete};
 });
 const window=planningWindow(data,context,nowSeconds);
 const points=window?allPoints.filter(p=>p.time>window.start&&p.time-3600<window.end).map(p=>({...p,intervalStart:Math.max(p.time-3600,window.start),intervalEnd:Math.min(p.time,window.end),planning:true})):[];
 const otherPoints=allPoints.filter(p=>p.time>nowSeconds&&p.time<=horizonEnd).map(p=>({...p,intervalStart:Math.max(nowSeconds,p.time-3600),intervalEnd:p.time}));
 const arrival=Number.isFinite(context.driveDurationSeconds)&&context.driveDurationSeconds>=0?nowSeconds+context.driveDurationSeconds:null;
 const arrivalIndex=arrival===null||!window||arrival<window.start||arrival>=window.end?-1:points.findIndex(p=>arrival>=p.intervalStart&&arrival<p.intervalEnd);
 const firstDanger=points.find(p=>p.tone==='danger'),afterArrival=arrival===null||arrivalIndex<0?null:points.find(p=>p.intervalEnd>arrival&&p.tone==='danger');
 const probabilities=points.map(p=>p.probability).filter(Number.isFinite),coverage=points.reduce((sum,p)=>sum+p.intervalEnd-p.intervalStart,0);
 const partial=!window||coverage<window.end-window.start-1||points.some(p=>p.incomplete);
 return {points,otherPoints,window,fresh,partial,tone:!fresh||!points.length?'unknown':firstDanger?'danger':points.some(p=>p.tone==='caution'||p.tone==='unknown')?'caution':'neutral',firstDanger,afterArrival,arrival,arrivalIndex,maxProbability:probabilities.length?Math.max(...probabilities):null};
}

export function windGroupName(reference,lang){return reference.key==='student'?(lang==='zh'?'单人学生（方翼）':'Solo student (ram-air)'):reference.key==='tandem'?(lang==='zh'?'双人跳':'Tandem'):reference.label+(lang==='zh'?' 证':' license')}
export function windReferenceLabel(reference,lang){return windGroupName(reference,lang)+' · '+(reference.key==='student'?'≈ ':'')+reference.limit.toFixed(reference.key==='student'?1:0)+(lang==='zh'?' 节':' kt')}
