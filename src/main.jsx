import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import './style.css';
import questions from './data/questions.json';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

function App() {
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
  const examQuestions = useMemo(() => questions.slice(0, 10), []);
  const current = examQuestions[index];
  const correct = examQuestions.filter(q => answers[q.id] === q.answer).length;
  const wrongList = examQuestions.filter(q => answers[q.id] !== q.answer);
  const success = Math.round((correct / examQuestions.length) * 100);

  const Header = () => <nav className="nav"><b>PHOTON</b><span>{user ? `${user.name} · ${user.role}` : 'Fotoğraf Yüksek Lisans Hazırlık'}</span><div className="navActions"><button className="small ghost" onClick={() => setPage('home')}>Ana Sayfa</button>{user ? <button className="small ghost" onClick={logout}>Çıkış</button> : <button className="small" onClick={() => setPage('auth')}>Giriş / Üyelik</button>}</div></nav>;
  const startExam = () => { setAnswers({}); setIndex(0); setPage('exam'); };
  function logout(){ localStorage.removeItem('photon_user'); setUser(null); setPage('home'); }
  function guest(){ const u={name:'Misafir Kullanıcı', email:'', role:'misafir'}; setUser(u); localStorage.setItem('photon_user', JSON.stringify(u)); setPage('home'); }
  function login(e){ e.preventDefault(); const f=new FormData(e.currentTarget); const role=f.get('adminCode')==='PHOTON2026'?'yönetici':'üye'; const u={name:f.get('name')||'Sinan Targay', email:f.get('email')||'', role}; setUser(u); if(f.get('remember')) localStorage.setItem('photon_user', JSON.stringify(u)); setPage('home'); }
  function saveSettings(e){ e.preventDefault(); const f=new FormData(e.currentTarget); const next={paymentTitle:f.get('paymentTitle'), accountHolder:f.get('accountHolder'), bankName:f.get('bankName'), iban:f.get('iban'), paymentText:f.get('paymentText')}; setSettings(next); localStorage.setItem('photon_settings', JSON.stringify(next)); alert('Ödeme ve IBAN bilgileri kaydedildi.'); }

  const downloadPdf = () => {
    const doc = new jsPDF(); const reportNo = `PH-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    doc.setFillColor(15,23,42); doc.rect(0,0,210,42,'F'); doc.setTextColor(255,255,255); doc.setFontSize(22); doc.text('PHOTON',14,18); doc.setFontSize(12); doc.text('Akademik Performans Raporu',14,29);
    doc.setTextColor(20,20,20); doc.setFontSize(11); doc.text(`Rapor No: ${reportNo}`,14,52); doc.text(`Aday: ${user?.name || 'Misafir Kullanıcı'}`,14,62); doc.text(`E-posta: ${user?.email || '-'}`,14,72); doc.text(`Tarih: ${new Date().toLocaleString('tr-TR')}`,14,82);
    doc.setFontSize(16); doc.text('Genel Sonuç',14,104); doc.setFontSize(12); doc.text(`Toplam Soru: ${examQuestions.length}`,14,118); doc.text(`Doğru: ${correct}`,14,128); doc.text(`Yanlış/Boş: ${examQuestions.length-correct}`,14,138); doc.text(`Başarı: %${success}`,14,148);
    doc.setFillColor(37,99,235); doc.rect(14,156,Math.max(5,success*1.4),8,'F'); doc.setDrawColor(210); doc.rect(14,156,140,8);
    doc.setFontSize(16); doc.text('Yanlış / Boş Sorular',14,182); let y=194;
    wrongList.forEach((q,i)=>{ if(y>260){doc.addPage(); y=20;} doc.setFontSize(10); doc.text(`${i+1}. ${q.question.substring(0,95)}`,14,y); y+=8; doc.text(`Doğru Cevap: ${q.answer}) ${q.choices[q.answer].substring(0,80)}`,14,y); y+=8; doc.text(`Açıklama: ${q.explanation.substring(0,100)}`,14,y); y+=8; doc.text(`Kaynak: ${q.sources.join(', ').substring(0,100)}`,14,y); y+=12; });
    doc.addPage(); doc.setFontSize(16); doc.text('Çalışma Önerisi',14,24); doc.setFontSize(12); const advice=success>=80?'Güçlü performans. Zor seviye sorularla ilerle.':success>=60?'Orta seviye başarı. Yanlış konularda bilgi kartı çalış.':'Temel konuları tekrar et. Önce fotoğraf tarihi ilkler ve teknikler.'; doc.text(advice,14,40,{maxWidth:180}); doc.text('Öncelikli konular: Niépce, Daguerre, Talbot, Herschel, Maxwell, Eastman.',14,58,{maxWidth:180}); doc.save('photon-akademik-rapor.pdf');
  };

  if(page==='auth') return <main className="shell"><Header/><section className="panel"><h1>Üyelik Sistemi</h1><p className="lead">Üye girişi, misafir girişi ve yönetici paneli bu ekrandan açılır. Beni hatırla seçilirse bilgiler bu cihazda saklanır.</p><form className="form" onSubmit={login}><input name="name" placeholder="Ad Soyad" defaultValue="Sinan Targay"/><input name="email" placeholder="E-posta"/><input name="password" type="password" placeholder="Şifre"/><input name="adminCode" placeholder="Yönetici kodu (varsa)"/><label className="check"><input name="remember" type="checkbox" defaultChecked/> Beni hatırla</label><button>Giriş / Kayıt</button></form><button className="ghost" onClick={guest}>Misafir Girişi</button><p className="hint">Demo yönetici kodu: PHOTON2026</p></section></main>;

  if(page==='home') return <main className="shell"><Header/><section className="hero"><p className="badge">Marmara GSF Fotoğraf YL</p><h1>Akademik kaynaklı online sınav platformu</h1><p className="lead">Üyelik, misafir giriş, yönetici paneli, PDF rapor ve kaynaklı soru havuzu aktif.</p><div className="stats"><div><strong>{questions.length}</strong><span>Soru</span></div><div><strong>{user?'Aktif':'Kapalı'}</strong><span>Oturum</span></div><div><strong>PDF</strong><span>Rapor</span></div></div><div className="paymentBox"><h3>{settings.paymentTitle}</h3><p><b>Hesap Sahibi:</b> {settings.accountHolder || 'Henüz girilmedi'}</p><p><b>Banka:</b> {settings.bankName || 'Henüz girilmedi'}</p><p><b>IBAN:</b> {settings.iban || 'Henüz girilmedi'}</p><p>{settings.paymentText}</p></div><div className="actions"><button onClick={user?startExam:()=>setPage('auth')}>Sınava Başla</button><button className="ghost" onClick={()=>setPage('auth')}>Üyelik / Giriş</button><button className="ghost" onClick={()=>setPage('admin')}>Yönetici Paneli</button></div></section></main>;

  if(page==='exam') return <main className="shell"><Header/><section className="panel"><p className="badge">Soru {index+1} / {examQuestions.length} · {current.category} · {current.difficulty}</p><div className="progress"><span style={{width:`${((index+1)/examQuestions.length)*100}%`}} /></div><h2>{current.question}</h2><div className="options">{Object.entries(current.choices).map(([key,value])=><button key={key} className={answers[current.id]===key?'selected':''} onClick={()=>setAnswers({...answers,[current.id]:key})}><b>{key})</b> {value}</button>)}</div><div className="actions"><button className="ghost" disabled={index===0} onClick={()=>setIndex(index-1)}>Geri</button>{index<examQuestions.length-1?<button onClick={()=>setIndex(index+1)}>İleri</button>:<button onClick={()=>setPage('result')}>Sonucu Gör</button>}</div></section></main>;

  if(page==='result') return <main className="shell"><Header/><section className="panel"><h1>Sonuç</h1><div className="stats"><div><strong>{correct}</strong><span>Doğru</span></div><div><strong>{examQuestions.length-correct}</strong><span>Yanlış/Boş</span></div><div><strong>%{success}</strong><span>Başarı</span></div></div><div className="actions"><button onClick={downloadPdf}>Profesyonel PDF Rapor</button><button className="ghost" onClick={startExam}>Tekrar Çöz</button></div><h2>Yanlış / Boş Sorular</h2>{wrongList.map(q=><article className="wrong" key={q.id}><h3>{q.question}</h3><p><b>Doğru cevap:</b> {q.answer}) {q.choices[q.answer]}</p><p>{q.explanation}</p><p className="source"><b>Kaynak:</b> {q.sources.join(', ')}</p></article>)}</section></main>;

  if(!user || user.role!=='yönetici') return <main className="shell"><Header/><section className="panel"><h1>Yönetici Paneli</h1><p>Bu alan sadece yönetici girişi ile açılır.</p><button onClick={()=>setPage('auth')}>Yönetici Girişi</button></section></main>;

  return <main className="shell"><Header/><section className="panel"><h1>Yönetici Paneli</h1><div className="adminGrid"><div className="adminCard"><h2>Sistem Özeti</h2><p>Toplam soru: {questions.length}</p><p>Aktif kullanıcı: {user.name}</p><p>Rol: Yönetici</p></div><div className="adminCard"><h2>Ödeme / IBAN Bilgi Alanı</h2><form className="form" onSubmit={saveSettings}><input name="paymentTitle" placeholder="Başlık" defaultValue={settings.paymentTitle}/><input name="accountHolder" placeholder="Hesap sahibi" defaultValue={settings.accountHolder}/><input name="bankName" placeholder="Banka adı" defaultValue={settings.bankName}/><input name="iban" placeholder="IBAN" defaultValue={settings.iban}/><textarea name="paymentText" placeholder="Ödeme açıklaması" defaultValue={settings.paymentText}/><button>Bilgileri Kaydet</button></form></div><div className="adminCard"><h2>Soru Havuzu</h2><pre>{JSON.stringify(questions[0],null,2)}</pre></div></div></section></main>;
}

createRoot(document.getElementById('root')).render(<App />);