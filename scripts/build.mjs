import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {validateCatalog} from './validate-data.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
console.log('Validating catalog:',validateCatalog(root));
for(const file of fs.readdirSync(path.join(root,'site')).filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',path.join(root,'site',file)]);
const hash=createHash('sha256');
function fingerprint(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,entry.name);if(entry.isDirectory())fingerprint(file);else hash.update(path.relative(root,file)).update(fs.readFileSync(file));}}
fingerprint(path.join(root,'site'));fingerprint(path.join(root,'data'));hash.update(fs.readFileSync(path.join(root,'package-lock.json')));
const version=hash.digest('hex').slice(0,12);
const dist=path.join(root,'dist');fs.rmSync(dist,{recursive:true,force:true});fs.cpSync(path.join(root,'site'),dist,{recursive:true});fs.cpSync(path.join(root,'data'),path.join(dist,'data'),{recursive:true});
for(const file of fs.readdirSync(dist).filter(f=>f.endsWith('.js'))){const output=path.join(dist,file);const code=fs.readFileSync(output,'utf8').replace(/(from\s*['"])(\.[^'"]+\.js)(['"])/g,(_,before,url,after)=>before+url+'?v='+version+after).replaceAll('__BUILD_VERSION__',version);fs.writeFileSync(output,code);}
const htmlFile=path.join(dist,'index.html');fs.writeFileSync(htmlFile,fs.readFileSync(htmlFile,'utf8').replace(/((?:src|href)=")([^":]+\.(?:js|css))(")/g,(_,before,url,after)=>before+url+'?v='+version+after));
const vendor=path.join(dist,'vendor/leaflet');fs.mkdirSync(vendor,{recursive:true});
for(const file of ['leaflet.css','leaflet.js'])fs.copyFileSync(path.join(root,'node_modules/leaflet/dist',file),path.join(vendor,file));
fs.cpSync(path.join(root,'node_modules/leaflet/dist/images'),path.join(vendor,'images'),{recursive:true});fs.copyFileSync(path.join(root,'node_modules/leaflet/LICENSE'),path.join(vendor,'LICENSE'));
fs.writeFileSync(path.join(dist,'.nojekyll'),'');console.log('Built dist/ (relative URLs support GitHub Pages repository paths).');
