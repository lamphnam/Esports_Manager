async(driver)=>{
 const context=await driver.context().browser().newContext({viewport:{width:390,height:844}});
 try {
  const page=await context.newPage();await page.goto('http://localhost:3000');
  await page.getByRole('button',{name:'Nhập Recovery Code',exact:true}).waitFor();
  await page.clock.install({time:new Date('2026-11-03T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-03T00:00:01Z'));
  await page.evaluate(async()=>{
   const React=(await import('/node_modules/.vite/deps/react.js')).default;
   const {createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;
   const {flushSync}=(await import('/node_modules/.vite/deps/react-dom.js')).default;
   const {GameProvider}=await import('/src/context/GameContext.tsx');
   const {PackOpeningModal}=await import('/src/components/PackOpeningModal.tsx');
   const {openPackInstance}=await import('/src/lib/economyEngine.ts');
   const host=document.createElement('div');document.body.append(host);
   flushSync(()=>createRoot(host).render(React.createElement(GameProvider,null,React.createElement(PackOpeningModal,{packResult:openPackInstance('WELCOME',0,1),onClose:()=>{}}))));
  });
  await page.getByRole('button',{name:/Bỏ qua hiệu ứng/}).click();
  await page.clock.runFor(900);
  const rewound=await page.getByRole('button',{name:/Bỏ qua hiệu ứng/}).isVisible();
  if(rewound)throw new Error('P1-8 Skip rewound to BLOOM after 800ms');
  await page.clock.runFor(2100);
  if(await page.getByRole('button',{name:/Bỏ qua hiệu ứng/}).isVisible())throw new Error('Skip reappeared');
  return {skipStableAfter3000ms:true};
 }finally{await context.close();}
}
