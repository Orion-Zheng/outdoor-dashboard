const formatters=new Map();
function localParts(seconds,timeZone){
 if(!formatters.has(timeZone))formatters.set(timeZone,new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}));
 return Object.fromEntries(formatters.get(timeZone).formatToParts(new Date(seconds*1000)).map(p=>[p.type,p.value]));
}
function onDate(day,clock,timeZone){
 const [hour,minute]=clock.split(':').map(Number),target=Date.UTC(+day.year,+day.month-1,+day.day,hour,minute)/1000;let guess=target;
 for(let i=0;i<3;i++){const p=localParts(guess,timeZone),wall=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)/1000;guess=target-(wall-guess)}return guess;
}
export function planningWindow(data,context,now){
 const hours=context.operatingHours,timeZone=hours?.timeZone||data.timezone||'America/Los_Angeles',daily=data.daily||{};
 const windows=[];
 for(let i=0;i<(daily.sunrise?.length||0);i++){
  const sunrise=daily.sunrise[i],sunset=daily.sunset?.[i];if(!Number.isFinite(sunrise)||!Number.isFinite(sunset)||sunrise<=0||sunset<=sunrise||sunset<=now)continue;
  const day=localParts(sunrise,timeZone),key=day.weekday.toLowerCase(),schedule=hours?.weekly?.[key];
  if(Array.isArray(schedule)&&!schedule.length)continue;
  const intervals=Array.isArray(schedule)?schedule:[null];
  for(const interval of intervals){
   const publishedStart=interval?onDate(day,interval.open,timeZone):null,publishedEnd=interval?onDate(day,interval.close,timeZone):null;
   const start=Math.max(now,sunrise,publishedStart??sunrise),end=Math.min(sunset,publishedEnd??sunset);
   if(end<=start)continue;
   windows.push({start,end,sunrise,sunset,publishedStart,publishedEnd,basis:interval?'published':'daylight-only',kind:hours?.kind,source:interval?hours.source:null,reviewedAt:interval?hours.reviewedAt:null,timeZone});
  }
 }
 return windows.sort((a,b)=>a.start-b.start)[0]||null;
}
export const windowIsToday=(window,now)=>{const a=localParts(window.start,window.timeZone),b=localParts(now,window.timeZone);return a.year===b.year&&a.month===b.month&&a.day===b.day};
