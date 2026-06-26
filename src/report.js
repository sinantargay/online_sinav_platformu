import { jsPDF } from 'jspdf';

const clean = (v='') => String(v)
  .replace(/ı/g,'i').replace(/İ/g,'I').replace(/ğ/g,'g').replace(/Ğ/g,'G')
  .replace(/ü/g,'u').replace(/Ü/g,'U').replace(/ş/g,'s').replace(/Ş/g,'S')
  .replace(/ö/g,'o').replace(/Ö/g,'O').replace(/ç/g,'c').replace(/Ç/g,'C');

export function createAcademicReport({ examQuestions, answers, user }) {
  const doc = new jsPDF();
  const total = examQuestions.length;
  const correct = examQuestions.filter(q => answers[q.id] === q.answer).length;
  const wrongList = examQuestions.filter(q => answers[q.id] !== q.answer);
  const empty = examQuestions.filter(q => !answers[q.id]).length;
  const answeredWrong = wrongList.length - empty;
  const success = Math.round((correct / total) * 100);
  const reportNo = `PH-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  const m = 14;
  const w = 182;

  const t = (txt, x, y, opt={}) => doc.text(clean(txt), x, y, opt);
  const lines = (txt, width=w) => doc.splitTextToSize(clean(txt || ''), width);
  const footer = () => { doc.setFontSize(8); doc.setTextColor(120); t(`PHOTON Detayli Akademik Rapor | ${reportNo} | Sayfa ${doc.internal.getNumberOfPages()}`, m, 289); };
  const newPage = () => { footer(); doc.addPage(); };
  const header = (sub='Akademik Performans Raporu') => {
    doc.setFillColor(15,23,42); doc.rect(0,0,210,34,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(22); t('PHOTON',m,15);
    doc.setFontSize(10); t(sub,m,25); doc.setTextColor(20); doc.setFontSize(10);
  };
  const title = (s,y) => { doc.setFontSize(15); doc.setTextColor(15,23,42); t(s,m,y); doc.setDrawColor(37,99,235); doc.line(m,y+3,196,y+3); doc.setTextColor(20); };
  const box = (x,y,bw,label,value,sub) => {
    doc.setDrawColor(220); doc.setFillColor(248,250,252); doc.roundedRect(x,y,bw,25,3,3,'FD');
    doc.setFontSize(8); doc.setTextColor(90); t(label,x+4,y+7);
    doc.setFontSize(16); doc.setTextColor(15,23,42); t(String(value),x+4,y+16);
    doc.setFontSize(7); doc.setTextColor(110); t(sub,x+4,y+22); doc.setTextColor(20);
  };
  const bar = (x,y,bw,pct) => {
    doc.setDrawColor(210); doc.setFillColor(238,242,247); doc.roundedRect(x,y,bw,7,2,2,'FD');
    const c = pct >= 80 ? [22,163,74] : pct >= 60 ? [37,99,235] : [220,38,38];
    doc.setFillColor(c[0],c[1],c[2]); doc.roundedRect(x,y,Math.max(2,bw*pct/100),7,2,2,'F');
  };
  const categoryStats = examQuestions.reduce((acc,q)=>{
    const k = q.category || 'Diger';
    acc[k] ||= { total:0, correct:0, wrong:0, empty:0 };
    acc[k].total++;
    if (answers[q.id] === q.answer) acc[k].correct++;
    else if (!answers[q.id]) acc[k].empty++;
    else acc[k].wrong++;
    return acc;
  },{});
  const categories = Object.entries(categoryStats).map(([name,s]) => ({ name, ...s, percent: Math.round((s.correct/s.total)*100) })).sort((a,b)=>a.percent-b.percent);
  const weak = categories.filter(c => c.percent < 70).slice(0,4);
  const strong = [...categories].sort((a,b)=>b.percent-a.percent).slice(0,3);
  const adviceText = (name) => name.includes('Tekni') ? 'Diyafram, enstantane, ISO, histogram, RAW, objektif ve isik yonu konularini uygulamali tekrar et.' : name.includes('Tarih') ? 'Niepce, Daguerre, Talbot, Herschel, Maxwell ve Eastman surecini kronolojik calis.' : name.includes('Akim') ? 'Piktoriyalizm, Straight Photography, New Vision, Sosyal Belgeselcilik ve New Topographics farklarini karsilastir.' : name.includes('Genel') ? 'Odullu yazarlar, sinema uyarlamalari, Cannes, Berlin ve Oscar bilgilerini tekrar et.' : 'Yanlis sorularin aciklamalarini ve kaynaklarini tekrar oku; benzer soru cozumu yap.';

  header('Marmara GSF Fotoğraf YL - 50 Soruluk Deneme Analizi');
  title('Uye ve Rapor Bilgileri',48);
  t(`Rapor No: ${reportNo}`,m,60); t(`Ad Soyad: ${user?.name || 'Misafir Kullanici'}`,m,68); t(`E-posta: ${user?.email || '-'}`,m,76); t(`Uye Tipi: ${user?.role || 'misafir'}`,m,84); t(`Tarih: ${new Date().toLocaleString('tr-TR')}`,m,92);
  box(14,108,42,'Toplam',total,'Soru'); box(61,108,42,'Dogru',correct,'Cevap'); box(108,108,42,'Yanlis/Bos',wrongList.length,`${answeredWrong} yanlis, ${empty} bos`); box(155,108,42,'Basari',`%${success}`,'Genel oran');
  title('Grafikli Genel Analiz',150);
  doc.setFillColor(22,163,74); doc.circle(45,185,24,'F'); doc.setFillColor(220,38,38); doc.rect(45,161,24,48,'F'); doc.setFillColor(255,255,255); doc.circle(45,185,14,'F'); doc.setFontSize(14); doc.setTextColor(15,23,42); t(`%${success}`,36,188);
  doc.setFontSize(10); t('Basari orani',85,174); bar(85,178,90,success); t(`%${success}`,180,184); t('Dogru cevap',85,198); bar(85,202,90,Math.round(correct/total*100)); t(`${correct}/${total}`,180,208); t('Yanlis ve bos',85,222); bar(85,226,90,Math.round(wrongList.length/total*100)); t(`${wrongList.length}/${total}`,180,232);
  title('Akademik Yorum',252);
  const summary = success >= 80 ? 'Performans guclu. Zor seviye kuram, sanat tarihi ve portfolyo savunmasina agirlik ver.' : success >= 60 ? 'Performans orta seviyede. Bilgi var ancak konu dagilimi dengeli degil; zayif kategorilere hedefli tekrar gerekli.' : 'Temel kavramlarda eksik var. Once teknik temel, fotograf tarihi ilkleri ve temel akimlar sistemli tekrar edilmeli.';
  t(lines(summary,180),m,264);

  newPage(); header('Kategori ve Zorluk Analizi'); title('Konu Alanlarina Gore Basari',48); let y=62;
  categories.forEach(c => { if(y>258){ newPage(); header('Kategori Analizi'); y=48; } doc.setFontSize(9); t(c.name,m,y); bar(72,y-5,80,c.percent); t(`%${c.percent} | D:${c.correct} Y:${c.wrong} B:${c.empty} / ${c.total}`,156,y); y+=13; });
  title('Oncelikli Calisma Alanlari', y+10); y+=24;
  if(!weak.length){ t(lines('Belirgin zayif kategori yok. Zor seviye sorular, kuramsal metinler ve mulakat odakli portfolyo savunmasina gecilebilir.',180),m,y); y+=22; }
  weak.forEach((c,i)=>{ if(y>260){ newPage(); header('Calisma Plani'); y=48; } t(`${i+1}. ${c.name} - Basari: %${c.percent}`,m,y); y+=7; t(lines(adviceText(c.name),176),m+4,y); y+=17; });
  title('Guclu Alanlar', y+10); y+=24; strong.forEach((c,i)=>{ t(`${i+1}. ${c.name} - %${c.percent}`,m,y); y+=8; });

  newPage(); header('Yanlis ve Bos Sorular'); title('Cevaplar, Aciklamalar ve Kaynaklar',48); y=62;
  wrongList.forEach((q,i)=>{
    if(y>236){ newPage(); header('Yanlis ve Bos Sorular'); y=48; }
    const given = answers[q.id] ? `${answers[q.id]}) ${q.choices[answers[q.id]]}` : 'Bos birakildi';
    doc.setFontSize(10); doc.setTextColor(15,23,42); t(`${i+1}. ${q.category} / ${q.difficulty}`,m,y); y+=7; doc.setTextColor(20);
    const ql = lines(q.question,180); t(ql,m,y); y+=ql.length*5+3;
    const gl = lines(`Verilen cevap: ${given}`,180); t(gl,m,y); y+=gl.length*5+2;
    const dl = lines(`Dogru cevap: ${q.answer}) ${q.choices[q.answer]}`,180); t(dl,m,y); y+=dl.length*5+2;
    const al = lines(`Aciklama: ${q.explanation}`,180); t(al,m,y); y+=al.length*5+2;
    const sl = lines(`Kaynak: ${(q.sources || []).join(', ')}`,180); t(sl,m,y); y+=sl.length*5+8;
    doc.setDrawColor(230); doc.line(m,y-3,196,y-3);
  });
  footer();
  doc.save('photon-detayli-akademik-rapor.pdf');
}
