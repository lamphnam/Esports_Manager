async (driver) => {
  const context=await driver.context().browser().newContext({viewport:{width:390,height:844}});
  try {
    const page=await context.newPage();await page.addInitScript(()=>{Date.now=()=>1;});await page.goto('http://localhost:3000');
    const result=await page.evaluate(async()=>{
      const React=(await import('/node_modules/.vite/deps/react.js')).default;
      const {createRoot}=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;
      const {GameProvider,useGame}=await import('/src/context/GameContext.tsx');
      const catalog=await import('/src/data/cardCatalog.ts');
      const {encodeSave,decodeSave}=await import('/src/lib/recoveryCode.ts');
      let api;function Probe(){api=useGame();return null;}
      const root=createRoot(document.createElement('div'));root.render(React.createElement(GameProvider,null,React.createElement(Probe)));
      await new Promise(r=>setTimeout(r,100));api.createClub('State test','gold_star');
      const snapshot=async()=>decodeSave(await api.exportRecoveryCode());
      const initial=await snapshot();const checks={};
      for(const name of ['Karsa','Slayder']) {
        const player=catalog.PLAYERS_CATALOG.find(p=>p.displayName===name);
        const ed=catalog.EDITIONS_CATALOG.find(e=>e.playerId===player.id);
        const save=structuredClone(initial);
        save.ownedCards.push({instanceId:name,editionId:ed.id,playerId:ed.playerId,level:1,trainedStats:{},acquiredAt:1,acquiredFrom:'test'});
        await api.restoreFromRecoveryCode(await encodeSave(save));
        api.equipCard(player.primaryRole,name);api.equipCard(player.secondaryRole,name);
        const after=await snapshot();const slots=Object.values(after.club.lineup).filter(Boolean);
        checks[`P1-1 ${name} unique`]=new Set(slots).size===slots.length;
      }
      await api.restoreFromRecoveryCode(await encodeSave(initial));
      const first=api.claimChapterReward(1),second=api.claimChapterReward(1);
      checks['P1-10 claim once']=first&&!second&&(await snapshot()).club.wallet.credits===1000;
      const free=api.buyPackWithCredits('WELCOME');
      checks['no free Welcome farming']=!free;
      const capped=structuredClone(initial), legendary=catalog.EDITIONS_CATALOG.find(e=>e.baseStats.mental>=98);
      capped.ownedCards.push({instanceId:'cap-test',editionId:legendary.id,playerId:legendary.playerId,level:2,trainedStats:{mental:1},acquiredAt:1,acquiredFrom:'test'});
      await api.restoreFromRecoveryCode(await encodeSave(capped));
      checks['P1-12 stat cap']=!api.trainCard('cap-test','mental');
      const broke=structuredClone(initial);broke.club.wallet.credits=0;
      await api.restoreFromRecoveryCode(await encodeSave(broke));
      checks['P1-13 zero credits recovery']=typeof api.claimSponsorship==='function'&&api.claimSponsorship()&&(await snapshot()).club.wallet.credits>0;
      checks['P1-13 sponsor cannot repeat']=!api.claimSponsorship();
      const discounted=structuredClone(initial);discounted.club.facilities.TRAINING_CENTER=1;
      await api.restoreFromRecoveryCode(await encodeSave(discounted));
      api.trainCard(discounted.ownedCards[0].instanceId,'macro');
      checks['P1-5 discount debited']=((await snapshot()).club.wallet.credits===410);
      await api.restoreFromRecoveryCode(await encodeSave(initial));
      api.trainCard(initial.ownedCards[0].instanceId,'mechanics');api.trainCard(initial.ownedCards[1].instanceId,'mechanics');
      const ids=(await snapshot()).ledger.map(entry=>entry.id);
      checks['P1-13 IDs unique under same timestamp']=new Set(ids).size===ids.length;
      const historical=catalog.EDITIONS_CATALOG.find(ed=>ed.editionCode==='LEGACY'&&ed.role!==catalog.getPlayerById(ed.playerId).primaryRole&&ed.role===catalog.getPlayerById(ed.playerId).secondaryRole);
      const season=structuredClone(initial);season.ownedCards.push({instanceId:'historical-role',editionId:historical.id,playerId:historical.playerId,level:1,trainedStats:{},acquiredAt:1,acquiredFrom:'test'});
      await api.restoreFromRecoveryCode(await encodeSave(season));api.equipCard(historical.role,'historical-role');
      checks['edition primary role has no secondary penalty']=api.getTeamSnapshot().roster.find(p=>p.role===historical.role).effectiveStats.mechanics===historical.baseStats.mechanics;
      root.unmount();return checks;
    });
    if(Object.values(result).some(value=>!value))throw new Error(JSON.stringify(result));
    return result;
  } finally {await context.close();}
}
