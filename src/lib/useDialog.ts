import { useEffect, useRef } from 'react';

let openDialogs=0;
let previousOverflow='';
const dialogStack:HTMLDivElement[]=[];
export function useDialog(onClose:()=>void,active=true) {
  const ref=useRef<HTMLDivElement>(null);
  const closeRef=useRef(onClose);closeRef.current=onClose;
  useEffect(()=>{
    if(!active)return;
    const previous=document.activeElement as HTMLElement|null;
    const element=ref.current;if(!element)return;
    if(openDialogs++===0){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
    dialogStack.push(element);
    const focusable=()=>Array.from(element.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea,select,[tabindex="0"]')).filter(el=>el.getClientRects().length>0);
    (focusable()[0]||element).focus();
    const handler=(event:KeyboardEvent)=>{
      if(dialogStack.at(-1)!==element)return;
      if(event.key==='Escape'){event.stopPropagation();closeRef.current();}
      if(event.key==='Tab'){
        const controls=focusable(), first=controls[0],last=controls.at(-1);
        if(!first){event.preventDefault();element.focus();}
        else if(!element.contains(document.activeElement)){event.preventDefault();first.focus();}
        else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',handler);
    return()=>{document.removeEventListener('keydown',handler);dialogStack.splice(dialogStack.indexOf(element),1);if(--openDialogs===0)document.body.style.overflow=previousOverflow;previous?.focus();};
  },[active]);
  return ref;
}
