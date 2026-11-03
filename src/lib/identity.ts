export const newId = (prefix:string):string => `${prefix}_${crypto.randomUUID()}`;
export function vietnamDay(timestamp=Date.now()):string {
  return new Date(timestamp+7*3600_000).toISOString().slice(0,10);
}
