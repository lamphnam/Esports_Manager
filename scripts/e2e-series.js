async(driver)=>{
 const context=await driver.context().browser().newContext({viewport:{width:390,height:844}});
 try{
  const p=await context.newPage();await p.goto('http://localhost:3000');
  await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
  await p.evaluate(()=>{const save=JSON.parse(localStorage.getItem('apac_rising_save_v3'));save.activeMatch=null;save.club.currentChapterId=2;save.club.completedChapterIds=[1];localStorage.setItem('apac_rising_save_v3',JSON.stringify(save));});
  await p.reload();await p.getByRole('button',{name:'Thi Đấu Ngay',exact:true}).click();
  await p.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();
  const score=await p.getByTestId('live-score').innerText();
  if(score.trim()!=='0 - 0')throw new Error(`P1-7 spoiler: ${score}`);
  await p.getByRole('button',{name:/Xem Kết Quả Ngay/}).click();
  await p.getByTestId('game-next').click();
  await p.getByText(/FOCUS_1:/).waitFor();
  const tactics=p.locator('button[disabled]').filter({hasText:/Gank Đường|Kiểm Soát Đường|Farm An|Giao Tranh Tổng|Bảo Vệ|Bắt Lẻ/});
  const disabled=await p.locator('button[disabled]').count();
  if(disabled<6)throw new Error(`P1-6 expected 6 automatic tactic buttons, found ${disabled}`);
  const trade=p.getByRole('button',{name:/Đổi Tài Nguyên Thông Minh/});
  await trade.click();
  await p.getByRole('button',{name:'Can thiệp EARLY',exact:true}).click();
  if(await trade.evaluate(el=>el.className.includes('ring-1')))throw new Error('FOCUS_1 retained a manual MID choice after switching to EARLY');
  await p.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();
  await p.getByRole('button',{name:/Xem Kết Quả Ngay/}).waitFor();
  return {firstGameScore:score,focusPolicy:true,automaticTactics:6,nextGameStarts:true};
 }finally{await context.close();}
}
