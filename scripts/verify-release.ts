import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const commands=[['install','--frozen-lockfile'],['run','typecheck'],['run','test'],['run','build'],['scripts/balance-sim.ts'],['scripts/import-golden-road.ts','--check'],['scripts/release-audit.ts']];
let report='',failed=false;
for(const args of commands){
 const result=spawnSync(process.execPath,args,{encoding:'utf8',env:{...process.env,NO_COLOR:'1'},maxBuffer:16*1024*1024});
 const output=`$ bun ${args.join(' ')}\n${result.stdout||''}${result.stderr||''}exit=${result.status}\n`;
 report+=output;console.log(output);if(result.status!==0)failed=true;
}
writeFileSync('docs/evidence/verify-output.txt',report);
if(failed)process.exitCode=1;
