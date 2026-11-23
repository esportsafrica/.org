import {useEffect} from 'react'
/** Dialog a11y: focus moves in, Tab stays inside, Escape closes, focus returns on close, page scroll locks. */
export default function useFocusTrap(ref,open,onClose){
  useEffect(()=>{
    if(!open||!ref.current)return
    const el=ref.current,prev=document.activeElement
    const items=()=>[...el.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')]
    items()[0]?.focus()
    const k=e=>{
      if(e.key==='Escape'){onClose();return}
      if(e.key!=='Tab')return
      const l=items();if(!l.length)return;const a=l[0],z=l[l.length-1]
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
    }
    document.addEventListener('keydown',k);document.body.style.overflow='hidden'
    return()=>{document.removeEventListener('keydown',k);document.body.style.overflow='';prev?.focus?.()}
  },[open])
}
