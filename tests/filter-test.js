import { ProfanityFilter } from '../js/filter.js';

console.log('--- Civciv Runner Test Suite Başlatılıyor ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

// 1. Temiz isim testleri
const cleanNames = ['Ahmet', 'Civciv', 'Berk_10', 'Dino_Gamer', 'GDG_AİBÜ', 'Mehmet-01'];
for (const name of cleanNames) {
  assert(!ProfanityFilter.isProfane(name), `"${name}" temiz olarak algılanmalı`);
  assert(ProfanityFilter.sanitize(name) === name, `"${name}" sanitize edilmeden korunmalı`);
}

// 2. Küfür / Uygunsuz isim testleri (Doğrudan)
const profaneDirect = ['orospu', 'pic', 'sik', 'yarrak', 'amk', 'aq', 'oc', 'got'];
for (const word of profaneDirect) {
  assert(ProfanityFilter.isProfane(word), `"${word}" uygunsuz olarak yakalanmalı`);
  const sanitized = ProfanityFilter.sanitize(word);
  assert(sanitized.startsWith('Civciv#'), `"${word}" sanitize edilip Civciv# formatına dönmeli (${sanitized})`);
}

// 3. Leetspeak ve harf tekrarı testleri
const leetNames = ['0r0spu', 'p!ç', 's1k', 'y@rr@k', 'piiiiç', 'siiiik', 'o.r.o.s.p.u'];
for (const word of leetNames) {
  assert(ProfanityFilter.isProfane(word), `Leetspeak/tekrar "${word}" filtrelenmeli`);
}

// 4. Karmaşık gömülü küfürler
const complexNames = ['pro_sikici_99', 'amk_cocugu', 'super_pic'];
for (const word of complexNames) {
  assert(ProfanityFilter.isProfane(word), `Karmaşık ifade "${word}" filtrelenmeli`);
}

// 5. Yeni eklenen küfür & hakaretler
const newlyAddedProfane = ['moron', 'embesil', 'manyak', 'namussuz', 'lavuk', 'gevsek', 'nazi', 'pedophile', 'blowjob', 'kondom'];
for (const word of newlyAddedProfane) {
  assert(ProfanityFilter.isProfane(word), `Yeni eklenen "${word}" filtrelenmeli`);
}

console.log(`\nTest Sonucu: ${passed} Başarılı, ${failed} Hatalı`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('Tüm testler başarıyla geçti!');
}
