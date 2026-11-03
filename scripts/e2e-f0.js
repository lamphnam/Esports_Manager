async (page) => {
  const viewport={width:390,height:844};
  const touch=true;
  const context=await page.context().browser().newContext({viewport,isMobile:touch,hasTouch:touch});
  const p=await context.newPage();
  const errors=[];p.on('pageerror',error=>errors.push(error.message));
  try {
    await p.addInitScript(()=>{Date.now=()=>1;});
    await p.goto('http://localhost:3000');
    await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).tap();
    await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).tap();
    await p.getByRole('button',{name:'Vào Trận Đấu',exact:true}).tap();
    await p.getByRole('button',{name:/Xem Kết Quả Ngay/}).tap();
    await p.getByRole('button',{name:/Nhận Thưởng & Hoàn Thành/}).tap();
    await p.getByRole('button',{name:/Trang Bị Vào Đội Hình/}).waitFor();
    const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')));
    if(before.ownedCards.length!==6||before.club.packs.length!==0||before.club.wallet.credits!==1000)throw new Error('Reward/pack persistence failed');
    await p.getByRole('button',{name:/Trang Bị Vào Đội Hình/}).tap();
    await p.getByRole('button',{name:'Cất Vào Kho',exact:true}).tap();
    const equipped=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')));
    const newCard=equipped.ownedCards.find(c=>!c.isLocked);
    if(!Object.values(equipped.club.lineup).includes(newCard.instanceId))throw new Error('Equip failed');
    await p.reload();
    await p.getByTitle('Mã sao lưu / khôi phục dữ liệu').tap();
    const current=p.getByRole('textbox',{name:'Recovery Code hiện tại',exact:true});
    await p.waitForFunction(()=>document.querySelector('textarea[aria-label="Recovery Code hiện tại"]')?.value.startsWith('AR1.'));
    const code=await current.inputValue();
    await p.getByRole('textbox',{name:'Nhập Recovery Code',exact:true}).fill('AR-FAKE');
    await p.getByRole('button',{name:'Khôi Phục Save',exact:true}).tap();
    await p.getByRole('status').filter({hasText:'Mã không hợp lệ'}).waitFor();
    await p.getByRole('textbox',{name:'Nhập Recovery Code',exact:true}).fill(code);
    await p.getByRole('button',{name:'Khôi Phục Save',exact:true}).tap();
    await p.getByRole('dialog').waitFor({state:'hidden'});
    // Exported codes fold the ledger, so the restore has landed once the stored ledger is empty (WebKit reports the dialog hidden early).
    await p.waitForFunction(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')).ledger.length===0);
    const restored=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')));
    // DEC-12: exported codes fold the hot ledger into ledgerArchive, so compare everything else exactly and the ledger by totals.
    const canon=value=>JSON.stringify(value,(key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a<b?-1:1)):item);
    const folded={...equipped,ledger:[],ledgerArchive:equipped.ledger.reduce((sum,entry)=>({credits:sum.credits+entry.deltaCredits,materials:sum.materials+entry.deltaMaterials,tickets:sum.tickets+entry.deltaTickets,count:sum.count+1}),equipped.ledgerArchive||{credits:0,materials:0,tickets:0,count:0})};
    if(canon(restored)!==canon(folded))throw new Error('Recovery round-trip differs');
    if(errors.length)throw new Error(errors.join('\n'));
    return {viewport:`${viewport.width}x${viewport.height}`,touch,cards:restored.ownedCards.length,credits:restored.club.wallet.credits,completed:restored.club.completedChapterIds,equipped:true,reload:true,recovery:true,pageErrors:errors};
  } finally {await context.close();}
}
