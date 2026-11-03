async(driver)=>{
 const context=await driver.context().browser().newContext({viewport:{width:390,height:844}});
 try {
  const page=await context.newPage();await page.addInitScript(()=>{Date.now=()=>1;});await page.goto('http://localhost:3000');
  await page.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();await page.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
  await page.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();await page.getByRole('button',{name:/Xem Kết Quả Ngay/}).click();
  await page.getByRole('button',{name:/Nhận Thưởng & Hoàn Thành/}).waitFor();
  await page.clock.install({time:new Date('2026-11-03T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-03T00:00:01Z'));
  await page.getByRole('button',{name:/Nhận Thưởng & Hoàn Thành/}).click();
  await page.getByRole('button',{name:/Bỏ qua hiệu ứng/}).click();
  await page.clock.runFor(900);
  if(await page.getByRole('button',{name:/Bỏ qua hiệu ứng/}).isVisible())throw new Error('P1-8 Skip rewound to BLOOM after 800ms');
  await page.clock.runFor(2100);
  if(await page.getByRole('button',{name:/Bỏ qua hiệu ứng/}).isVisible())throw new Error('Skip reappeared');
  return {skipStableAfter3000ms:true,throughFullF0:true};
 }finally{await context.close();}
}
