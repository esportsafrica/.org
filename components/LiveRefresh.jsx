'use client'
import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {supabaseBrowser} from '@/lib/supabase/client'
/** Subscribes to match changes (Realtime) and re-renders server data. */
export default function LiveRefresh({tournamentId}){
  const router=useRouter()
  useEffect(()=>{const sb=supabaseBrowser()
    const ch=sb.channel('matches-'+tournamentId).on('postgres_changes',{event:'*',schema:'public',table:'matches',filter:`tournament_id=eq.${tournamentId}`},()=>router.refresh()).subscribe()
    return()=>{sb.removeChannel(ch)}},[tournamentId,router])
  return null
}
