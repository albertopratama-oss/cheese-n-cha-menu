import React,{useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';import{createClient}from'@supabase/supabase-js';import{Plus,Minus,X,Lock,LogOut,Pencil,Trash2,ShoppingBag}from'lucide-react';import'./style.css';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY,wa=import.meta.env.VITE_WHATSAPP_NUMBER||'6282221277210',sb=url&&key?createClient(url,key):null;
const money=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0);
function App(){const[items,S]=useState([]),[cat,C]=useState('Semua'),[cart,Q]=useState({}),[err,E]=useState(''),[busy,B]=useState(true),[session,SS]=useState(null),[admin,SA]=useState(false),[open,O]=useState(location.pathname==='/admin'),[email,EM]=useState(''),[pass,PA]=useState(''),[msg,M]=useState(''),[edit,ED]=useState(null),[photo,PH]=useState(null),[form,F]=useState({name:'',category:'Minuman',price:'25000',description:'',image_url:'',is_available:true});
async function load(){if(!sb){E('Konfigurasi Supabase belum diisi.');B(false);return}B(true);let{data,error}=await sb.from('products').select('*').order('id');E(error?.message||'');S(data||[]);B(false)}
async function check(s){if(!sb||!s){SA(false);return}let{data}=await sb.from('admins').select('user_id').eq('user_id',s.user.id).maybeSingle();SA(!!data)}
useEffect(()=>{load();if(!sb)return;sb.auth.getSession().then(({data})=>{SS(data.session);check(data.session)});let{data:{subscription}}=sb.auth.onAuthStateChange((_,s)=>{SS(s);check(s)});return()=>subscription.unsubscribe()},[]);
let shown=useMemo(()=>items.filter(p=>p.is_available&&(cat==='Semua'||p.category===cat)),[items,cat]),count=Object.values(cart).reduce((a,b)=>a+b,0),total=items.reduce((a,p)=>a+(cart[p.id]||0)*p.price,0);
function qty(id,d){Q(old=>{let n={...old,[id]:Math.max(0,(old[id]||0)+d)};if(!n[id])delete n[id];return n})}
function checkout() {
  let lines = items
    .filter(p => cart[p.id])
    .map(p => `${p.name} x${cart[p.id]} = ${money(p.price * cart[p.id])}`);

  if (!lines.length) return;

  let nama = prompt('Masukkan nama penerima pesanan:');
  if (!nama || !nama.trim()) {
    alert('Nama penerima wajib diisi.');
    return;
  }

  let alamat = prompt('Masukkan alamat lengkap pengantaran:');
  if (!alamat || !alamat.trim()) {
    alert('Alamat pengantaran wajib diisi.');
    return;
  }

  let message =
    'Halo CHEESE N’ CHA, saya ingin memesan:\n' +
    lines.join('\n') +
    '\n\nNama penerima: ' + nama.trim() +
    '\nAlamat pengantaran: ' + alamat.trim() +
    '\n\nTotal: ' + money(total);

  window.open(
    `https://wa.me/${wa}?text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener'
  );
}
async function login(e){e.preventDefault();B(true);let{error}=await sb.auth.signInWithPassword({email,password:pass});M(error?.message||'Login dikirim.');B(false)}
function fresh(){ED(null);PH(null);F({name:'',category:'Minuman',price:'25000',description:'',image_url:'',is_available:true})}
function editItem(p){ED(p.id);PH(null);F({name:p.name,category:p.category,price:String(p.price),description:p.description||'',image_url:p.image_url||'',is_available:p.is_available})}
async function save(e){e.preventDefault();B(true);let image_url=form.image_url||null;if(photo){let path=Date.now()+'-'+photo.name.replace(/[^a-zA-Z0-9._-]/g,'_');let{error}=await sb.storage.from('product-images').upload(path,photo);if(error){M(error.message);B(false);return}image_url=sb.storage.from('product-images').getPublicUrl(path).data.publicUrl}
let payload={...form,name:form.name.trim(),price:Number(form.price),image_url};delete payload.image_url;payload.image_url=image_url;let r=edit?await sb.from('products').update(payload).eq('id',edit):await sb.from('products').insert(payload);M(r.error?.message||'Produk tersimpan.');if(!r.error){fresh();await load()}B(false)}
async function del(id){if(confirm('Hapus produk ini?')){let{error}=await sb.from('products').delete().eq('id',id);M(error?.message||'Produk dihapus.');load()}}
return <div className="app"><header><div className="brand">CHEESE N’ CHA</div><small>FRESH TEA • CHICKEN • CHEESY</small><button className="adminlink" onClick={()=>{O(true);history.pushState({},'','/admin')}}>Admin</button></header><main><div className="intro"><span>FRESHLY MADE FOR YOU</span><h1>Menu Favorit</h1><p>Pilih menu lalu pesan melalui WhatsApp.</p></div><nav>{['Semua','Minuman','Makanan'].map(x=><button className={cat===x?'selected':''} onClick={()=>C(x)}>{x}</button>)}</nav>{err&&<p className="error">{err}</p>}{busy?<p className="empty">Memuat menu…</p>:<section className="grid">{shown.map(p=><article className="card" key={p.id}><div className="photo">{p.image_url?<img src={p.image_url} alt={p.name}/>:<b>{p.category==='Minuman'?'🥤':'🍗'}</b>}</div><div className="details"><h2>{p.name}</h2>{p.description&&<p>{p.description}</p>}<strong>{money(p.price)}</strong><div className="qty">{cart[p.id]?<><button onClick={()=>qty(p.id,-1)}><Minus size={15}/></button>{cart[p.id]}<button onClick={()=>qty(p.id,1)}><Plus size={15}/></button></>:<button onClick={()=>qty(p.id,1)}><Plus size={15}/> Tambah</button>}</div></div></article>)}</section>}</main><footer><span><ShoppingBag size={17}/> Keranjang: {count} item · <b>{money(total)}</b></span><button disabled={!count} onClick={checkout}>Pesan via WhatsApp</button></footer>
{open&&<div className="shade" onClick={e=>{if(e.target===e.currentTarget){O(false);history.pushState({},'','/')}}}><section className="modal"><div className="modalhead"><div><small>CHEESE N’ CHA</small><h2>Dashboard Admin</h2></div><button className="close" onClick={()=>{O(false);history.pushState({},'','/')}}><X/></button></div>{!session?<form onSubmit={login} className="login"><p>Login dengan akun admin Supabase.</p><label>Email<input type="email" value={email} onChange={e=>EM(e.target.value)} required/></label><label>Password<input type="password" value={pass} onChange={e=>PA(e.target.value)} required/></label><button disabled={busy}><Lock size={15}/> Login Admin</button></form>:!admin?<p className="error">Akun ini belum terdaftar sebagai admin pada tabel public.admins. <button onClick={()=>sb.auth.signOut()}>Keluar</button></p>:<><div className="bar"><p>Atur menu pelanggan.</p><button onClick={()=>sb.auth.signOut()}><LogOut size={15}/> Keluar</button></div><form className="editform" onSubmit={save}><h3>{edit?'Edit produk':'Tambah produk'}</h3><label>Nama<input value={form.name} onChange={e=>F({...form,name:e.target.value})} required/></label><div className="twocol"><label>Kategori<select value={form.category} onChange={e=>F({...form,category:e.target.value})}><option>Minuman</option><option>Makanan</option></select></label><label>Harga<input type="number" min="0" value={form.price} onChange={e=>F({...form,price:e.target.value})} required/></label></div><label>Deskripsi<input value={form.description} onChange={e=>F({...form,description:e.target.value})}/></label><label>Foto produk<input type="file" accept="image/*" onChange={e=>PH(e.target.files?.[0])}/><small>Foto baru akan diunggah ke Supabase Storage.</small></label><label className="check"><input type="checkbox" checked={form.is_available} onChange={e=>F({...form,is_available:e.target.checked})}/> Tersedia</label><div className="actions"><button type="button" onClick={fresh}>Bersihkan</button><button disabled={busy}>Simpan produk</button></div></form><h3>Produk ({items.length})</h3>{items.map(p=><div className="row" key={p.id}><span>{p.name} · {money(p.price)}</span><button onClick={()=>editItem(p)}><Pencil size={15}/></button><button onClick={()=>del(p.id)}><Trash2 size={15}/></button></div>)}</>}{msg&&<p className="notice">{msg}</p>}</section></div>}</div>}
createRoot(document.getElementById('root')).render(<App/>);
