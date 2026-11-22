import {WIND_REFERENCES,windReferenceLabel} from './weather-rules.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock=(s,lang,tz)=>new Intl.DateTimeFormat(lang==='zh'?'zh-CN':'en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(s*1000));
// Colors compare every group, rather than changing with the selected license.
// This conservative planning screen never establishes actual DZ availability.
export function hourGroups(point){
 const stale=point.wind.code==='stale',weatherBlocked=point.signals.some(s=>['thunder','precipitation','fog','visibility'].includes(s));
 const review=point.incomplete||point.visibilityCode==='below5'||point.weatherCode===3||point.cloudCover>=80;
 const peak=Math.max(point.windSpeed??-1,point.gust??-1);
 const groups=WIND_REFERENCES.map(reference=>{
  const above=!stale&&peak>reference.limit;
  return {reference,status:stale?'review':weatherBlocked||above?'blocked':review?'review':'within',above};
 });
 const tone=groups.every(g=>g.status==='blocked')?'red':groups.every(g=>g.status==='within')?'green':'amber';
 return {tone,groups,stale,weatherBlocked,review,peak};
}
export function groupSummary(tone,lang){const t=(zh,en)=>lang==='zh'?zh:en;return tone==='green'?t('全部人群在参考范围内','All groups within references'):tone==='red'?t('全部人群未通过筛查','No group meets the screen'):t('部分受限或需核查','Some limits / review needed')}
function reviewReasons(point,lang){
 const t=(zh,en)=>lang==='zh'?zh:en,a=hourGroups(point);
 const reasons=[];
 if(a.stale)reasons.push(t('预报已过旧，不能判断适用人群。','Stale forecast; group suitability is unverified.'));
 else {
  if(point.signals.includes('thunder'))reasons.push(t('模型提示雷暴。','Modeled thunderstorm.'));
  if(point.signals.includes('precipitation'))reasons.push(t('模型提示降水。','Modeled precipitation.'));
  if(point.signals.includes('fog'))reasons.push(t('模型提示雾。','Modeled fog.'));
  if(point.visibilityCode==='below3')reasons.push(t('能见度低于 3 英里。','Visibility below 3 mi.'));
  if(point.visibilityCode==='below5')reasons.push(t('能见度为 3–5 英里，需结合出舱高度核查。','Visibility 3–5 mi; check exit altitude.'));
  if(point.weatherCode===3||point.cloudCover>=80)reasons.push(t('阴天／高云量；云底需核实。','Overcast / extensive cloud; verify cloud base.'));
  if(point.incomplete)reasons.push(t('部分天气数据缺失。','Some weather data is missing.'));
 }
 return reasons;
}
export function hourReviewHTML(point,key,lang){
 const t=(zh,en)=>lang==='zh'?zh:en,group=hourGroups(point).groups.find(g=>g.reference.key===key);if(!group)return '';
 const reference=group.reference,reasons=reviewReasons(point,lang);
 return `<strong>${windReferenceLabel(reference,lang)}</strong><p>${reasons.join(' ')||t('请结合基地实测与专项要求核查。','Check local observations and DZ requirements.')}</p><a href="${esc(reference.source)}" target="_blank" rel="noopener noreferrer">${t('风参考值来源','Wind-reference source')}: ${esc(reference.sourceName)}</a>`;
}
export function groupTooltipHTML(point,lang,timeZone,group='main'){
 const t=(zh,en)=>lang==='zh'?zh:en,a=hourGroups(point),reasons=reviewReasons(point,lang);
 return `<strong class="hour-tip-title">${clock(point.intervalStart,lang,timeZone)}–${clock(point.intervalEnd,lang,timeZone)} · ${groupSummary(a.tone,lang)}</strong><p>${t('风 / 阵风','Wind / gust')} ${Number.isFinite(point.windSpeed)?point.windSpeed.toFixed(1):'—'} / ${Number.isFinite(point.gust)?point.gust.toFixed(1):'—'} ${t('节','kt')}</p><div class="hour-group-list">${a.groups.map(({reference,status,above})=>`<div class="hour-group-row ${status}"><span>${status==='within'?'✓':status==='blocked'?'×':'!'} ${reference.key==='student'?t('学生（方翼）','Student'):reference.key==='tandem'?t('双人跳','Tandem'):reference.label+t(' 证',' license')}</span><small>${windReferenceLabel(reference,lang).split(' · ')[1]}</small>${status==='review'?`<button type="button" class="hour-review-button" data-hour-review="${reference.key}" aria-expanded="false" aria-controls="hour-review-${group}">${t('需核查','Review')}</button>`:`<strong>${status==='blocked'?(above?t('超风限','Above wind'):t('天气受限','Weather')):t('参考内','Within')}</strong>`}</div>`).join('')}</div><div class="hour-review-detail" id="hour-review-${group}" data-hour-review-detail hidden></div>${reasons.length?`<p class="hour-tip-reason">${reasons.join(' ')}</p>`:''}<p class="hour-tip-sources">USPA · CSC · Start Skydiving</p><p class="hour-tip-note">${t('按公开参考值筛查，非基地可跳确认。','Published-reference screen, not DZ jump clearance.')}</p>`;
}
export function blocksHTML(points,{lang,timeZone,arrival,selected=0,group='main'}){
 if(!points.length)return '';
 const t=(zh,en)=>lang==='zh'?zh:en;
 return `<div class="forecast-blocks" data-forecast-blocks="${group}"><div class="hour-color-key"><span class="green">${t('全部参考内','All within refs.')}</span><span class="amber">${t('部分受限／待核查','Some limits / review')}</span><span class="red">${t('全部未通过','None meet screen')}</span></div><div class="forecast-hour-grid" aria-label="${t('每小时天气','Hourly weather')}">${points.map((p,i)=>{const a=hourGroups(p),isArrival=Number.isFinite(arrival)&&arrival>=p.intervalStart&&arrival<p.intervalEnd,label=clock(p.intervalStart,lang,timeZone)+'–'+clock(p.intervalEnd,lang,timeZone),peak=a.stale||!Number.isFinite(p.windSpeed)||!Number.isFinite(p.gust)?'—':a.peak.toFixed(0);return `<button type="button" class="forecast-hour-block ${a.tone}${i===selected?' selected':''}${isArrival?' arrival-hour':''}" data-forecast-hour="${i}" aria-pressed="${i===selected}" aria-label="${esc(label+' · '+groupSummary(a.tone,lang))}" aria-haspopup="dialog" aria-expanded="false" aria-controls="hour-tooltip-${group}"><strong>${clock(p.intervalStart,lang,timeZone)}</strong><span>${peak} ${t('节','kt')}</span>${isArrival?`<small>${t('到达','Arrival')}</small>`:''}</button>`}).join('')}</div><p class="hour-block-caption">${t('每块 1 小时（边界时段可能较短）；数字为风速与阵风的较大值。悬停查看各人群，点击查看天气详情。','One-hour blocks (boundary periods may be shorter); numbers show peak wind/gust. Hover for groups; select for weather details.')}</p><div class="hour-tooltip" id="hour-tooltip-${group}" role="dialog" aria-label="${t('时段人群与参考详情','Hourly group and reference details')}" hidden></div></div>`;
}
