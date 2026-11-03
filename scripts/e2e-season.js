async (page) => {
  const context=await page.context().browser().newContext({viewport:{width:1280,height:900}});
  const p=await context.newPage();
  const errors=[];p.on('pageerror',error=>errors.push(error.message));
  const patch=(fn)=>p.evaluate(fn);
  try {
    await p.addInitScript(()=>{Date.now=()=>1;});
    await p.goto('http://localhost:3000');
    await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();
    await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
    await patch(()=>{const s=JSON.parse(localStorage.getItem('apac_rising_save_v3'));s.activeMatch=null;s.club.completedChapterIds=[1,2,3,4,5,6,7,8,9,10,11];s.club.currentChapterId=12;localStorage.setItem('apac_rising_save_v3',JSON.stringify(s));});
    await p.reload();
    // 1. The season is laid out as brackets on the Hub
    await p.getByRole('heading',{name:'Hành trình mùa 2026'}).waitFor();
    const brackets=await p.locator('section[aria-labelledby^="bracket-"]').count();
    const worldsStages=await p.locator('section[aria-labelledby="bracket-worlds"] ol > li button').count();
    if(brackets!==7||worldsStages!==3)throw new Error(`bracket layout wrong: ${brackets} brackets, ${worldsStages} worlds stages`);
    // 2. Opening the Worlds final shows both line-ups
    await p.getByRole('button',{name:/Chung Kết Thế Giới \(Worlds\), Chung kết, chương 12/}).click();
    const dialog=p.getByRole('dialog',{name:'Trung Tâm Trận Đấu'});await dialog.waitFor();
    const opponentCards=await dialog.locator('section[aria-label^="Đối thủ"] li').count();
    const yourCards=await dialog.locator('section[aria-label^="Đội của bạn"] li').count();
    if(opponentCards!==5||yourCards!==5)throw new Error(`line-ups wrong: ${opponentCards} / ${yourCards}`);
    const header=await dialog.getByText(/Chung Kết Thế Giới \(Worlds\) · Chung kết/).count();
    // 3. While playing: lane map and series tracker are shown
    await dialog.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();
    await dialog.locator('svg[role="img"]').waitFor();
    await dialog.getByText('Best of 5').first().waitFor();
    const trackerSlots=await dialog.getByRole('list',{name:'Các ván của chuỗi'}).locator('li').count();
    await dialog.getByRole('button',{name:'Đóng trận đấu'}).click();
    // 4. Winning the Worlds ends the season; the next one starts on request
    await patch(()=>{const s=JSON.parse(localStorage.getItem('apac_rising_save_v3'));s.activeMatch=null;s.club.completedChapterIds=[1,2,3,4,5,6,7,8,9,10,11,12];s.club.currentChapterId=12;localStorage.setItem('apac_rising_save_v3',JSON.stringify(s));window.__before=s.club.wallet.credits;});
    const before=await patch(()=>window.__before);
    await p.reload();
    await p.getByRole('heading',{name:'Vô địch thế giới 2026!'}).waitFor();
    await p.getByRole('button',{name:'Bước sang mùa 2027'}).click();
    await p.getByRole('heading',{name:'Hành trình mùa 2027'}).waitFor();
    const save=await patch(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')));
    if(save.club.careerYear!==2027||save.club.currentChapterId!==3||JSON.stringify(save.club.completedChapterIds)!=='[1,2]')throw new Error('season state wrong: '+JSON.stringify([save.club.careerYear,save.club.currentChapterId,save.club.completedChapterIds]));
    if(save.club.wallet.credits!==before+1000||!save.ledger.some(e=>e.reason.includes('mùa 2027')))throw new Error('stipend missing');
    const opponent=await p.locator('#campaign-objective').locator('xpath=ancestor::section').locator('dd').first().innerText();
    if(!/\d{4}/.test(opponent))throw new Error('season 2 opponent should be a historical team: '+opponent);
    await p.reload();await p.getByRole('heading',{name:'Hành trình mùa 2027'}).waitFor();
    if(errors.length)throw new Error(errors.join('\n'));
    return {brackets,worldsStages,opponentCards,yourCards,headerHasStage:header>0,trackerSlots,season2Opponent:opponent,careerYear:save.club.careerYear,persistedAfterReload:true,pageErrors:errors};
  } finally {await context.close();}
}
