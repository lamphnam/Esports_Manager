async(driver)=>{
 const c=await driver.context().browser().newContext({viewport:{width:390,height:844}});
 try{
  const p=await c.newPage();await p.goto('http://localhost:3000');
  await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('apac_rising_save_v3'));s.club.wallet.credits=12345678;s.club.currentChapterId=2;s.club.completedChapterIds=[1];localStorage.setItem('apac_rising_save_v3',JSON.stringify(s));});
  await p.reload();await p.getByRole('button',{name:'Chiến Dịch',exact:true}).click();
  await p.getByText('Giao hữu: không thưởng',{exact:true}).waitFor();
  const metrics=await p.evaluate(()=>({header:document.querySelector('header').scrollWidth,client:document.querySelector('header').clientWidth,viewport:innerWidth,font:getComputedStyle(document.querySelector('main')).fontFamily,lang:document.documentElement.lang,controls:[...document.querySelectorAll('header button[title]')].filter(e=>/khôi phục|âm thanh/.test(e.title)).map(e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right};})}));
  if(metrics.header>metrics.client||metrics.controls.some(r=>r.left<0||r.right>390)||metrics.lang!=='vi'||!metrics.font.includes('Be Vietnam Pro'))throw new Error(JSON.stringify(metrics));
  return {...metrics,friendlyRewardLabel:true};
 }finally{await c.close();}
}
