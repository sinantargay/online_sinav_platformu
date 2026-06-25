import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import './style.css';
import questions from './data/questions.json';

function App() {
  const [page, setPage] = useState('home');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const examQuestions = useMemo(() => questions.slice(0, 10), []);
  const current = examQuestions[index];
  const correct = examQuestions.filter(q => answers[q.id] === q.answer).length;
  const wrongList = examQuestions.filter(q => answers[q.id] !== q.answer);

  const startExam = () => { setAnswers({}); setIndex(0); setPage('exam'); };

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('PHOTON Sınav Raporu', 14, 20);
    doc.setFontSize(12);
    doc.text(`Toplam: ${examQuestions.length}`, 14, 35);
    doc.text(`Doğru: ${correct}`, 14, 45);
    doc.text(`Yanlış/Boş: ${examQuestions.length - correct}`, 14, 55);
    doc.text(`Başarı: %${Math.round((correct / examQuestions.length) * 100)}`, 14, 65);
    doc.save('photon-rapor.pdf');
  };

  if (page === 'home') return (
    <main className="shell">
      <nav className="nav"><b>PHOTON</b><span>Fotoğraf Yüksek Lisans Hazırlık</span></nav>
      <section className="hero">
        <p className="badge">Marmara GSF Fotoğraf YL</p>
        <h1>Akademik, kaynaklı ve 5 şıklı online sınav platformu</h1>
        <p className="lead">Fotoğraf tarihi, teknik, kuram, sanat tarihi ve güncel kültür-sanat alanları için hazırlanıyor.</p>
        <div className="stats">
          <div><strong>{questions.length}</strong><span>Soru</span></div>
          <div><strong>5</strong><span>Şıklı</span></div>
          <div><strong>PDF</strong><span>Rapor</span></div>
        </div>
        <div className="actions"><button onClick={startExam}>Sınava Başla</button><button className="ghost" onClick={() => setPage('admin')}>Admin</button></div>
      </section>
    </main>
  );

  if (page === 'exam') return (
    <main className="shell">
      <nav className="nav"><b>PHOTON</b><button className="small" onClick={() => setPage('home')}>Ana Sayfa</button></nav>
      <section className="panel">
        <p className="badge">Soru {index + 1} / {examQuestions.length} · {current.category} · {current.difficulty}</p>
        <h2>{current.question}</h2>
        <div className="options">
          {Object.entries(current.choices).map(([key, value]) => (
            <button key={key} className={answers[current.id] === key ? 'selected' : ''} onClick={() => setAnswers({ ...answers, [current.id]: key })}>
              <b>{key})</b> {value}
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>Geri</button>
          {index < examQuestions.length - 1 ? <button onClick={() => setIndex(index + 1)}>İleri</button> : <button onClick={() => setPage('result')}>Sonucu Gör</button>}
        </div>
      </section>
    </main>
  );

  if (page === 'result') return (
    <main className="shell">
      <nav className="nav"><b>PHOTON</b><button className="small" onClick={() => setPage('home')}>Ana Sayfa</button></nav>
      <section className="panel">
        <h1>Sonuç</h1>
        <div className="stats"><div><strong>{correct}</strong><span>Doğru</span></div><div><strong>{examQuestions.length - correct}</strong><span>Yanlış/Boş</span></div><div><strong>%{Math.round((correct / examQuestions.length) * 100)}</strong><span>Başarı</span></div></div>
        <div className="actions"><button onClick={downloadPdf}>PDF Rapor İndir</button><button className="ghost" onClick={startExam}>Tekrar Çöz</button></div>
        <h2>Yanlış / Boş Sorular</h2>
        {wrongList.map(q => <article className="wrong" key={q.id}><h3>{q.question}</h3><p><b>Doğru cevap:</b> {q.answer}) {q.choices[q.answer]}</p><p>{q.explanation}</p><p className="source"><b>Kaynak:</b> {q.sources.join(', ')}</p></article>)}
      </section>
    </main>
  );

  return (
    <main className="shell">
      <nav className="nav"><b>PHOTON Admin</b><button className="small" onClick={() => setPage('home')}>Ana Sayfa</button></nav>
      <section className="panel">
        <h1>Admin Panel</h1>
        <p>İlk sürümde soru havuzu JSON dosyasından okunuyor. Sonraki sprintte soru ekleme/düzenleme formu bağlanacak.</p>
        <pre>{JSON.stringify(questions[0], null, 2)}</pre>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
