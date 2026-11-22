import {zhText} from './i18n.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const formatMoney=(value,currency,lang)=>new Intl.NumberFormat(lang==='zh'?'zh-CN':'en-US',{style:'currency',currency,maximumFractionDigits:2}).format(value);
export function gearPricesHTML(venue,lang){
 const t=(zh,en)=>lang==='zh'?zhText(zh):en;
 const price=value=>Number.isFinite(value)?formatMoney(value,venue.currency,lang):value===false?t('不提供','Unavailable'):'—';
 return `<div class="altitude-list gear-prices"><table aria-label="${esc(venue.name)} ${t('自带与租赁装备价格','own and rental gear prices')}"><thead><tr><th>${t('出舱高度','Exit altitude')}</th><th>${t('自带装备','Own gear')}<small>${esc(venue.currency)} / ${t('跳','jump')}</small></th><th>${t('租赁装备','Rental gear')}<small>${t('含跳票','Lift included')} · ${esc(venue.currency)} / ${t('跳','jump')}</small></th></tr></thead><tbody>${venue.liftPrices.map(row=>`<tr><td>${row.altitude?row.altitude.toLocaleString()+' ft'+(venue.altitudeReference?' '+esc(venue.altitudeReference):''):t('高度待确认','Altitude unverified')}</td><td>${price(row.own)}</td><td>${price(row.rental)}</td></tr>`).join('')}</tbody></table><p class="price-key">${t('— 未公开，请联系官方；不代表免费。','— Unpublished; contact the operator. Not free.')}${venue.priceYear<2026?' '+esc(venue.priceYear)+t(' 年报价，现价待确认。',' rates; confirm current prices.'):''}</p></div>`;
}
