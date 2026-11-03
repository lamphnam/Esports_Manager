import {rmSync} from 'node:fs';
import {resolve,dirname,basename} from 'node:path';
const root=resolve(import.meta.dirname,'..'),target=resolve(root,'dist');
if(dirname(target)!==root||basename(target)!=='dist')throw new Error('Invalid clean target');
rmSync(target,{recursive:true,force:true});
console.log(`Removed build directory: ${target}`);
