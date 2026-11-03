async(driver)=>{
 const c=await driver.context().browser().newContext({viewport:{width:390,height:844}});
 try{
  const p=await c.newPage();await p.addInitScript(()=>{Date.now=()=>1;});await p.goto('http://localhost:3000');
  await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
  await p.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();
  const originalPower=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')).activeMatch.playerSnapshot.teamOvr);
  const resultBeforeReload=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')).activeMatch.simulationResult);
  await p.reload();await p.getByRole('dialog',{name:'Trung Tâm Trận Đấu',exact:true}).waitFor();
  const resultAfterReload=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')).activeMatch.simulationResult);
  if(JSON.stringify(resultBeforeReload)!==JSON.stringify(resultAfterReload))throw new Error('Mid-match reload changed outcome');
  if(await p.getByRole('button',{name:/Xem Kết Quả Ngay/}).isVisible())await p.getByRole('button',{name:/Xem Kết Quả Ngay/}).click();
  await p.getByRole('button',{name:/Nhận Thưởng & Hoàn Thành/}).waitFor();
  await p.reload();await p.getByTitle('Mã sao lưu / khôi phục dữ liệu').waitFor();
  if(await p.getByRole('button',{name:/Nhận Thưởng & Hoàn Thành/}).count()===0)throw new Error('Reload lost the resolved match and unclaimed reward');
  await p.getByRole('button',{name:/Nhận Thưởng & Hoàn Thành/}).click();await p.getByRole('dialog',{name:'Mở Thẻ Tuyển Thủ',exact:true}).waitFor();
  await p.reload();await p.getByRole('dialog',{name:'Mở Thẻ Tuyển Thủ',exact:true}).waitFor();
  await p.getByRole('button',{name:/Trang Bị Vào Đội Hình/}).click();await p.getByRole('button',{name:'Cất Vào Kho',exact:true}).click();
  const save=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')));
  if(save.ownedCards.length!==6||save.club.wallet.credits!==1000)throw new Error('Reload duplicated or lost reward');
  await p.getByRole('button',{name:'Thi Đấu Ngay',exact:true}).click();await p.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();
  const next=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')).activeMatch);
  if(next.playerSnapshot.teamOvr<=originalPower)throw new Error('Second match did not use the stronger lineup');
  return{midMatchSameOutcome:true,recapResumed:true,packResumed:true,secondMatchStronger:true,cards:6,credits:1000};
 }finally{await c.close();}
}
