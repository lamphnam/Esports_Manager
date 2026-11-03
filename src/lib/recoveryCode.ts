import { GameSave, validateSave } from './saveState';

const MAX_BYTES=2_000_000;
const MAX_CODE=500_000;
function crc32(bytes:Uint8Array):string {
  let crc=0xffffffff;
  for(const byte of bytes) {crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return ((crc^0xffffffff)>>>0).toString(16).padStart(8,'0');
}
async function readLimited(stream:ReadableStream<Uint8Array>):Promise<Uint8Array> {
  const reader=stream.getReader(), chunks:Uint8Array[]=[];let size=0;
  try {while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BYTES)throw new Error('Save vượt giới hạn kích thước.');chunks.push(value);}}
  finally {await reader.cancel();reader.releaseLock();}
  const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;
}
// Fold the hot ledger into ledgerArchive so exported codes stay short enough to copy on a phone.
// Wallet balances live in club.wallet, so no balance changes.
export function compactSave(save:GameSave):GameSave {
  const archive={...(save.ledgerArchive||{credits:0,materials:0,tickets:0,count:0})};
  for(const entry of save.ledger){archive.credits+=entry.deltaCredits;archive.materials+=entry.deltaMaterials;archive.tickets+=entry.deltaTickets;archive.count++;}
  return {...save,ledger:[],ledgerArchive:archive};
}
export async function encodeSave(save:GameSave,options:{compact?:boolean}={}):Promise<string> {
  const validated=validateSave(save);
  // Never recursively embed a previous Recovery Code.
  validated.club!.recoveryCode='';
  const body=options.compact?compactSave(validated):validated;
  const raw=new TextEncoder().encode(JSON.stringify(body));
  if(raw.length>MAX_BYTES)throw new Error('Save vượt giới hạn kích thước.');
  const compressed=await readLimited(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate')));
  let binary='';for(const byte of compressed)binary+=String.fromCharCode(byte);
  const payload=btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const code=`AR1.${payload}.${crc32(compressed)}`;
  if(code.length>MAX_CODE)throw new Error('Mã vượt giới hạn kích thước.');
  return code;
}
export async function decodeSave(code:string):Promise<GameSave> {
  const trimmed=code.trim();
  if(trimmed.length>MAX_CODE)throw new Error('Mã vượt giới hạn kích thước.');
  const match=/^AR1\.([A-Za-z0-9_-]+)\.([a-f0-9]{8})$/.exec(trimmed);
  if(!match)throw new Error('Mã không hợp lệ hoặc phiên bản chưa được hỗ trợ.');
  try {
    const bytes=Uint8Array.from(atob(match[1].replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
    if(crc32(bytes)!==match[2])throw new Error('Checksum không khớp.');
    const raw=await readLimited(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')));
    return validateSave(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw)));
  } catch {throw new Error('Mã bị hỏng hoặc save không hợp lệ. Hãy kiểm tra lại bản sao.');}
}
