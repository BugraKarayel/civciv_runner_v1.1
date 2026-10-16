import { CONFIG } from './config.js';
import { StateMachine, States } from './state.js';
import { SPRITES, drawSprite } from './sprites.js';
import { sounds } from './audio.js';
import { ObstacleManager } from './obstacles.js';
import { World } from './world.js';
import { Konami } from './konami.js';
import { PaletteManager } from './palette.js';
import { GodMode } from './godmode.js';
import { Input } from './input.js';

export class Player {
  constructor() {
    this.scale = 0.85;
    this.width = 48 * this.scale;
    this.height = 42 * this.scale;
    this.reset();
  }

  reset() {
    this.x = 120;
    this.y = CONFIG.GROUND_Y - this.height;
    this.vy = 0;
    this.isGrounded = true;
    this.jumpsRemaining = 2;
    this.rotation = 0;
    this.isDead = false;
    this.invulnerableTime = 0;
    this.jumpBuffer = 0;
  }

  jump() {
    if (this.isDead) return;

    if (StateMachine.current === States.FLY) {
      this.vy = CONFIG.FLAP_VELOCITY;
      this.rotation = -0.3;
      sounds.flap();
      return;
    }

    if (StateMachine.current === States.RUN || StateMachine.current === States.TUTORIAL) {
      this.jumpBuffer = 180; // 180ms jump buffer: Yere inmeden önce basılan zıplamaları saklar
      this.tryJump();
    }
  }

  tryJump() {
    if (this.isDead) return false;
    if (StateMachine.current !== States.RUN && StateMachine.current !== States.TUTORIAL) return false;

    if (this.isGrounded) {
      this.vy = CONFIG.JUMP_VELOCITY;
      this.isGrounded = false;
      this.jumpsRemaining = 1;
      this.jumpBuffer = 0;
      sounds.jump();
      return true;
    } else if (this.jumpsRemaining > 0) {
      // Double Jump (havada 2. zıplama)
      this.vy = CONFIG.DOUBLE_JUMP_VELOCITY;
      this.jumpsRemaining = 0;
      this.jumpBuffer = 0;
      this.rotation = -0.22;
      sounds.flap();
      // Ayakların altında hafif puf parçacıkları
      for (let i = 0; i < 5; i++) {
        ObstacleManager.pushParticle(
          this.x + this.width * 0.35 + (Math.random() - 0.5) * 14,
          this.y + this.height - 2,
          (Math.random() - 0.5) * 3,
          Math.random() * 2 + 1,
          Math.floor(Math.random() * 3 + 3),
          '#ffffff'
        );
      }
      return true;
    }
    return false;
  }

  update(dt) {
    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= dt * (1000/60);
    }
    if (this.jumpBuffer > 0) {
      this.jumpBuffer = Math.max(0, this.jumpBuffer - dt * (1000/60));
    }

