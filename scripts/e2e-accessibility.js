async(driver)=>{
 const context=await driver.context().browser().newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 try{
  const p=await context.newPage();await p.goto('http://localhost:3000');await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).waitFor();
  if(await p.getByRole('dialog').count()===0)throw new Error('Onboarding is missing dialog semantics');
  await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();await p.keyboard.press('Escape');
  await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).waitFor();
  await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
  await p.getByRole('dialog',{name:'Trung Tâm Trận Đấu',exact:true}).waitFor();await p.keyboard.press('Escape');
  await p.getByTitle('Mã sao lưu / khôi phục dữ liệu').click();
  const dialog=p.getByRole('dialog',{name:'Sao Lưu & Khôi Phục Dữ Liệu',exact:true});await dialog.waitFor();
  for(let i=0;i<15;i++){
   await p.keyboard.press('Tab');
   if(!await dialog.evaluate(el=>el.contains(document.activeElement)))throw new Error('Focus escaped Recovery dialog');
  }
  await p.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  const measurements=await p.evaluate(()=>({smallButtons:[...document.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top>=0&&r.top<innerHeight&&r.left>=0&&r.right<=innerWidth&&(r.width<44||r.height<44);}).map(e=>e.textContent),motion:getComputedStyle(document.querySelector('button')).transitionDuration}));
  if(measurements.smallButtons.length)throw new Error(JSON.stringify(measurements));
  return {dialogs:true,escape:true,focusTrap:true,touchTargets44px:true,reducedMotion:true,...measurements};
 }finally{await context.close();}
}
