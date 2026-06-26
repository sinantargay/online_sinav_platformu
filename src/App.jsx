import React, { useMemo, useState } from 'react';
import questions from './data/questions.json';
import { createAcademicReport } from './report.js';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

export default function App() {
  const [page, setPage] = useState('home');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [user, setUser] = useState(() => load('photon_user', null));
  const [settings, setSettings] = useState(() => load('photon_settings', {
    paymentTitle: 'Ödeme / IBAN Bilgileri',
    accountHolder: '',
    bankName: '',
    iban: '',
    paymentText: 'IBAN ve ödeme açıklaması yönetici panelinden girilecek.'
  }));

  const examQuestions = useMemo(() => questions.slice(0, 50), []);
  const current = examQuestions[index];
  const correct = examQuestions.filter(q => answers[q.id] === q.answer).length;
  const wrongList = examQuestions.filter(q => answers[q.id] !== q.answer);
  const success = Math.round((correct / examQuestions.length) * 100);

  const Header = () => <nav className="nav"><b>PHOTON</b><span>{user ? `${user.name} · ${user.role}` : 'Fotoğraf Yüksek Lisans Hazırlık'}</span><div className="navActions"><button className="small ghost" onClick={() => setPage('home')}>Ana Sayfa</button>{user ? <button className="small ghost" onClick={logout}>Çıkış</button> : <button className="small" onClick={() => setPage('auth')}>Giriş / Üyelik</button>}</div></nav>;
  const startExam = () => { setAnswers({}); setIndex(0); setPage('exam'); };
  const openExam = () => { user ? startExam() : setPage('auth'); };
  const downloadPdf = () => createAcademicReport({ examQuestions, answers, user });

  function logout(){ localStorage.removeItem('photon_user'); setUser(null); setPage('home'); }
  function guest(){ const u={name:'Misafir Kullanıcı', email:'', role:'misafir'}; setUser(u); localStorage.setItem('photon_user', JSON.stringify(u)); setPage('home'); }
  function login(e){ e.preventDefault(); const f=new FormData(e.currentTarget); const role=f.get('adminCode')==='PHOTON2026'?'yönetici':'üye'; const u={name:f.get('name')||'Sinan Targay', email:f.get('email')||'', role}; setUser(u); if(f.get('remember')) localStorage.setItem('photon_user', JSON.stringify(u)); setPage('home'); }
  function saveSettings(e){ e.preventDefault(); const f=new FormData(e.currentTarget); const next={paymentTitle:f.get('paymentTitle'), accountHolder:f.get('accountHolder'), bankName:f.get('bankName'), iban:f.get('iban'), paymentText:f.get('paymentText')}; setSettings(next); localStorage.setItem('photon_settings', JSON.stringify(next)); alert('Ödeme ve IBAN bilgileri kaydedildi.'); }

  if(page==='auth') return <main className="shell"><Header/><section className="panel"><h1>Üyelik Sistemi</h1><p className="lead">50 soruluk tam deneme sınavına girmek ve raporunu almak için üyelik girişi yap. Ödeme bilgileri aşağıda yer alır.</p><form className="form" onSubmit={login}><input name="name" placeholder="Ad Soyad" defaultValue="Sinan Targay"/><input name="email" placeholder="E-posta"/><input name="password" type="password" placeholder="Şifre"/><input name="adminCode" placeholder="Yönetici kodu (varsa)"/><label className="check"><input name="remember" type="checkbox" defaultChecked/> Beni hatırla</label><button>Giriş / Kayıt</button></form><button className="ghost" onClick={guest}>Misafir Girişi</button><div className="paymentBox"><h3>{settings.paymentTitle}</h3><p><b>Hesap Sahibi:</b> {settings.accountHolder || 'Henüz girilmedi'}</p><p><b>Banka:</b> {settings.bankName || 'Henüz girilmedi'}</p><p><b>IBAN:</b> {settings.iban || 'Henüz girilmedi'}</p><p>{settings.paymentText}</p></div><p className="hint">Demo yönetici kodu: PHOTON2026</p></section></main>;

  if(page==='home') return <main className="shell"><Header/><section className="hero"><p className="badge">Marmara GSF Fotoğraf YL</p><h1>Akademik kaynaklı online sınav platformu</h1><p className="lead">Akademik kaynaklı sorular, açıklamalı cevaplar ve PDF raporlarla hazırlığını ölç. Ücretsiz dene, tam erişim için üyeliğini başlat.</p><button className="examCard" onClick={openExam}><span className="examKicker">50 Soruluk Tam Deneme</span><strong>Marmara Fotoğraf YL Sınav Provası</strong><em>Gerçek sınav mantığında hazırlandı. Hemen gir, sınav başlıyor.</em></button>{!user && <div className="paymentBox"><h3>Üyelik Girişi ve Tam Erişim</h3><p>Bu sınav alanına giriş için üyelik oluşturabilir veya misafir olarak deneyebilirsin. Tam erişim ve ödeme bilgileri üyelik ekranında gösterilir.</p><button onClick={() => setPage('auth')}>Üyelik / Ödeme Bilgileri</button></div>}<div className="stats"><div><strong>{user?'Aktif':'Kapalı'}</strong><span>Oturum</span></div><div><strong>PDF</strong><span>Rapor</span></div><div><strong>Kaynaklı</strong><span>Soru Havuzu</span></div></div><div className="paymentBox"><h3>{settings.paymentTitle}</h3><p><b>Hesap Sahibi:</b> {settings.accountHolder || 'Henüz girilmedi'}</p><p><b>Banka:</b> {settings.bankName || 'Henüz girilmedi'}</p><p><b>IBAN:</b> {settings.iban || 'Henüz girilmedi'}</p><p>{settings.paymentText}</p></div><div className="actions"><button onClick={openExam}>Hemen Gir</button><button className="ghost" onClick={()=>setPage('auth')}>Üyelik / Giriş</button><button className="ghost" onClick={()=>setPage('admin')}>Yönetici Paneli</button></div></section></main>;

  if(page==='exam') return <main className="shell"><Header/><section className="panel"><p className="badge">Soru {index+1} / {examQuestions.length} · {current.category} · {current.difficulty}</p><div className="progress"><span style={{width:`${((index+1)/examQuestions.length)*100}%`}} /></div><h2>{current.question}</h2><div className="options">{Object.entries(current.choices).map(([key,value])=><button key={key} className={answers[current.id]===key?'selected':''} onClick={()=>setAnswers({...answers,[current.id]:key})}><b>{key})</b> {value}</button>)}</div><div className="actions"><button className="ghost" disabled={index===0} onClick={()=>setIndex(index-1)}>Geri</button>{index<examQuestions.length-1?<button onClick={()=>setIndex(index+1)}>İleri</button>:<button onClick={()=>setPage('result')}>Sonucu Gör</button>}</div></section></main>;

  if(page==='result') return <main className="shell"><Header/><section className="panel"><h1>Sonuç</h1><div className="stats"><div><strong>{correct}</strong><span>Doğru</span></div><div><strong>{examQuestions.length-correct}</strong><span>Yanlış/Boş</span></div><div><strong>%{success}</strong><span>Başarı</span></div></div><div className="actions"><button onClick={downloadPdf}>Detaylı Akademik PDF Rapor</button><button className="ghost" onClick={startExam}>Tekrar Çöz</button></div><h2>Yanlış / Boş Sorular</h2>{wrongList.map(q=><article className="wrong" key={q.id}><h3>{q.question}</h3><p><b>Doğru cevap:</b> {q.answer}) {q.choices[q.answer]}</p><p>{q.explanation}</p><p className="source"><b>Kaynak:</b> {q.sources.join(', ')}</p></article>)}</section></main>;

  if(!user || user.role!=='yönetici') return <main className="shell"><Header/><section className="panel"><h1>Yönetici Paneli</h1><p>Bu alan sadece yönetici girişi ile açılır.</p><button onClick={()=>setPage('auth')}>Yönetici Girişi</button></section></main>;

  return <main className="shell"><Header/><section className="panel"><h1>Yönetici Paneli</h1><div className="adminGrid"><div className="adminCard"><h2>Sistem Özeti</h2><p>Toplam soru: {questions.length}</p><p>Aktif kullanıcı: {user.name}</p><p>Rol: Yönetici</p></div><div className="adminCard"><h2>Ödeme / IBAN Bilgi Alanı</h2><form className="form" onSubmit={saveSettings}><input name="paymentTitle" placeholder="Başlık" defaultValue={settings.paymentTitle}/><input name="accountHolder" placeholder="Hesap sahibi" defaultValue={settings.accountHolder}/><input name="bankName" placeholder="Banka adı" defaultValue={settings.bankName}/><input name="iban" placeholder="IBAN" defaultValue={settings.iban}/><textarea name="paymentText" placeholder="Ödeme açıklaması" defaultValue={settings.paymentText}/><button>Bilgileri Kaydet</button></form></div><div className="adminCard"><h2>Soru Havuzu</h2><pre>{JSON.stringify(questions[0],null,2)}</pre></div></div></section></main>;
}
