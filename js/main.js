import { CONFIG } from './config.js';
import { StateMachine, States } from './state.js';
import { Input } from './input.js';
import { sounds } from './audio.js';
import { Player } from './player.js';
import { World } from './world.js';
import { ObstacleManager } from './obstacles.js';
import { Score } from './score.js';
import { Leaderboard } from './leaderboard.js';
import { UI } from './ui.js';
import { Konami } from './konami.js';
import { PaletteManager } from './palette.js';
import { GodMode } from './godmode.js';
import { SkinManager } from './skins.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

let player = new Player();
let tick = 0;
let flyTimer = 0;

Input.init();
Konami.onActivate = () => sounds.milestone();
UI.initNameField();
Leaderboard.initAdmin();
sounds.init();
World.init();
ObstacleManager.init();

// Menüde (IDLE) kostüm kartına veya vitrine tıklama
canvas.addEventListener('pointerdown', (e) => {
  if (StateMachine.current === States.IDLE) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    if (UI.handleSkinClick(canvasX, canvasY)) {
      sounds.init();
      sounds.collectSeed && sounds.collectSeed();
      e.stopPropagation();
      Input.actionJustPressed = false;
      return;
    }
  }
});

// Kısayollar: Ctrl+G (God Mode), 'P'/1-4 (Palet), 'C'/'S'/Oklar (Kostüm), 'Esc' (Duraklat)
window.addEventListener('keydown', (e) => {
  // Ctrl + G / Cmd + G: God Mode Toggle
  if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
    e.preventDefault();
    GodMode.toggle();
    sounds.milestone && sounds.milestone();
    return;
  }

  // Escape: Duraklat / Devam Et
  if (e.key === 'Escape') {
    if (StateMachine.current === States.RUN || StateMachine.current === States.FLY) {
      StateMachine.togglePause();
      sounds.init();
      return;
    }
  }

  if (StateMachine.current === States.ENTER_NAME) return;

  // 'C' veya 'S' tuşu: Kostüm değiştir (IDLE veya oyun içi)
  if (e.key === 'c' || e.key === 'C' || (StateMachine.current === States.IDLE && (e.key === 's' || e.key === 'S'))) {
    SkinManager.nextSkin();
    sounds.init();
    sounds.collectSeed && sounds.collectSeed();
    return;
  }

  // IDLE menüsündeyken Sol/Sağ Ok veya A/D ile kostüm değiştir
  if (StateMachine.current === States.IDLE) {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      SkinManager.nextSkin();
      sounds.init();
      sounds.collectSeed && sounds.collectSeed();
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      SkinManager.prevSkin();
      sounds.init();
      sounds.collectSeed && sounds.collectSeed();
      return;
    }
  }

  if (e.key === 'p' || e.key === 'P') {
    PaletteManager.nextPalette();
    sounds.milestone && sounds.milestone();
  } else if (e.key >= '1' && e.key <= '4') {
    PaletteManager.setPalette(parseInt(e.key, 10));
    sounds.milestone && sounds.milestone();
  }
});

function resetGame() {
  player.reset();
  World.init();
  ObstacleManager.init();
  Score.reset();
  Score.checkedThisRun = false;
  GodMode.resetRun();
  tick = 0;
  flyTimer = 0;
}

function triggerFly() {
  const activeRamp = ObstacleManager.ramps[0];
  const groundEnd = activeRamp ? (activeRamp.x + activeRamp.width) : (player.x + player.width + 40);
  World.takeoffGroundEndX = groundEnd;
  World.landingGroundX = null;

  StateMachine.change(States.FLY);
  player.vy = -12;
  sounds.rampLaunch();
  ObstacleManager.createSparks(player.x, player.y);
  flyTimer = CONFIG.FLY_DURATION;
  ObstacleManager.startFlyPhase();

  // Rampadan sonra havada kalabilecek zemin engellerini temizle (rampa gerisindekiler zeminle kayıp çıkar)
  ObstacleManager.obstacles = ObstacleManager.obstacles.filter(o => 
    o.type === 'SKY_PIPE' || (o.x + o.width <= groundEnd)
  );
}

