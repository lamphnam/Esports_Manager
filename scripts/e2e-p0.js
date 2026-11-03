async (driver) => {
  const context=await driver.context().browser().newContext();
  const page=await context.newPage();
  await page.goto('http://localhost:3000');
  await page.setViewportSize({width:390,height:844});
  const result = await page.evaluate(async () => {
    const React=(await import('/node_modules/.vite/deps/react.js')).default;
    const {createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;
    const {GameProvider,useGame}=await import('/src/context/GameContext.tsx');
    let api;
    function Probe(){api=useGame();return null;}
    const root=createRoot(document.createElement('div'));
    root.render(React.createElement(GameProvider,null,React.createElement(Probe)));
    await new Promise(r=>setTimeout(r,100));
    api.createClub('P0 Repro','gold_star');
    await new Promise(r=>setTimeout(r,100));
    const sameRender=api;
    const claimed=sameRender.claimChapterReward(1);
    const draw=sameRender.openPack('WELCOME');
    const duplicate=sameRender.openPack('WELCOME');
    const fakeRestore=await sameRender.restoreFromRecoveryCode('AR-FAKE');
    root.unmount();
    return {claimed,welcomeOpens:!!draw,duplicate:!!duplicate,fakeRestore};
  });
  if(!result.claimed||!result.welcomeOpens||result.duplicate||result.fakeRestore) throw new Error(`P0 regression: ${JSON.stringify(result)}`);
  await context.close();
  return result;
}
