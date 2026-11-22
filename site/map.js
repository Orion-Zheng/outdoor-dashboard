import {routeSummary} from './routing.js';
let map=null,selected='road';
export function disposeVenueMap(){if(map){map.remove();map=null}}
export function mountVenueMap(host,{locations,origin,originText,lang,indoor,onSelect}){
 const zh=lang==='zh',L=window.L;if(!L){host.textContent=zh?'地图暂不可用，可使用基地卡片上的导航。':'Map unavailable; use the Maps link on a venue card.';return}
 map=L.map(host,{scrollWheelZoom:false}).setView(locations[0]?.coord||[25,0],8);
 const roads=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
 const satellite=L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Source: <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">Esri, Vantor, Earthstar Geographics, GIS User Community</a>'});
 const fallback=host.parentElement.querySelector('.map-route-note');
 let errors=0;for(const layer of [roads,satellite])layer.on('tileerror',()=>{if(++errors>=3&&fallback)fallback.textContent=zh?'部分底图未加载，请切换图层或使用基地导航。':'Some map tiles failed. Switch layers or open venue Maps.'});
 (selected==='satellite'?satellite:roads).addTo(map);
 L.control.layers({[zh?'道路':'Roads']:roads,[zh?'卫星':'Satellite']:satellite},null,{collapsed:false,position:'topright'}).addTo(map);
 map.on('baselayerchange',event=>{selected=event.layer===satellite?'satellite':'road';errors=0});
 const points=locations.map(z=>z.coord);
 for(const z of locations){
  const marker=L.circleMarker(z.coord,{radius:7,weight:2,color:'#fff',fillColor:'#226446',fillOpacity:1}).addTo(map);
  const label=document.createElement('span');label.textContent=z.name+(origin?' · '+routeSummary(origin,z,lang):'');
  marker.bindTooltip(label,{direction:'top'}).on('click',()=>onSelect(z.id));
  const element=marker.getElement();if(element){element.setAttribute('tabindex','0');element.setAttribute('role','button');element.setAttribute('aria-label',(zh?'查看 ':'View ')+z.name);element.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(z.id)}})}
 }
 if(origin){
  points.push(origin);const label=document.createElement('span');label.textContent=(zh?'出发地：':'Origin: ')+originText;
  L.circleMarker(origin,{radius:8,weight:2,color:'#fff',fillColor:'#bc7b24',fillOpacity:1}).addTo(map).bindTooltip(label,{permanent:true,direction:'top'});
 }
 if(points.length)map.fitBounds(L.latLngBounds(points).pad(.18),{maxZoom:indoor?12:11});else map.setView([25,0],2);
 requestAnimationFrame(()=>map?.invalidateSize());
}
