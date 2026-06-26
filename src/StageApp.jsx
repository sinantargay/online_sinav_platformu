import React,{useEffect,useState}from'react';
import baseQuestions from './data/questions.json';
import techQuestions from './data/techniqueExposurePack.js';
import lightQuestions from './data/techniqueLightColorPack.js';
import lensSensorQuestions from './data/techniqueLensSensorPack.js';
import analogQuestions from './data/techniqueAnalogFilmPack.js';
import historyQuestions from './data/photoHistoryPack.js';
import theoryQuestions from './data/theoryMovementsPack.js';
import generalCultureQuestions from './data/generalCultureArtsPack.js';
import photographerQuestions from './data/photographersBooksPack.js';
import interviewQuestions from './data/interviewPortfolioPack.js';
import contemporaryQuestions from './data/contemporaryArtInstitutionsPack.js';
import digitalWorkflowQuestions from './data/digitalWorkflowPrintPack.js';
import documentaryQuestions from './data/documentaryEthicsPack.js';
import compositionQuestions from './data/compositionSemioticsPack.js';
import currentVerifiedQuestions from './data/currentVerifiedPack.js';
import './style.css';

const questions=[...baseQuestions,...techQuestions,...lightQuestions,...lensSensorQuestions,...analogQuestions,...historyQuestions,...theoryQuestions,...generalCultureQuestions,...photographerQuestions,...interviewQuestions,...contemporaryQuestions,...digitalWorkflowQuestions,...documentaryQuestions,...compositionQuestions,...currentVerifiedQuestions];
const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const sh=a=>[...a].sort(()=>Math.random()-.5);
const ST={easy:['Kolay Seviye Temel Tarama','Temel bilgi ve güven kazanma','Kolay'],medium:['Orta Seviye Akademik Kavrama','Kavram, sanatçı ve eser ilişkisi','Orta'],hard:['Zor Seviye Yüksek Lisans Provası','Seçici, kuramsal ve teknik sorular','Zor'],final:['Gerçek Sınav Kalibresi Final','30 dakika süreli, editör seçimiyle güçlendirilmiş final','Final']};
const payDefault={paymentTitle:'Ödeme / IBAN Bilgileri',accountHolder:'',bankName:'',iban:'',paymentText:'Kayıtlı ödeme bilgileri yönetici panelinden güncellenir. Açıklama kısmına ad soyad yazınız.'};
const isFinalQ=q=>q.quality==='final-caliber'||q.difficulty==='Final'||(q.difficulty==='Zor'&&String(q.sourceType||'').includes('Çıkmış'))||String(q.questionType||'').includes('Final');
function weak(p){return[...new Set(Object.values(p||{}).flatMap(x=>x.weak||[]))].slice(0,6)}
function exam(mode,p,archiveIds=[]){
  let pool=mode==='final'?questions.filter(isFinalQ):questions.filter(q=>q.difficulty===ST[mode][2]);
  if(mode==='final'&&pool.length<50)pool=[...pool,...questions.filter(q=>q.difficulty==='Zor')];
  if(pool.length<20)pool=questions;
  let u=new Set(),s=[];
  if(mode==='final'){
    const archiveSet=new Set(archiveIds);
    sh(questions.filter(q=>archiveSet.has(q.id))).slice(0,20).forEach(q=>{if(!u.has(q.id)){u.add(q.id);s.push(q)}});
    weak(p).forEach(c=>sh(pool.filter(q=>q.category===c)).slice(0,5).forEach(q=>{if(!u.has(q.id)){u.add(q.id);s.push(q)}}));
    sh(pool.filter(q=>q.quality==='final-caliber'||q.difficulty==='Final')).slice(0,25).forEach(q=>{if(!u.has(q.id)){u.add(q.id);s.push(q)}})
  }
  const plan=mode==='final'?[['Görsel Okuryazarlık',8],['Fotoğraf Tekniği',8],['Fotoğraf Tarihi',7],['Fotoğraf Akımları',7],['Fotoğraf Sanatçıları',5],['Genel Kültür',5],['Mülakat ve Sanatsal Vizyon',3],['Güncel Sanat',4],['Güncel Fotoğraf',4]]:[['Fotoğraf Tekniği',10],['Görsel Okuryazarlık',6],['Fotoğraf Tarihi',8],['Fotoğraf Akımları',7],['Fotoğraf Sanatçıları',5],['Genel Kültür',11],['Mülakat ve Sanatsal Vizyon',3],['Güncel Sanat',3],['Güncel Fotoğraf',3]];
  plan.forEach(([c,n])=>sh(pool.filter(q=>q.category===c)).slice(0,n).forEach(q=>{if(!u.has(q.id)){u.add(q.id);s.push(q)}}));
  sh(pool).forEach(q=>{if(s.length<50&&!u.has(q.id)){u.add(q.id);s.push(q)}});
  return sh(s).slice(0,Math.min(50,s.length));
}
function cats(qs,ans){let m={};qs.forEach(q=>{let c=q.category||'Diğer';m[c]??={t:0,d:0};m[c].t++;if(ans[q.id]===q.answer)m[c].d++});return Object.entries(m).map(([c,x])=>({c,...x,r:Math.round(x.d/x.t*100)})).sort((a,b)=>a.r-b.r)}
const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

