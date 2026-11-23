import {Suspense} from 'react'
import AuthForm from '@/components/AuthForm'
export const metadata={title:'Signup · Esports Africa'}
export default function Page(){return <div className="grid min-h-[70vh] place-items-center p-5"><Suspense><AuthForm mode="signup"/></Suspense></div>}
