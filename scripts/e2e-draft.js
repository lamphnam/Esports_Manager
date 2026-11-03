async(driver)=>{
 const c=await driver.context().browser().newContext({viewport:{width:390,height:844}});
 try{
  const p=await c.newPage();await p.goto('http://localhost:3000');await p.getByRole('button',{name:'Nhập Recovery Code',exact:true}).waitFor();
  const flag=await p.evaluate(async()=>(await import('/src/data/featureFlags.ts')).FEATURE_GOLDEN_ROAD);
  if(flag)throw new Error('Submission flag must remain off');
  await p.evaluate(async()=>{
   const React=(await import('/node_modules/.vite/deps/react.js')).default;
   const {createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;
   const {GameProvider,useGame}=await import('/src/context/GameContext.tsx');
   const {LegacyDraftModal}=await import('/src/components/LegacyDraftModal.tsx');
   function Harness(){const api=useGame();React.useEffect(()=>{if(!api.isLoading&&!api.club)api.createClub('Draft QA','gold_star');},[api.isLoading]);return api.club?React.createElement(LegacyDraftModal,{onClose:()=>{},onClaim:api.claimDraftReward}):null;}
   const host=document.createElement('div');document.body.append(host);createRoot(host).render(React.createElement(GameProvider,null,React.createElement(Harness)));
  });
  const modal=p.getByRole('dialog',{name:'Golden Road Draft',exact:true});
  for(const label of ['Đổi Khu Vực','Đổi CLB','Đổi Năm'])await modal.getByRole('button',{name:label,exact:true}).click();
  for(let i=0;i<5;i++)await modal.getByRole('button',{name:/^Chọn /}).first().click();
  await modal.getByRole('button',{name:'Mô Phỏng Sáu Chặng',exact:true}).click();
  if(await modal.locator('details').count()!==6)throw new Error('Missing stage results');
  await modal.getByRole('button',{name:'Nhận Thưởng Draft',exact:true}).click();
  await modal.getByRole('status').filter({hasText:'Đã nhận 50 Credits'}).waitFor();
  const once=await p.evaluate(()=>localStorage.getItem('apac_rising_save_v3'));
  await modal.getByRole('button',{name:'Nhận Thưởng Draft',exact:true}).click();
  await modal.getByRole('status').filter({hasText:'Không thể nhận'}).waitFor();
  const twice=await p.evaluate(()=>localStorage.getItem('apac_rising_save_v3'));
  if(once!==twice)throw new Error('Duplicate reward changed save');
  const image=await p.evaluate(async()=>{
   const engine=await import('/src/lib/legacyDraft/engine.ts'),{draftShareImage}=await import('/src/lib/legacyDraft/share.ts');
   let state=engine.createDraft(42);while(!engine.draftComplete(state))state=engine.pickDraftCard(state,state.offer.editionIds[0]);
   const url=draftShareImage(state,engine.simulateDraftCircuit(state)),img=new Image();img.src=url;await img.decode();return{png:url.startsWith('data:image/png;'),width:img.width,height:img.height};
  });
  return {flag:false,mobileDraft:true,stages:6,rewardOnce:true,...image};
 }finally{await c.close();}
}
