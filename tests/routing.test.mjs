import test from 'node:test';
import assert from 'node:assert/strict';
import {formatDriving,parseRouteTable} from '../site/routing.js';
test('driving estimates use road distance and duration',()=>{assert.equal(formatDriving({status:'ok',distance:95500,duration:4200},'en'),'Drive 95.5 km · about 1 h 10 min');assert.match(formatDriving({status:'ok',distance:95500,duration:4200},'zh'),/1 小时 10 分钟/)});
test('unreachable destination is not replaced by straight-line distance',()=>{const result=parseRouteTable({code:'Ok',distances:[[0,null,95500]],durations:[[0,null,4200]]},2);assert.equal(result[0].status,'unavailable');assert.equal(result[1].distance,95500)});
test('missing table response fails explicitly',()=>assert.throws(()=>parseRouteTable({code:'NoRoute'},2)));