    if (StateMachine.current === States.RUN || StateMachine.current === States.GAMEOVER || StateMachine.current === States.TUTORIAL) {
      const gravityMult = (!this.isGrounded && Input.fastFallPressed && StateMachine.current !== States.GAMEOVER) ? 3.5 : 1;
      this.vy += CONFIG.GRAVITY_RUN * gravityMult * dt;
      this.y += this.vy * dt;

      // Rampadan sonra zemin biter! Rampayı atlayan boşluğa düşer.
      const hasGround = ObstacleManager.hasGroundAt(this.x + this.width / 2);

      if (hasGround && this.y >= CONFIG.GROUND_Y - this.height) {
        this.y = CONFIG.GROUND_Y - this.height;
        this.vy = 0;
        this.isGrounded = true;
        this.jumpsRemaining = 2;
        this.rotation = 0;

        // Çift zıplama sonrası yere inerken basılan zıplamayı sıfır gecikmeyle anında tetikle
        if (this.jumpBuffer > 0) {
          this.tryJump();
        }
      } else {
        this.isGrounded = false;
        this.rotation = Math.min(0.35, this.vy * 0.02);
      }

      // Boşluğa düşüp ekranın altına ulaşırsa GAMEOVER!
      if (!this.isGrounded && (this.y + this.height >= CONFIG.CANVAS_HEIGHT || this.y > CONFIG.CANVAS_HEIGHT)) {
        if (GodMode.active) {
          this.y = CONFIG.CANVAS_HEIGHT - this.height - 4;
          this.vy = CONFIG.JUMP_VELOCITY * 0.75;
        } else if (StateMachine.current !== States.GAMEOVER) {
          ObstacleManager.lastDeathReason = 'pit';
          StateMachine.change(States.GAMEOVER);
          sounds.hit();
        }
      }
    } else if (StateMachine.current === States.FLY) {
      this.vy += CONFIG.GRAVITY_FLY * dt;
      this.y += this.vy * dt;
      this.isGrounded = false;

      // İniş fazında zemin altına girdiyse zemine basabilsin
      if (World.landingGroundX !== null && (this.x + this.width / 2) >= World.landingGroundX) {
        if (this.y >= CONFIG.GROUND_Y - this.height) {
          this.y = CONFIG.GROUND_Y - this.height;
          this.vy = 0;
          this.isGrounded = true;
          this.jumpsRemaining = 2;
          this.rotation = 0;
          if (this.jumpBuffer > 0) {
            this.tryJump();
          }
        }
      }

      if (this.vy > 0 && !this.isGrounded) {
        this.rotation = Math.min(0.45, this.rotation + 0.025 * dt);
      }
      if (this.y < 20) {
        this.y = 20;
        this.vy = 0;
      }
      // Hava modunda boşluğa düşmek (flappy mantığı) doğrudan Game Over'dır!
      // Kalkıştan arta kalan zemin parçası katı değildir; civciv ekranın altına ulaştığı anda ölür.
      if (!this.isGrounded && this.y + this.height >= CONFIG.CANVAS_HEIGHT) {
        if (GodMode.active) {
          this.y = CONFIG.CANVAS_HEIGHT - this.height - 4;
          this.vy = CONFIG.FLAP_VELOCITY * 1.2;
        } else if (StateMachine.current !== States.GAMEOVER) {
          ObstacleManager.lastDeathReason = 'pit';
          StateMachine.change(States.GAMEOVER);
          sounds.hit();
        }
      }
    }
  }

  getSprite(tick) {
    if (this.isDead || StateMachine.current === States.GAMEOVER) return SPRITES.chick.dead;
    if ((StateMachine.current === States.RUN || StateMachine.current === States.TUTORIAL) && this.isGrounded) {
      return (Math.floor(tick / 7) % 2 === 0) ? SPRITES.chick.run1 : SPRITES.chick.run2;
    }
    return this.vy < 0 ? SPRITES.chick.flapUp : SPRITES.chick.flapDown;
  }

  // Konami easter egg: rainbow trail (cosmetic only)
  drawRainbowTrail(ctx, tick) {
    const cols = PaletteManager.rainbow;
    const cy = Math.round(this.y + this.height / 2);
    const count = cols.length;
    const stripeH = Math.max(2, Math.floor(18 / count));
    for (let i = 0; i < 12; i++) {
      const x = Math.round(this.x - 6 - i * 7);
      const wave = Math.round(Math.sin(tick * 0.25 + i * 0.6) * 4);
      ctx.globalAlpha = 1 - i / 14;
      for (let b = 0; b < count; b++) {
        ctx.fillStyle = cols[b];
        ctx.fillRect(x, cy - 9 + b * stripeH + wave, 6, stripeH);
      }
    }
    ctx.globalAlpha = 1;
  }

  draw(ctx, tick) {
    const isBlinking = this.invulnerableTime > 0 && Math.floor(this.invulnerableTime / 100) % 2 === 0;
    if (isBlinking) {
      ctx.globalAlpha = 0.5;
    }
    
    if (Konami.active && StateMachine.current !== States.GAMEOVER) this.drawRainbowTrail(ctx, tick);

    // God Mode: kuşa altın ilahi hale (halo) ve parıltı ekle
    if (GodMode.active && StateMachine.current !== States.GAMEOVER) {
      ctx.save();
      const hx = Math.round(this.x + this.width / 2);
      const hy = Math.round(this.y - 7);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(hx, hy, 12, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.fill();
      ctx.restore();
    }
    const sprite = this.getSprite(tick);
    const sw = sprite.width * this.scale;
    const sh = sprite.height * this.scale;
    const pad = CONFIG.PX * this.scale;

    if (Math.abs(this.rotation) < 0.02) {
      ctx.drawImage(sprite, this.x - pad, this.y - pad, sw, sh);
    } else {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const cos = Math.cos(this.rotation);
      const sin = Math.sin(this.rotation);
      ctx.setTransform(cos, sin, -sin, cos, cx, cy);
      ctx.drawImage(sprite, -this.width / 2 - pad, -this.height / 2 - pad, sw, sh);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    if (isBlinking) {
      ctx.globalAlpha = 1;
    }
  }

  getBounds() {
    if (!this.bounds) this.bounds = { x: 0, y: 0, width: 0, height: 0 };
    this.bounds.x = this.x + 10 * this.scale;
    this.bounds.y = this.y + 8 * this.scale;
    this.bounds.width = this.width - 20 * this.scale;
    this.bounds.height = this.height - 16 * this.scale;
    return this.bounds;
  }
}
