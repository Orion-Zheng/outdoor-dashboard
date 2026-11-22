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
