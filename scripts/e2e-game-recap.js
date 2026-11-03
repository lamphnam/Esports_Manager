async(driver)=>{
 const results=[];
 for(const chapter of [2,5]){
  const context=await driver.context().browser().newContext({viewport:{width:390,height:844}});
  try{
   const p=await context.newPage();await p.addInitScript(()=>{Date.now=()=>1;});await p.goto('http://localhost:3000');
   await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
   await p.evaluate(chapter=>{const s=JSON.parse(localStorage.getItem('apac_rising_save_v3'));s.activeMatch=null;s.club.currentChapterId=chapter;s.club.completedChapterIds=Array.from({length:chapter-1},(_,i)=>i+1);localStorage.setItem('apac_rising_save_v3',JSON.stringify(s));},chapter);
   await p.reload();await p.getByRole('button',{name:'Thi Đấu Ngay',exact:true}).click();await p.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();await p.getByRole('button',{name:/Xem Kết Quả Ngay/}).click();
   await p.waitForFunction(()=>document.querySelector('[data-testid="game-recap"]')||document.body.textContent.includes('FOCUS_1:'));
   if(await p.getByTestId('game-recap').count()===0)throw new Error(`BO${chapter===2?3:5}: game result was skipped; advanced directly to tactics`);
   const verdict=await p.getByTestId('game-verdict').innerText(),score=await p.getByTestId('game-series-score').innerText();
   if(!/Thắng Ván|Thua Ván/.test(verdict))throw new Error('Missing win/loss verdict');
   if(await p.getByTestId('game-recap').locator('details').count()!==3)throw new Error('Missing phase logs');
   await p.clock.install({time:new Date('2026-11-03T00:00:00Z')});await p.clock.pauseAt(new Date('2026-11-03T00:00:01Z'));await p.clock.runFor(15000);
   if(!await p.getByTestId('game-recap').isVisible())throw new Error('Recap auto-advanced instead of waiting for Next');
   await p.reload();await p.getByTestId('game-recap').waitFor();
   if(await p.getByTestId('game-verdict').innerText()!==verdict)throw new Error('Reload changed game result');
   await p.getByTestId('game-next').click();await p.getByText(/FOCUS_1:/).waitFor();
   results.push({format:chapter===2?'BO3':'BO5',verdict,score,logs:3,pausedAfter15000ms:true,reloadResumesRecap:true,explicitNext:true});
  }finally{await context.close();}
 }
 return results;
}
