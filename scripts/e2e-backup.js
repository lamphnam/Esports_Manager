async (page) => {
  const viewport={width:1280,height:800};
  const context=await page.context().browser().newContext({viewport,permissions:['clipboard-read','clipboard-write']});
  const p=await context.newPage();
  const errors=[];p.on('pageerror',error=>errors.push(error.message));
  const nudge=()=>p.getByRole('status').filter({hasText:'Tiến trình mới chưa được sao lưu'});
  const keyButton=()=>p.getByTitle('Mã sao lưu / khôi phục dữ liệu');
  const dirty=async()=>(await keyButton().getAttribute('aria-label')).includes('chưa sao lưu');
  try {
    await p.addInitScript(()=>{Date.now=()=>1;});
    await p.goto('http://localhost:3000');
    await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();
    await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
    await p.getByRole('button',{name:'Vào Trận Đấu',exact:true}).click();
    const nudgeAtStart=await nudge().count(),dirtyAtStart=await dirty();
    if(nudgeAtStart||dirtyAtStart)throw new Error('Starter squad must not trigger a backup nudge');
    await p.getByRole('button',{name:/Xem Kết Quả Ngay/}).click();
    await p.getByRole('button',{name:/Nhận Thưởng & Hoàn Thành/}).click();
    await p.getByRole('button',{name:/Trang Bị Vào Đội Hình/}).waitFor();
    await p.getByRole('button',{name:/Trang Bị Vào Đội Hình/}).click();
    await p.getByRole('button',{name:'Cất Vào Kho',exact:true}).click();
    await nudge().waitFor();
    if(!await dirty())throw new Error('Backup button must show unsaved progress');
    const nudgeInline=await nudge().evaluate(el=>getComputedStyle(el).position!=='fixed'&&getComputedStyle(el).position!=='absolute');
    await keyButton().click();
    await p.waitForFunction(()=>document.querySelector('textarea[aria-label="Recovery Code hiện tại"]')?.value.startsWith('AR1.'));
    const code=await p.getByRole('textbox',{name:'Recovery Code hiện tại',exact:true}).inputValue();
    const neverBackedUp=await p.getByRole('dialog').getByText('Chưa sao lưu lần nào').count()===1;
    const noEmbedAdvice=await p.getByRole('dialog').getByText('bản nhúng').count()===0;
    await p.getByRole('button',{name:'Sao Chép',exact:true}).click();
    await p.getByRole('status').filter({hasText:'Đã Sao Chép'}).waitFor();
    await p.keyboard.press('Escape');
    await p.getByRole('dialog').waitFor({state:'hidden'});
    if(await nudge().count())throw new Error('Nudge must clear after the code is copied');
    if(await dirty())throw new Error('Dirty marker must clear after the code is copied');
    const meta=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_backup_meta')));
    if(typeof meta.lastBackupAt!=='number'||meta.scoreAtBackup<=0)throw new Error('Backup meta not stored');
    const save=await p.evaluate(()=>JSON.parse(localStorage.getItem('apac_rising_save_v3')));
    if('apac_backup_meta' in save||JSON.stringify(save).includes('lastBackupAt'))throw new Error('Backup meta leaked into the save');
    await p.reload();
    await keyButton().waitFor();
    if(await nudge().count()||await dirty())throw new Error('Reload must not nag after a backup');
    await keyButton().click();
    const lastBackupShown=await p.getByRole('dialog').getByText('Sao lưu gần nhất').count()===1;
    await p.keyboard.press('Escape');
    if(errors.length)throw new Error(errors.join('\n'));
    return {nudgeAtStart,nudgeInline,neverBackedUp,noEmbedAdvice,codeStartsAR1:code.startsWith('AR1.'),codeLength:code.length,clearedAfterCopy:true,reloadQuiet:true,lastBackupShown,pageErrors:errors};
  } finally {await context.close();}
}
