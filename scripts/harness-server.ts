import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../tools/iframe-harness.html',import.meta.url));
createServer((request,response)=>{
 if(request.url!=='/'&&request.url!=='/iframe-harness.html'){response.writeHead(404).end();return;}
 response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(html);
}).listen(4174,'127.0.0.1',()=>console.log('Harness: http://127.0.0.1:4174; game: http://localhost:4173'));
