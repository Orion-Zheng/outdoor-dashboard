import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT||4180),base=process.env.BASE_PATH||'/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.gif':'image/gif','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
 try{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!pathname.startsWith(base)){res.writeHead(404);res.end('Not found');return}
  pathname=pathname.slice(base.length);const file=path.resolve(root,pathname||'index.html');
  if(!file.startsWith(root+path.sep)||pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return}
  const stat=fs.statSync(file);if(!stat.isFile())throw new Error('Not a file');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(404);res.end('Not found')}
}).listen(port,'127.0.0.1',()=>console.log(`Local preview: http://127.0.0.1:${port}${base}`));
