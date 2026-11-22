import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {validateCatalog} from '../scripts/validate-data.mjs';
test('catalog has all documented venues and courses',()=>{const result=validateCatalog();assert.ok(result.venues>=5);assert.ok(result.courses>=10)});
function fixture(t,change){const root=fs.mkdtempSync(path.join(os.tmpdir(),'outdoor-check-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));fs.cpSync('data',path.join(root,'data'),{recursive:true});fs.mkdirSync(path.join(root,'site'));fs.copyFileSync('site/config.json',path.join(root,'site/config.json'));const file=path.join(root,'data/skydiving/regions/us-ca-bay-area/venues.json');const data=JSON.parse(fs.readFileSync(file));change(data);fs.writeFileSync(file,JSON.stringify(data));return root}
test('bad coordinates block publication',t=>assert.throws(()=>validateCatalog(fixture(t,data=>{data[0].coord=[181,0]})),/latitude/));
test('unsafe source URLs block publication',t=>assert.throws(()=>validateCatalog(fixture(t,data=>{data[0].source='javascript:alert(1)'})),/HTTPS/));
test('missing bilingual information blocks publication',t=>assert.throws(()=>validateCatalog(fixture(t,data=>{delete data[0].eligibility.en})),/zh and en/));
test('unknown price remains explicit null',t=>assert.throws(()=>validateCatalog(fixture(t,data=>{delete data[0].liftPrices[0].own})),/price/));
test('duplicate venue IDs block publication',t=>assert.throws(()=>validateCatalog(fixture(t,data=>{data[1].id=data[0].id})),/Duplicate/));
test('invalid published hours block publication',t=>assert.throws(()=>validateCatalog(fixture(t,data=>{data[0].operatingHours.weekly.sun=[{open:'25:00',close:'26:00'}]})),/hours interval/));

test('tandem coverage includes the four additional documented venues',()=>{const venues=JSON.parse(fs.readFileSync('data/skydiving/regions/us-ca-bay-area/venues.json'));for(const id of ['golden-gate','skydance','norcal','lodi']){const venue=venues.find(v=>v.id===id);assert.ok(venue);assert.deepEqual(venue.documentedAudiences,['tandem']);assert.ok(venue.tandemPrices.length)}const goldenGate=venues.find(v=>v.id==='golden-gate');assert.equal(goldenGate.tandemPrices[0].altitude,null);assert.equal(goldenGate.tandemPrices[0].price,269);assert.ok(venues.find(v=>v.id==='skydance').tandemPrices.every(r=>r.altitude<=18000))});
test('invented invalid altitudes and audience labels block publication',t=>{assert.throws(()=>validateCatalog(fixture(t,data=>{data[0].tandemPrices[0].altitude=0})),/altitude/);assert.throws(()=>validateCatalog(fixture(t,data=>{data[0].documentedAudiences=['anyone']})),/audiences/)});

test('telephone updates reject ambiguous facilities and reversed capacity ranges',t=>{assert.throws(()=>validateCatalog(fixture(t,data=>{data.find(z=>z.id==='cal').accommodation.showers='no'})),/accommodation/);assert.throws(()=>validateCatalog(fixture(t,data=>{data.find(z=>z.id==='cal').aircraftOperations.passengerCapacity.min=20})),/capacity/);assert.throws(()=>validateCatalog(fixture(t,data=>{data.find(z=>z.id==='cal').accommodation.provenance.status='official'})),/provenance/)});
