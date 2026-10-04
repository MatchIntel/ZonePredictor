import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const port=Number(process.env.PORT||8080);
if(!Number.isInteger(port)||port<0||port>65535)throw new Error('PORT must be a valid port number.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method not allowed');return;}
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname.includes('\0')||pathname.includes('\\')){res.writeHead(400);res.end('Bad request');return;}
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root)){res.writeHead(403);res.end('Forbidden');return;}
    const info=await stat(file);if(!info.isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache'});
    if(req.method==='HEAD')res.end();else res.end(await readFile(file));
  }catch(error){if(!res.headersSent)res.writeHead(error.code==='ENOENT'?404:400);res.end('Not found');}
});
server.listen(port,'0.0.0.0',()=>console.log(`Zone Predictor listening on port ${server.address().port}`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
