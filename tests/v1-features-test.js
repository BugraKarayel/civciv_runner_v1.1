// Civciv Runner v1.0 - Yeni Özellikler Detaylı Birim Test Paketi
import assert from 'assert';

// 1. Mock LocalStorage & Browser Envs
const storage = {};
globalThis.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failCount++;
  }
}

console.log('--- Civciv Runner v1.0 Yeni Özellikler & Fonksiyonellik Testleri ---');

// ====================================================
// TEST 1: Ses Sistemi (Daima Açık ve Kesintisiz)
// ====================================================
import { SoundManager } from '../js/audio.js';

test('SoundManager varsayılan olarak açık (enabled = true)', () => {
  localStorage.clear();
  const sm = new SoundManager();
  assert.strictEqual(sm.enabled, true);
});

test('SoundManager başlatıldığında eski mute kayıtlarını temizler', () => {
  localStorage.setItem('civciv_muted', '1');
  const sm = new SoundManager();
  assert.strictEqual(localStorage.getItem('civciv_muted'), null);
});

// ====================================================
// TEST 2: Duraklatma (Pause / Resume) Sistemi
// ====================================================
import { StateMachine, States } from '../js/state.js';

test('StateMachine varsayılan olarak duraklatılmamış (paused = false)', () => {
  StateMachine.change(States.IDLE);
  assert.strictEqual(StateMachine.paused, false);
});

test('IDLE durumunda pause açılmaz', () => {
  StateMachine.change(States.IDLE);
  const res = StateMachine.togglePause();
  assert.strictEqual(res, false);
  assert.strictEqual(StateMachine.paused, false);
});

test('RUN durumundayken togglePause() oyunu duraklatır', () => {
  StateMachine.change(States.RUN);
  const res = StateMachine.togglePause();
  assert.strictEqual(res, true);
  assert.strictEqual(StateMachine.paused, true);
});

test('Duraklatılmışken tekrar togglePause() oyunu devam ettirir', () => {
  StateMachine.change(States.RUN);
  StateMachine.paused = true;
  const res = StateMachine.togglePause();
  assert.strictEqual(res, false);
  assert.strictEqual(StateMachine.paused, false);
});

test('FLY durumundayken de duraklatma çalışır', () => {
  StateMachine.change(States.FLY);
  const res = StateMachine.togglePause();
  assert.strictEqual(res, true);
  assert.strictEqual(StateMachine.paused, true);
});

test('Durum değiştiğinde (ör. GAMEOVER) pause otomatik sıfırlanır', () => {
  StateMachine.change(States.RUN);
  StateMachine.togglePause();
  assert.strictEqual(StateMachine.paused, true);
  StateMachine.change(States.GAMEOVER);
  assert.strictEqual(StateMachine.paused, false);
});

// ====================================================
// TEST 3: Kişisel En İyi Skor (Personal Best / High Score)
// ====================================================
import { Score } from '../js/score.js';

test('Score.initHighScore() kayıtlı skoru yükler', () => {
  localStorage.setItem('civciv_personal_best', '1250');
  Score.initHighScore();
  assert.strictEqual(Score.highScore, 1250);
});

test('checkHighScore() rekor kırılmadığında false döner', () => {
  Score.reset();
  Score.highScore = 1000;
  Score.distance = 5000; // 500 puan
  const isNew = Score.checkHighScore(true);
  assert.strictEqual(isNew, false);
  assert.strictEqual(Score.isNewBest, false);
});

test('checkHighScore() yeni rekor kırıldığında true döner ve kaydeder', () => {
  Score.reset();
  Score.highScore = 500;
  Score.distPts = 1000; // 1000 puan
  const isNew = Score.checkHighScore(true);
  assert.strictEqual(isNew, true);
  assert.strictEqual(Score.isNewBest, true);
  assert.strictEqual(Score.highScore, Score.value);
  assert.strictEqual(localStorage.getItem('civciv_personal_best'), String(Score.value));
});

