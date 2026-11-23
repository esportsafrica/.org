import Link from 'next/link'
import Reveal from './Reveal'
export default function ComingSoon({title,children}){
  return <div className="wrap py-20"><Reveal><div className="tag">Next build</div><h1 className="my-3 text-[clamp(44px,8vw,88px)] font-extrabold">{title}</h1><p className="mb-6 max-w-xl text-neutral-400">{children}</p><Link href="/" className="btn btn-ghost">Back home</Link></Reveal></div>
}
