import test from 'node:test';
import assert from 'node:assert/strict';
import {geocodingURL,parseCandidates,needsOriginConfirmation} from '../site/geocoding.js';
test('place search requests multiple candidates and uses a soft regional bias',()=>{const url=geocodingURL('Moscow',{focus:[37.5,-121.9]});assert.equal(url.searchParams.get('limit'),'5');assert.equal(url.searchParams.get('lat'),'37.5');assert.equal(url.searchParams.get('q'),'Moscow');assert.equal(url.searchParams.has('bbox'),false);assert.equal(url.searchParams.has('countrycode'),false)});
test('same-named cities remain distinguishable by state and country',()=>{const results=parseCandidates({features:[{geometry:{coordinates:[-117,46.7]},properties:{name:'Moscow',state:'Idaho',country:'United States'}},{geometry:{coordinates:[37.6,55.7]},properties:{name:'Moscow',country:'Russia'}}]});assert.equal(results.length,2);assert.match(results[0].label,/Idaho, United States/);assert.match(results[1].label,/Russia/);assert.deepEqual(results[0].coord,[46.7,-117])});
test('street candidates retain house number, street and locality',()=>{const [candidate]=parseCandidates({features:[{geometry:{coordinates:[1,2]},properties:{housenumber:'10',street:'Example Road',city:'Example City',country:'Example Country'}}]});assert.match(candidate.label,/10 Example Road/);assert.match(candidate.label,/Example City/)});
test('invalid coordinates are rejected rather than routed',()=>{assert.deepEqual(parseCandidates({features:[{geometry:{coordinates:[500,200]},properties:{name:'Bad'}}]}),[]);assert.throws(()=>parseCandidates({}),/Invalid/)});

test('duplicate representations of the same named place do not fill the candidate list',()=>{const features=[1,2].map(n=>({geometry:{coordinates:[37+n/100,55]},properties:{name:'Moscow',country:'Russia'}}));assert.equal(parseCandidates({features}).length,1)});

test('previous ambiguous automatic matches require confirmation, while explicit selections persist',()=>{
 const shortcuts=[{name:'San Francisco',coord:[37.7749,-122.4194]}];
 assert.equal(needsOriginConfirmation([0,20],{label:'Moscow',shortcuts}),true);
 assert.equal(needsOriginConfirmation([37.7749,-122.4194],{label:'San Francisco',shortcuts}),false);
 assert.equal(needsOriginConfirmation([55.7,37.6],{label:'Moscow, Russia',confirmed:true,shortcuts}),false);
});