function step(dt, now) {
  sounds.update(dt * (1000/60));

  if (StateMachine.paused) {
    if (Input.actionJustPressed) {
      StateMachine.togglePause();
      sounds.init();
    }
    Input.update();
    return;
  }

  tick += dt;
  StateMachine.update(dt * (1000/60)); // ms
  PaletteManager.update(dt * (1000/60));
  GodMode.update(dt * (1000/60));
  
  if (StateMachine.checkIdleTimeout(now)) {
    // If it reverted to IDLE due to timeout
    return;
  }

  // --- IDLE ---
  if (StateMachine.current === States.IDLE) {
    if (Input.actionJustPressed) {
      sounds.init(); // enable audio context on first user interaction
      resetGame();
      StateMachine.change(States.TUTORIAL);
    }
  } 
  // --- TUTORIAL ---
  else if (StateMachine.current === States.TUTORIAL) {
    World.update(dt, 0);
    if (StateMachine.timeInState >= CONFIG.TUTORIAL_DURATION) {
      StateMachine.change(States.RUN);
    }
  } 
  // --- RUN ---
  else if (StateMachine.current === States.RUN) {
    if (Input.actionJustPressed) player.jump();
    player.update(dt);
    World.update(dt, ObstacleManager.gameSpeed);
    ObstacleManager.update(dt, player, triggerFly);
    Score.addTime(dt * (1000/60));
  }
  // --- FLY ---
  else if (StateMachine.current === States.FLY) {
    if (Input.actionJustPressed) player.jump();
    player.update(dt);
    World.update(dt, ObstacleManager.gameSpeed);
    ObstacleManager.update(dt, player, triggerFly, flyTimer);
    Score.addTime(dt * (1000/60));

    flyTimer -= dt * (1000/60);

    // İniş fazı: Son 2.5 saniyede zemin sağdan kayarak gelmeye başlar ve havayı karaya bağlar
    if (flyTimer <= 2500) {
      World.landingGroundX = Math.max(0, CONFIG.CANVAS_WIDTH * (flyTimer / 2500));
    } else {
      World.landingGroundX = null;
    }

    if (flyTimer <= 0) { 
      // Doğrudan karaya geçiş
      StateMachine.change(States.RUN);
      ObstacleManager.clearSkyPhase();
      World.landingGroundX = null;
      player.invulnerableTime = CONFIG.INVULNERABILITY_DURATION;
      ObstacleManager.groundGraceTimer = 1500;
    }
  }
  // --- GAMEOVER ---
  else if (StateMachine.current === States.GAMEOVER) {
    if (!Score.checkedThisRun) {
      Score.checkedThisRun = true;
      Score.checkHighScore(!GodMode.usedInRun);
    }
    player.update(dt);
    if (StateMachine.timeInState > CONFIG.GAMEOVER_LOCK) {
      if (Input.actionJustPressed) {
        if (!GodMode.usedInRun && Leaderboard.isTop10(Score.value)) {
          StateMachine.change(States.ENTER_NAME);
          UI.beginNameEntry();
        } else {
          StateMachine.change(States.IDLE);
        }
      }
    }
  }

  Input.update();
}

function render() {
  if (StateMachine.current !== States.IDLE && StateMachine.current !== States.ENTER_NAME) {
    World.draw(ctx);
    ObstacleManager.draw(ctx, tick);
    player.draw(ctx, tick);
  }
  
  // UI Overlays
  UI.draw(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
}

// Donanım Yenileme Hızı (165Hz / 144Hz / 240Hz / 60Hz) Titreşimsiz Kilitlenme Motoru
const VSYNC_PRESETS = [
  { hz: 240, interval: 1000 / 240 },
  { hz: 165, interval: 1000 / 165 },
  { hz: 144, interval: 1000 / 144 },
  { hz: 120, interval: 1000 / 120 },
  { hz: 90,  interval: 1000 / 90  },
  { hz: 75,  interval: 1000 / 75  },
  { hz: 60,  interval: 1000 / 60  },
];

let lastTime = 0;
let lockedInterval = null;
let warmSamples = [];

function getQuantizedDelta(rawDelta) {
  if (rawDelta > 100) return lockedInterval || (1000 / 60);
  if (rawDelta < 2) return lockedInterval || (1000 / 240);

  // İlk 25 karede ekranın doğal frekansını hassas tespit et ve kitle
  if (!lockedInterval && warmSamples) {
    warmSamples.push(rawDelta);
    if (warmSamples.length >= 25) {
      warmSamples.sort((a, b) => a - b);
      const median = warmSamples[Math.floor(warmSamples.length / 2)];
      let bestDiff = Infinity;
      for (const p of VSYNC_PRESETS) {
        const diff = Math.abs(median - p.interval);
        if (diff < bestDiff) {
          bestDiff = diff;
          lockedInterval = p.interval;
        }
      }
      warmSamples = null;
    }
  }

  if (lockedInterval) {
    const tol = Math.max(1.8, lockedInterval * 0.35);
    // Standart kare: Windows timer sapması ne olursa olsun kilitli frekansı ver
    if (Math.abs(rawDelta - lockedInterval) <= tol) {
      return lockedInterval;
    }
    // Çift kare gecikmesi
    if (Math.abs(rawDelta - (lockedInterval * 2)) <= tol * 1.5) {
      return lockedInterval * 2;
    }
  }

  // Fallback
  for (let i = 0; i < VSYNC_PRESETS.length; i++) {
    const v = VSYNC_PRESETS[i].interval;
    if (Math.abs(rawDelta - v) <= 1.5) return v;
  }
  return rawDelta;
}

function loop(now) {
  requestAnimationFrame(loop);

  if (!lastTime) {
    lastTime = now;
    return;
  }

  const rawDelta = now - lastTime;
  lastTime = now;

  const delta = getQuantizedDelta(rawDelta);
  const dt = delta / (1000 / 60);
  
  step(dt, now);
  render();
}

// Start
requestAnimationFrame(loop);
