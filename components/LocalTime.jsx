'use client'
import {useEffect,useState} from 'react'
/** Shows the visitor's own time zone when it differs from Nairobi (EAT). */
export default function LocalTime({iso}){
  const [s,setS]=useState('')
  useEffect(()=>{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;if(tz==='Africa/Nairobi')return
    setS(new Date(iso).toLocaleString([],{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}))},[iso])
  return s?<span> · Your time: {s}</span>:null
}
