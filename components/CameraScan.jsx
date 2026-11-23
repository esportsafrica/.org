'use client'
import {useEffect,useRef,useState} from 'react'
/** QR scanning via the browser BarcodeDetector API (Chrome/Edge/Android). Falls back to typing / USB scanner. */
export default function CameraScan({inputId}){
  const v=useRef(),[on,setOn]=useState(false),[ok,setOk]=useState(true)
  useEffect(()=>{
    if(!on)return;let stop=false,stream
    ;(async()=>{
      if(!('BarcodeDetector' in window)){setOk(false);setOn(false);return}
      try{const d=new BarcodeDetector({formats:['qr_code']});stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});v.current.srcObject=stream;await v.current.play()
        const tick=async()=>{if(stop)return;try{const r=await d.detect(v.current);if(r[0]){const i=document.getElementById(inputId);i.value=r[0].rawValue;i.form.requestSubmit();return}}catch{}requestAnimationFrame(tick)};tick()
      }catch{setOk(false);setOn(false)}
    })()
    return()=>{stop=true;stream?.getTracks().forEach(t=>t.stop())}
  },[on,inputId])
  return <div className="mt-3"><button type="button" className="btn btn-ghost btn-sm" onClick={()=>setOn(!on)}>{on?'Stop camera':'Scan with camera'}</button>
    {!ok&&<p className="mt-2 text-xs text-muted">Camera scanning isn’t available in this browser. Use Chrome on Android, or type the code.</p>}
    {on&&<video ref={v} muted playsInline className="mt-3 w-full max-w-md border border-line"/>}</div>
}
