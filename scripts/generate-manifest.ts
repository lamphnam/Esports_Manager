import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
function walk(root:string):string[]{return readdirSync(root,{withFileTypes:true}).filter(e=>!['ref','.claude'].includes(e.name)).flatMap(e=>e.isDirectory()?walk(join(root,e.name)):[join(root,e.name)]);}
const records=walk('docs').filter(file=>!file.endsWith('FILE_MANIFEST.json')).sort().map(file=>{
 const content=readFileSync(file);return {path:file.replaceAll('\\','/'),bytes:content.length,sha256:createHash('sha256').update(content).digest('hex')};
});
const content=JSON.stringify(records,null,2)+'\n';
if(process.argv.includes('--check')){
 if(readFileSync('docs/FILE_MANIFEST.json','utf8')!==content)throw new Error('FILE_MANIFEST is stale; run bun scripts/generate-manifest.ts');
 console.log(`PASS: ${records.length} documentation entries match bytes/sha256.`);
}else{writeFileSync('docs/FILE_MANIFEST.json',content);console.log(`Generated ${records.length} documentation entries (reference source checksums live in legacyManifest.json).`);}
