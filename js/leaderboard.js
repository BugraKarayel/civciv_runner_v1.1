// Yerel saat dilimine göre YYYY-MM-DD (toISOString UTC döndürdüğü için TR'de 00:00-03:00 arası önceki güne düşüyordu)
function todayLocal() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export const Leaderboard = {
  key: 'gdg_civciv_runner_lb_v2',
  
  get() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return [];
  },
  
  save(list) {
    try {
      localStorage.setItem(this.key, JSON.stringify(list));
      this.clearCache();
    } catch(e) {}
  },
  
  cachedDailyTop10: null,
  cachedFormattedTop10: null,
  
  getDailyTop10() {
    if (this.cachedDailyTop10) return this.cachedDailyTop10;
    const list = this.get();
    const today = todayLocal();
    this.cachedDailyTop10 = list.filter(r => r.date === today)
               .sort((a, b) => b.score - a.score)
               .slice(0, 10);
    return this.cachedDailyTop10;
  },

  getFormattedDailyTop10() {
    if (this.cachedFormattedTop10) return this.cachedFormattedTop10;
    const top10 = this.getDailyTop10();
    this.cachedFormattedTop10 = [];
    for (let i = 0; i < top10.length; i++) {
      const r = top10[i];
      const rank = String(i + 1).padStart(2, ' ');
      const score = String(r.score).padStart(5, '0');
      this.cachedFormattedTop10.push(`${rank}. ${r.name.padEnd(20, ' ')} ${score}`);
    }
    return this.cachedFormattedTop10;
  },
  
  clearCache() {
    this.cachedDailyTop10 = null;
    this.cachedFormattedTop10 = null;
  },
  
  isTop10(score) {
    const top10 = this.getDailyTop10();
    if (top10.length < 10) return true;
    return score > top10[top10.length - 1].score;
  },
  
  addRecord(name, score) {
    const list = this.get();
    const today = todayLocal();
    const norm = name.trim().toLowerCase();

    // Aynı gün içinde aynı isimle kayıt varsa yeni satır eklemek yerine önceki skorun üstüne yaz
    let updated = false;
    const nextList = [];
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      if (r.date === today && r.name.trim().toLowerCase() === norm) {
        if (!updated) {
          nextList.push({ name: name.trim(), score, date: today, ts: Date.now() });
          updated = true;
        }
        // Varsa eski mükerrer kayıtları atla
      } else {
        nextList.push(r);
      }
    }

    if (!updated) {
      nextList.push({ name: name.trim(), score, date: today, ts: Date.now() });
    }

    this.save(nextList);
  },

  findMatches(name) {
    const list = this.get();
    const norm = (name || '').trim().toLowerCase();
    const matches = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].name.trim().toLowerCase() === norm) {
        matches.push({ record: list[i], index: i });
      }
    }
    return matches;
  },

  deleteByIndex(targetIndex) {
    const list = this.get();
    if (targetIndex < 0 || targetIndex >= list.length) return null;
    const [removed] = list.splice(targetIndex, 1);
    this.save(list);
    return removed;
  },
  
  initAdmin() {
    const keys = {};
    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      
      // PDF'te belirtilen: Ctrl + Shift + A 
      // Kullanıcının belirttiği alternatif: Ctrl + A + D
      const isPdfShortcut = e.ctrlKey && e.shiftKey && e.code === 'KeyA';
      const isUserShortcut = e.ctrlKey && keys['KeyA'] && keys['KeyD'];

      if (isPdfShortcut || isUserShortcut) {
        e.preventDefault();
        
        let list = this.get();
        const action = prompt('Admin paneli:\n1 - Günü sıfırla\n2 - Kayıt Sil (Belirli bir kullanıcı)\n3 - JSON/CSV Dışa Aktar (Konsola)');
        
        if (action === '1') {
          if (confirm('Emin misiniz? Bugünün tüm skorları silinecek.')) {
            const today = todayLocal();
            this.save(list.filter(r => r.date !== today));
            alert('Bugünün kayıtları sıfırlandı.');
          }
        } else if (action === '2') {
          const nameToDel = prompt('Silmek istediğiniz oyuncunun tam ismini girin:');
          if (nameToDel && nameToDel.trim()) {
            const matches = this.findMatches(nameToDel);
            if (matches.length === 0) {
              alert('Böyle bir kullanıcı bulunamadı.');
            } else if (matches.length === 1) {
              const removed = this.deleteByIndex(matches[0].index);
              alert(`"${removed.name}" (Skor: ${removed.score}) isimli oyuncunun kaydı silindi.`);
            } else {
              const optionsText = matches
                .map((m, idx) => `${idx + 1} - ${m.record.name} | Skor: ${m.record.score} | Tarih: ${m.record.date}`)
                .join('\n');
              const choice = prompt(
                `"${nameToDel.trim()}" isminde ${matches.length} kayıt bulundu.\n` +
                `Silmek istediğiniz kaydın numarasını (1-${matches.length}) girin:\n\n` +
                `${optionsText}\n\n` +
                `(Tümünü silmek için "hepsi" yazabilirsiniz)`
              );
              if (choice) {
                const trimmedChoice = choice.trim().toLowerCase();
                if (trimmedChoice === 'hepsi' || trimmedChoice === 'tümü') {
                  const norm = nameToDel.trim().toLowerCase();
                  this.save(list.filter(r => r.name.trim().toLowerCase() !== norm));
                  alert(`"${nameToDel.trim()}" isimli tüm kayıtlar (${matches.length} adet) silindi.`);
                } else {
                  const num = parseInt(trimmedChoice, 10);
                  if (!isNaN(num) && num >= 1 && num <= matches.length) {
                    const removed = this.deleteByIndex(matches[num - 1].index);
                    alert(`${num}. sıradaki "${removed.name}" (Skor: ${removed.score}) kaydı silindi.`);
                  } else {
                    alert('Geçersiz seçim, silme işlemi iptal edildi.');
                  }
                }
              }
            }
          }
        } else if (action === '3') {
          const csvContent = "isim,skor,tarih\n" + list.map(r => `${r.name},${r.score},${r.date}`).join("\n");
          console.log("=== JSON ===");
          console.log(JSON.stringify(list, null, 2));
          console.log("=== CSV ===");
          console.log(csvContent);
          try {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `civciv_skorlar_${todayLocal()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('CSV dosyası indirildi ve kayıtlar tarayıcı konsoluna (F12) yazdırıldı.');
          } catch (err) {
            alert('Kayıtlar tarayıcı konsoluna yazdırıldı (F12 ile açabilirsiniz).');
          }
        }
        
        // Tuş durumlarını temizle ki tekrar tekrar tetiklenmesin
        keys['KeyA'] = false;
        keys['KeyD'] = false;
      }
    });

    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });
  }
};
