async(driver)=>{
 const browser=driver.context().browser(),c=await browser.newContext({viewport:{width:390,height:844}}),blocked=await browser.newContext({viewport:{width:390,height:844}});
 try{
  await c.addInitScript(()=>{Date.now=()=>1;});
  const p=await c.newPage();await p.goto('http://127.0.0.1:4174');
  const f=p.frameLocator('iframe');
  await f.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();await f.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
  await f.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();await f.getByRole('button',{name:/Xem Kết Quả Ngay/}).click();
  await f.getByRole('button',{name:/Nhận Thưởng & Hoàn Thành/}).click();
  await f.getByRole('button',{name:/Trang Bị Vào Đội Hình/}).waitFor();await f.getByRole('button',{name:/Trang Bị Vào Đội Hình/}).click();await f.getByRole('button',{name:'Cất Vào Kho',exact:true}).click();
  await p.reload();await f.getByTitle('Mã sao lưu / khôi phục dữ liệu').click();
  await p.frames().find(frame=>frame.url().startsWith('http://localhost:4173')).waitForFunction(()=>document.querySelector('textarea[aria-label="Recovery Code hiện tại"]')?.value.startsWith('AR1.'));
  const code=await f.getByRole('textbox',{name:'Recovery Code hiện tại',exact:true}).inputValue();
  await blocked.addInitScript(()=>{if(location.hostname==='localhost'){for(const method of ['getItem','setItem','removeItem'])Storage.prototype[method]=()=>{throw new DOMException('Test blocked','SecurityError');};}});
  const b=await blocked.newPage();await b.goto('http://127.0.0.1:4174');const bf=b.frameLocator('iframe');
  await bf.getByRole('button',{name:'Nhập Recovery Code',exact:true}).click();await bf.getByRole('textbox',{name:'Nhập Recovery Code',exact:true}).fill(code);await bf.getByRole('button',{name:'Khôi Phục Save',exact:true}).click();
  await bf.getByRole('alert').filter({hasText:'Không thể lưu'}).waitFor();
  const metrics=await b.frames().find(frame=>frame.url().startsWith('http://localhost:4173')).evaluate(()=>({header:document.querySelector('header').scrollWidth,client:document.querySelector('header').clientWidth}));
  if(metrics.header>metrics.client)throw new Error('Iframe header overflow');
  return {parent:'127.0.0.1:4174',game:'localhost:4173',crossOrigin:true,F0:true,reload:true,blockedStorageBanner:true,recovery:true,...metrics};
 }finally{await c.close();await blocked.close();}
}