test('God Mode açıkken (allowSave = false) rekor kaydedilmez', () => {
  Score.reset();
  Score.highScore = 500;
  Score.distPts = 2000; // 2000 puan
  const isNew = Score.checkHighScore(false);
  assert.strictEqual(isNew, false);
  assert.strictEqual(Score.isNewBest, false);
  assert.strictEqual(Score.highScore, 500);
});

// ====================================================
// TEST 4: Hızlı Alçalma (Fast Fall) Mekaniği
// ====================================================
import { Input } from '../js/input.js';

test('Input.fastFallPressed varsayılan olarak false', () => {
  assert.strictEqual(Input.fastFallPressed, false);
});

// ====================================================
// TEST 5: Kostüm & Palet Kısayol Entegrasyonu
// ====================================================
import { SkinManager } from '../js/skins.js';
import { PaletteManager } from '../js/palette.js';

test('SkinManager nextSkin() 3 kostüm arasında dairesel geçer', () => {
  SkinManager.setSkin('classic');
  assert.strictEqual(SkinManager.current, 'classic');
  SkinManager.nextSkin();
  assert.strictEqual(SkinManager.current, 'detective');
  SkinManager.nextSkin();
  assert.strictEqual(SkinManager.current, 'footballer');
  SkinManager.nextSkin();
  assert.strictEqual(SkinManager.current, 'classic');
});

test('PaletteManager 4 palet arasında dairesel geçer ve 4. palet isPastel = true verir', () => {
  PaletteManager.setPalette(1);
  assert.strictEqual(PaletteManager.isPastel, false);
  PaletteManager.setPalette(4);
  assert.strictEqual(PaletteManager.isPastel, true);
  assert.strictEqual(PaletteManager.groundPalette.grassMain, '#58BA5D');
});

// ====================================================
// TEST 6: Leaderboard Aynı İsim Üzerine Yazma & Tekil Silme
// ====================================================
import { Leaderboard } from '../js/leaderboard.js';

test('Aynı isim tekrar deneme yaptığında yeni satır açmak yerine önceki skorun üstüne yazar', () => {
  localStorage.clear();
  Leaderboard.clearCache();
  Leaderboard.addRecord('Ahmet', 450);
  Leaderboard.addRecord('Mehmet', 600);
  Leaderboard.addRecord('ahmet', 920); // Aynı isim tekrar denedi

  const top10 = Leaderboard.getDailyTop10();
  assert.strictEqual(top10.length, 2, 'Tabloda 3 değil 2 kişi olmalı');
  const ahmet = top10.find(r => r.name.toLowerCase() === 'ahmet');
  assert.strictEqual(ahmet.score, 920, 'Önceki skorun üstüne yeni skor yazılmalı');
});

test('Aynı isim daha düşük skor yaptığında da önceki skorunun üstüne yazar', () => {
  Leaderboard.addRecord('Ahmet', 310);
  const top10 = Leaderboard.getDailyTop10();
  assert.strictEqual(top10.length, 2);
  const ahmet = top10.find(r => r.name.toLowerCase() === 'ahmet');
  assert.strictEqual(ahmet.score, 310);
});

test('Admin panelinde aynı isimde birden fazla kayıt varsa deleteByIndex sadece seçileni siler', () => {
  // Farklı tarihlerden veya eski kayıtlardan aynı isimde 2 kişi olsun
  Leaderboard.save([
    { name: 'Can', score: 1200, date: '2026-10-15', ts: 1 },
    { name: 'Can', score: 850, date: '2026-10-16', ts: 2 },
    { name: 'Zeynep', score: 900, date: '2026-10-16', ts: 3 }
  ]);
  const matches = Leaderboard.findMatches('Can');
  assert.strictEqual(matches.length, 2);

  // Sadece 2. sıradaki Can (850 puan) silinsin
  const removed = Leaderboard.deleteByIndex(matches[1].index);
  assert.strictEqual(removed.score, 850);

  const remaining = Leaderboard.get();
  assert.strictEqual(remaining.length, 2);
  assert.strictEqual(remaining[0].name, 'Can');
  assert.strictEqual(remaining[0].score, 1200);
});

console.log(`\nSonuç: ${passCount} başarılı, ${failCount} hatalı`);
if (failCount > 0) process.exit(1);
