import Reveal from './Reveal'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

export default function Standings({groups}){
  if (!groups.length) {
    return <p className="text-muted">Group stage not started.</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {groups.map(([k, rows], gi) => (
        <Reveal key={k} delay={gi * 70}>
          <div className="space-y-2">
            <h3 className="text-xl text-neutral-300 font-bold uppercase tracking-wider">
              Group <span className="text-accent">{k}</span>
            </h3>
            
            <div className="border border-line bg-surface rounded-sm overflow-hidden">
              <Table className="min-w-[460px] text-center">
                <TableHeader>
                  <TableRow>
                    {['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts'].map((h, i) => (
                      <TableHead key={h} className={i === 1 ? 'text-left pl-3' : 'text-center'}>
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={r.t} className={i < 2 ? 'shadow-[inset_3px_0_#f7d000]' : ''}>
                      <TableCell className="font-display font-bold text-muted">{i + 1}</TableCell>
                      <TableCell className="text-left font-semibold text-white pl-3">{r.t}</TableCell>
                      <TableCell>{r.p}</TableCell>
                      <TableCell>{r.w}</TableCell>
                      <TableCell>{r.d}</TableCell>
                      <TableCell>{r.l}</TableCell>
                      <TableCell>{r.gd > 0 ? `+${r.gd}` : r.gd}</TableCell>
                      <TableCell className="font-display text-xl font-extrabold text-accent">
                        {r.pts}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
