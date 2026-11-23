import {requireAdmin} from '@/lib/auth'
import {savePost,deletePost} from '../../actions'
const Form=({p})=><form action={savePost} className="panel grid gap-3 sm:grid-cols-2"><input type="hidden" name="id" value={p?.id||''}/>
  <div><label className="lbl">Title</label><input name="title" defaultValue={p?.title} required className="input"/></div><div><label className="lbl">Slug</label><input name="slug" defaultValue={p?.slug} required pattern="[a-z0-9-]+" className="input"/></div>
  <div className="sm:col-span-2"><label className="lbl">Body (blank line = new paragraph)</label><textarea name="body" defaultValue={p?.body} required rows={6} className="input"/></div>
  <div><label className="lbl">Cover image</label><input type="file" name="cover" accept="image/*" className="input"/></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={p?.published}/>Published</label><div className="flex gap-2"><button className="btn btn-sm">{p?'Save':'Create post'}</button></div></form>
export default async function Posts(){
  const {sb}=await requireAdmin();const {data}=await sb.from('posts').select('*').order('created_at',{ascending:false})
  return <><h1 className="mb-6 text-5xl font-extrabold">News</h1><h3 className="mb-2 text-2xl text-muted">New post</h3><Form/>
    <div className="mt-8 space-y-4">{(data||[]).map(p=><details key={p.id} className="border border-line"><summary className="cursor-pointer px-4 py-3 font-display text-lg font-bold uppercase">{p.title} <span className="badge ml-2">{p.published?'published':'draft'}</span></summary><div className="space-y-2 p-4"><Form p={p}/><form action={deletePost}><input type="hidden" name="id" value={p.id}/><button className="btn btn-ghost btn-sm text-live">Delete</button></form></div></details>)}</div></>
}
