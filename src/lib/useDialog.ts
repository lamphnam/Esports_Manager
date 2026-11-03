import { useEffect, useRef } from 'react';

export function useDialog(onClose:()=>void) {
  const ref=useRef<HTMLDivElement>(null);
  const closeRef=useRef(onClose);closeRef.current=onClose;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const element=ref.current;if(!element)return;
    const focusable=()=>Array.from(element.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea,select,[tabindex="0"]')).filter(el=>el.getClientRects().length>0);
    (focusable()[0]||element).focus();
    const handler=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.stopPropagation();closeRef.current();}
      if(event.key==='Tab'){
        const controls=focusable(), first=controls[0],last=controls.at(-1);
        if(!first){event.preventDefault();element.focus();}
        else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    element.addEventListener('keydown',handler);
    return()=>{element.removeEventListener('keydown',handler);previous?.focus();};
  },[]);
  return ref;
}
