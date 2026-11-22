import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gearPricesHTML} from '../site/pricing.js';
const venues=JSON.parse(fs.readFileSync('data/skydiving/regions/us-ca-bay-area/venues.json'));
test('licensed price tables render every venue in both languages without recursion',()=>{for(const venue of venues)for(const lang of ['en','zh']){const html=gearPricesHTML(venue,lang);assert.match(html,/<table/);assert.equal((html.match(/<tr>/g)||[]).length,venue.liftPrices.length+1);assert.ok(!/undefined|NaN/.test(html))}});
test('rental missing, unavailable and included prices remain distinct',()=>{assert.match(gearPricesHTML(venues.find(z=>z.id==='bas'),'en'),/<td>—<\/td>/);assert.match(gearPricesHTML(venues.find(z=>z.id==='mon'),'en'),/Unavailable/);assert.match(gearPricesHTML(venues.find(z=>z.id==='cal'),'en'),/\$90\.00/)});
test('historical prices and MSL altitude annotations are preserved',()=>{assert.match(gearPricesHTML(venues.find(z=>z.id==='svs'),'en'),/2023 rates/);assert.match(gearPricesHTML(venues.find(z=>z.id==='mon'),'en'),/MSL/)});
