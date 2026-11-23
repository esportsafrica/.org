import Link from 'next/link'
export default function NotFound(){return <div className="wrap py-24"><div className="tag">404</div><h1 className="my-3 text-[clamp(52px,10vw,120px)] font-extrabold">Out of <span className="text-accent">bounds</span></h1><p className="mb-6 text-neutral-400">That page doesn’t exist.</p><Link href="/" className="btn">Back home</Link></div>}
