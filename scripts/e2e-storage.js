async (page) => {
  const browser=page.context().browser();
  const source=await browser.newContext({viewport:{width:390,height:844}});
  const blocked=await browser.newContext({viewport:{width:390,height:844}});
  try {
    const p=await source.newPage();await p.goto('http://localhost:3000');
    await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();
    await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
    const code=await p.evaluate(async()=>{
      const {encodeSave}=await import('/src/lib/recoveryCode.ts');
      return encodeSave(JSON.parse(localStorage.getItem('apac_rising_save_v3')));
    });
    await blocked.addInitScript(()=>{
      for(const method of ['getItem','setItem','removeItem'])Storage.prototype[method]=()=>{throw new DOMException('Blocked by test','SecurityError');};
      Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('blocked');}}});
      document.execCommand=()=>false;
    });
    const b=await blocked.newPage();await b.goto('http://localhost:3000');
    await b.getByRole('button',{name:'Nhập Recovery Code',exact:true}).click();
    await b.getByRole('textbox',{name:'Nhập Recovery Code',exact:true}).fill(code);
    await b.getByRole('button',{name:'Khôi Phục Save',exact:true}).click();
    await b.getByRole('alert').filter({hasText:'Không thể lưu'}).waitFor();
    await b.getByRole('button',{name:'Mở sao lưu',exact:true}).click();
    await b.waitForFunction(()=>document.querySelector('textarea[aria-label="Recovery Code hiện tại"]')?.value.startsWith('AR1.'));
    await b.getByRole('button',{name:'Sao Chép',exact:true}).click();
    await b.getByRole('status').filter({hasText:'Không thể sao chép tự động'}).waitFor();
    const selected=await b.getByRole('textbox',{name:'Recovery Code hiện tại',exact:true}).evaluate(el=>el.selectionEnd-el.selectionStart===el.value.length);
    if(!selected)throw new Error('Clipboard fallback did not select code');
    return {storageBlockedBanner:true,restoreFromOnboarding:true,clipboardBlocked:true,manualCopySelected:true};
  } finally {await source.close();await blocked.close();}
}
