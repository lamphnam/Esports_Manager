async (page) => {
  const context=await page.context().browser().newContext({viewport:{width:390,height:844}});
  const p=await context.newPage();
  const errors=[];p.on('pageerror',error=>errors.push(error.message));
  try {
    await p.addInitScript(()=>{Date.now=()=>1;});
    await p.goto('http://localhost:3000');
    await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();
    await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
    await p.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();
    await p.getByRole('button',{name:/Xem Kết Quả Ngay/}).click();
    await p.getByRole('button',{name:/Nhận Thưởng & Hoàn Thành/}).click();
    await p.getByRole('button',{name:/Trang Bị Vào Đội Hình/}).waitFor();
    const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')));
    if(before.ownedCards.length!==6||before.club.packs.length!==0||before.club.wallet.credits!==1000)throw new Error('Reward/pack persistence failed');
    await p.getByRole('button',{name:/Trang Bị Vào Đội Hình/}).click();
    await p.getByRole('button',{name:'Cất Vào Kho',exact:true}).click();
    const equipped=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')));
    const newCard=equipped.ownedCards.find(c=>!c.isLocked);
    if(!Object.values(equipped.club.lineup).includes(newCard.instanceId))throw new Error('Equip failed');
    await p.reload();
    await p.getByTitle('Mã sao lưu / khôi phục dữ liệu').click();
    const current=p.getByRole('textbox',{name:'Recovery Code hiện tại',exact:true});
    await p.waitForFunction(()=>document.querySelector('textarea[aria-label="Recovery Code hiện tại"]')?.value.startsWith('AR1.'));
    const code=await current.inputValue();
    await p.getByRole('textbox',{name:'Nhập Recovery Code',exact:true}).fill('AR-FAKE');
    await p.getByRole('button',{name:'Khôi Phục Save',exact:true}).click();
    await p.getByRole('status').filter({hasText:'Mã không hợp lệ'}).waitFor();
    await p.getByRole('textbox',{name:'Nhập Recovery Code',exact:true}).fill(code);
    await p.getByRole('button',{name:'Khôi Phục Save',exact:true}).click();
    await p.getByRole('dialog').waitFor({state:'hidden'});
    const restored=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')));
    if(JSON.stringify(restored)!==JSON.stringify(equipped))throw new Error('Recovery round-trip differs');
    if(errors.length)throw new Error(errors.join('\n'));
    return {viewport:'390x844',cards:restored.ownedCards.length,credits:restored.club.wallet.credits,completed:restored.club.completedChapterIds,equipped:true,reload:true,recovery:true,pageErrors:errors};
  } finally {await context.close();}
}
