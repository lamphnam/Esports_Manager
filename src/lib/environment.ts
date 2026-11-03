export interface StorageContext{embedded:boolean;appleWebKit:boolean}

interface WindowLike{self:unknown;top:unknown}
interface NavigatorLike{userAgent:string;maxTouchPoints?:number}

// Used only to pick which backup advice to show; never to gate gameplay.
export function detectStorageContext(
  win:WindowLike|undefined=globalThis.window,
  nav:NavigatorLike|undefined=globalThis.navigator,
):StorageContext{
  let embedded=false;
  try{embedded=!!win&&win.self!==win.top;}catch{embedded=true;}
  const ua=nav?.userAgent||'';
  const ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&(nav?.maxTouchPoints||0)>1);
  const desktopSafari=/Safari\//.test(ua)&&!/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Android/.test(ua);
  return {embedded,appleWebKit:ios||desktopSafari};
}

export function backupAdvice(context:StorageContext):string[]{
  const advice:string[]=[];
  if(context.embedded)advice.push('Bạn đang chơi bản nhúng trong trang cuộc thi. Bản nhúng và bản mở trực tiếp bằng URL của game không chia sẻ save; muốn chuyển qua lại hãy dùng Recovery Code.');
  if(context.appleWebKit)advice.push('Safari/iOS có thể xóa dữ liệu của trang nhúng sau một thời gian không dùng. Hãy xuất Recovery Code sau mỗi buổi chơi.');
  return advice;
}