export default function StageApp(){
  const[page,setPage]=useState('home'),[user,setUser]=useState(()=>load('photon_user',null)),[mode,setMode]=useState('easy'),[idx,setIdx]=useState(0),[ans,setAns]=useState({}),[prog,setProg]=useState(()=>load('photon_progress',{})),[archive,setArchive]=useState(()=>load('photon_final_archive',[])),[notes,setNotes]=useState(()=>load('photon_final_notes',{})),[qs,setQs]=useState(()=>exam('easy',{})),[timeLeft,setTimeLeft]=useState(0),[settings,setSettings]=useState(()=>load('photon_settings',payDefault));
  const cur=qs[idx]||{},ok=qs.filter(q=>ans[q.id]===q.answer).length,rate=qs.length?Math.round(ok/qs.length*100):0,isG=user?.role==='misafir',isAdmin=user?.role==='yönetici',st=ST[mode],cs=cats(qs,ans),wrong=qs.filter(q=>ans[q.id]!==q.answer),archiveSet=new Set(archive);
  useEffect(()=>{if(page!=='exam'||mode!=='final')return;let t=setInterval(()=>setTimeLeft(x=>Math.max(0,x-1)),1000);return()=>clearInterval(t)},[page,mode]);
  useEffect(()=>{if(page==='exam'&&mode==='final'&&timeLeft===0)finish(true)},[timeLeft,page,mode]);
  function start(m){if(!user)return setPage('auth');setMode(m);setQs(exam(m,prog,archive));setAns({});setIdx(0);setTimeLeft(m==='final'?1800:0);setPage('exam')}
  function finish(timeout=false){let w=cs.filter(x=>x.r<70).map(x=>x.c),p={...prog,[mode]:{rate,ok,total:qs.length,weak:w,date:new Date().toISOString(),timeout}};setProg(p);save('photon_progress',p);setPage('result')}
  function login(e){e.preventDefault();let f=new FormData(e.currentTarget),u={name:f.get('name')||'Üye',email:f.get('email')||'',role:f.get('adminCode')==='PHOTON2026'?'yönetici':'üye'};setUser(u);save('photon_user',u);setPage('home')}
  function guest(){let u={name:'Misafir Kullanıcı',role:'misafir'};setUser(u);save('photon_user',u);setPage('home')}
  function out(){localStorage.removeItem('photon_user');setUser(null);setPage('home')}
  function saveSettings(e){e.preventDefault();let f=new FormData(e.currentTarget),s={paymentTitle:f.get('paymentTitle')||payDefault.paymentTitle,accountHolder:f.get('accountHolder')||'',bankName:f.get('bankName')||'',iban:f.get('iban')||'',paymentText:f.get('paymentText')||payDefault.paymentText};setSettings(s);save('photon_settings',s);setPage('auth')}
  function toggleArchive(q){if(!q?.id||!isAdmin)return;const next=archiveSet.has(q.id)?archive.filter(id=>id!==q.id):[...archive,q.id];setArchive(next);save('photon_final_archive',next)}
  function saveNote(id,value){if(!isAdmin)return;const n={...notes,[id]:{note:value,updatedAt:new Date().toLocaleString('tr-TR')}};setNotes(n);save('photon_final_notes',n)}
  const Pay=()=> <article className='wrong'><h3>{settings.paymentTitle}</h3><p>{settings.paymentText}</p><p><b>Hesap Sahibi:</b> {settings.accountHolder||'Yönetici panelinden girilecek'}</p><p><b>Banka:</b> {settings.bankName||'Yönetici panelinden girilecek'}</p><p><b>IBAN:</b> {settings.iban||'Yönetici panelinden girilecek'}</p></article>;
  const H=()=> <nav className='nav'><b>PHOTON</b><span>{user?`${user.name} · ${user.role}`:'Fotoğraf YL Hazırlık'}</span><div className='navActions'><button className='small ghost' onClick={()=>setPage('home')}>Ana Sayfa</button>{isAdmin&&<button className='small ghost' onClick={()=>setPage('admin')}>Yönetici</button>}{user?<button className='small ghost' onClick={out}>Çıkış</button>:<button className='small' onClick={()=>setPage('auth')}>Giriş / Üyelik</button>}</div></nav>;
  const finalCandidates=questions.filter(q=>isFinalQ(q)||q.difficulty==='Zor'||q.category==='Güncel Sanat'||q.category==='Güncel Fotoğraf');
  if(page==='auth')return <main className='shell'><H/><section className='panel'><h1>Üyelik Sistemi</h1><p className='lead'>Misafir ilk 5 soruyu çözer. 4 aşamalı sınav sistemi üyelikle açılır.</p><form className='form' onSubmit={login}><input name='name' placeholder='Ad Soyad'/><input name='email' placeholder='E-posta'/><input name='password' type='password' placeholder='Şifre'/><input name='adminCode' placeholder='Yönetici kodu'/><button>Giriş / Kayıt</button></form><button className='ghost' onClick={guest}>Misafir Girişi</button><Pay/></section></main>;
  if(page==='admin')return <main className='shell'><H/><section className='panel'><h1>Yönetici Paneli</h1><p>Toplam soru: {questions.length}</p><p>Güncel doğrulanmış soru paketi: {currentVerifiedQuestions.length}</p><p>Gerçek final sınavına eklenen editör seçimi: {archive.length}</p><form className='form' onSubmit={saveSettings}><input name='paymentTitle' defaultValue={settings.paymentTitle} placeholder='Ödeme başlığı'/><input name='accountHolder' defaultValue={settings.accountHolder} placeholder='Hesap sahibi'/><input name='bankName' defaultValue={settings.bankName} placeholder='Banka adı'/><input name='iban' defaultValue={settings.iban} placeholder='IBAN'/><textarea name='paymentText' defaultValue={settings.paymentText} placeholder='Ödeme açıklaması'/><button>Ödeme Bilgilerini Kaydet</button></form><h2>Final Arşivi Editörü</h2><p className='lead'>Buradan seçilen sorular kullanıcıya ayrı editör ekranı olarak görünmez; doğrudan “Gerçek Sınav Kalibresi Final” havuzuna öncelikli olarak dahil edilir.</p><div className='actions'><button onClick={()=>start('final')}>Seçilmişlerle Finali Test Et</button><button className='ghost' onClick={()=>{setArchive([]);save('photon_final_archive',[])}}>Final Seçimini Temizle</button></div>{finalCandidates.slice(0,160).map(q=><article className='wrong' key={q.id}><h3>{q.question}</h3><p><b>Konu:</b> {q.category} · <b>Zorluk:</b> {q.difficulty} · <b>Olasılık:</b> {'★'.repeat(q.probability||3)}</p><p>{q.explanation}</p>{q.source&&<p><b>Kaynak:</b> {q.source}</p>}<textarea defaultValue={notes[q.id]?.note||''} placeholder='Yönetici notu / neden finalde?' onBlur={e=>saveNote(q.id,e.target.value)}/><button className={archiveSet.has(q.id)?'danger':'ghost'} onClick={()=>toggleArchive(q)}>{archiveSet.has(q.id)?'Final Seçiminden Çıkar':'Gerçek Finale Ekle'}</button></article>)}</section></main>;
  if(page==='home')return <main className='shell'><H/><section className='hero'><p className='badge'>Marmara GSF Fotoğraf YL</p><h1>4 Aşamalı Akıllı Sınav Sistemi</h1><p className='lead'>Kolaydan zora öğreten yapı: temel tarama, akademik kavrama, zor prova ve yönetici editör seçimiyle güçlendirilmiş gerçek sınav kalibresi final.</p><div className='adminGrid'>{Object.keys(ST).map(k=><button key={k} className='examCard' onClick={()=>start(k)}><span className='examKicker'>{ST[k][1]}</span><strong>{ST[k][0]}</strong><em>{k==='final'?'Yönetici tarafından seçilen Final Arşivi soruları bu sınava öncelikli girer. Süre: 30 dakika.':'Her girişte yeni sıralama ve dengeli dağılım.'}</em>{prog[k]&&<small>Son sonuç: %{prog[k].rate}</small>}</button>)}</div><div className='stats'><div><strong>{questions.length}</strong><span>Soru</span></div><div><strong>{archive.length}</strong><span>Editör Final Seçimi</span></div><div><strong>Kalibre</strong><span>Seçici Havuz</span></div></div></section></main>;
  if(page==='exam')return <main className='shell'><H/><section className='panel'><p className='badge'>{st[0]} · Soru {idx+1}/{qs.length} · {cur.category} · {cur.difficulty} {mode==='final'?'· Süre '+fmt(timeLeft):''}</p>{mode==='final'&&<p className='hint'>Final sınavı, final kalibresi sorular ve yönetici tarafından seçilmiş kritik sorularla oluşturulur. Süre 30 dakikadır.</p>}{isG&&<p className='hint'>Misafir hakkı {Math.min(idx+1,5)}/5. Devamı için üyelik gerekir.</p>}<div className='progress'><span style={{width:`${(idx+1)/qs.length*100}%`}}/></div><h2>{cur.question}</h2><div className='options'>{Object.entries(cur.choices||{}).map(([k,v])=><button key={k} className={ans[cur.id]===k?'selected':''} onClick={()=>setAns({...ans,[cur.id]:k})}><b>{k})</b> {v}</button>)}</div><article className='wrong'><p><b>Kısa gerekçe:</b> {cur.explanation}</p>{cur.source&&<p><b>Kaynak:</b> {cur.source}</p>}</article><div className='actions'><button className='ghost' disabled={!idx} onClick={()=>setIdx(idx-1)}>Geri</button>{idx<qs.length-1?<button onClick={()=>isG&&idx>=4?setPage('auth'):setIdx(idx+1)}>{isG&&idx>=4?'Üyelikle Devam Et':'İleri'}</button>:<button onClick={()=>finish(false)}>Sonucu Gör</button>}</div></section></main>;
  if(page==='result')return <main className='shell'><H/><section className='panel'><h1>{st[0]} Sonucu</h1>{prog[mode]?.timeout&&<p className='hint'>Süre dolduğu için sınav otomatik tamamlandı.</p>}<div className='stats'><div><strong>{ok}</strong><span>Doğru</span></div><div><strong>{qs.length-ok}</strong><span>Yanlış/Boş</span></div><div><strong>%{rate}</strong><span>Başarı</span></div></div><button onClick={()=>window.print()}>PDF / Yazdır</button><h2>Eksik Alan Analizi</h2>{cs.map(x=><article className='wrong' key={x.c}><h3>{x.c}</h3><p>{x.d}/{x.t} doğru · %{x.r}</p><p>{x.r<70?'Bu konu final sınavında tekrar sorulacak.':'Bu alanda temel performans iyi.'}</p></article>)}<div className='actions'><button onClick={()=>start(mode)}>Tekrar Çöz</button><button onClick={()=>start(mode==='easy'?'medium':mode==='medium'?'hard':mode==='hard'?'final':'final')}>Sonraki Aşama</button></div><h2>Yanlış / Boş Sorular</h2>{wrong.map(q=><article className='wrong' key={q.id}><h3>{q.question}</h3><p><b>Doğru:</b> {q.answer}) {q.choices[q.answer]}</p><p>{q.explanation}</p></article>)}</section></main>;
  return null;
}
