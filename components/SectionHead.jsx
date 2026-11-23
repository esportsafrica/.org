import Reveal from './Reveal'
export default function SectionHead({a,b,children}){
  return <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4"><h2 className="text-[clamp(34px,6vw,60px)] font-extrabold">{a} <span className="text-accent">{b}</span></h2>{children}</Reveal>
}
