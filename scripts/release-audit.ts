import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const errors:string[]=[];
function files(root:string):string[]{return readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(root,e.name)):[join(root,e.name)]);}
for(const file of files('src')){
 if(!/\.(tsx?|css)$/.test(file))continue;
 const source=readFileSync(file,'utf8');
 if(/(?:purple|indigo|violet)-\d/.test(source))errors.push(`${file}: forbidden colour class`);
 if(/\p{Extended_Pictographic}/u.test(source))errors.push(`${file}: emoji in UI source`);
 if(file.replaceAll('\\','/').startsWith('src/lib/')&&/Math\.random\s*\(/.test(source))errors.push(`${file}: unseeded random`);
}
for(const file of existsSync('public')?files('public'):[])if(/\.(md|json)$/.test(file))errors.push(`${file}: internal document exposed`);
const pkg=JSON.parse(readFileSync('package.json','utf8'));
for(const dependency of ['@google/genai','express','dotenv','motion','tsx'])if(pkg.dependencies?.[dependency]||pkg.devDependencies?.[dependency])errors.push(`unused dependency: ${dependency}`);
for(const file of ['.env.example','metadata.json'])if(existsSync(file))errors.push(`unused file: ${file}`);
if(existsSync('dist'))for(const file of files('dist')){
 if(/\.(md)$/.test(file)||file.includes('aistudio'))errors.push(`public build contains internal spec: ${file}`);
 if(/\.(js|html|css)$/.test(file)&&/GAME_TEAMS|USE_OFFICIAL_ICONS|supportBlock|docs\/ref\//.test(readFileSync(file,'utf8')))errors.push(`reference source in bundle: ${file}`);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('PASS: no internal specs/reference code, unused runtime dependencies, forbidden colours, emoji or Math.random in src/lib.');
