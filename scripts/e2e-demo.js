async(driver)=>{
 const context=await driver.context().browser().newContext({viewport:{width:390,height:844}});
 try{
  const p=await context.newPage();await p.goto('http://localhost:3000');
  await p.getByRole('button',{name:/Tiếp Tục: Điểm Danh/}).click();await p.getByRole('button',{name:/Bắt Đầu Trận Đấu Đầu Tiên/}).click();
  await p.reload();await p.getByRole('button',{name:/Thử Nghiệm Ngay/}).waitFor();
  const before=await p.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort())));
  await p.getByRole('button',{name:/Thử Nghiệm Ngay/}).click();
  const dialog=p.getByRole('dialog',{name:'Demo Chung Kết Thế Giới'});
  for(let game=1;game<=5;game++){
   await dialog.getByRole('button',{name:`Bắt Đầu Ván ${game}`,exact:true}).click();
   await dialog.getByRole('button',{name:'Bỏ Qua Diễn Biến Ván',exact:true}).click();
   if(await dialog.getByRole('button',{name:'Kết Thúc Demo',exact:true}).isVisible())break;
  }
  const score=await p.getByTestId('demo-score').innerText();
  await dialog.getByRole('button',{name:'Kết Thúc Demo',exact:true}).click();
  const after=await p.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort())));
  if(before!==after)throw new Error('G1 demo wrote career/localStorage');
  return{localStorageByteIdentical:true,score,viewport:'390x844'};
 }finally{await context.close();}
}
