import { StateMachine, States } from './state.js';
import { Konami } from './konami.js';

export const Input = {
  actionPressed: false,
  actionJustPressed: false,
  fastFallPressed: false,
  keys: {},
  
  init() {
    const handleDown = () => {
      StateMachine.registerInput();
      this.actionJustPressed = true;
      this.actionPressed = true;
    };
    
    const handleUp = () => {
      this.actionPressed = false;
    };

    window.addEventListener('keydown', (e) => {
      // Her tuş (isim yazarken harfler dahil) boşta kalma sayacını sıfırlar
      StateMachine.registerInput();
      this.keys[e.key] = true;
      if (StateMachine.current === States.IDLE && !e.repeat) Konami.onKey(e.key);
      if (e.code === 'Space') {
        handleDown();
      } else if (e.code === 'ArrowUp') {
        // Menüde ↑ oyunu başlatmaz (Konami kodu girilebilsin)
        if (StateMachine.current !== States.IDLE) handleDown();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.fastFallPressed = true;
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleUp();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.fastFallPressed = false;
      }
    });

    let startY = 0;
    let startTime = 0;
    let isTrackingTouch = false;

    // Pointer olayları: Dokunma ve fare kontrolleri
    window.addEventListener('pointerdown', (e) => {
      // Tam ekran veya hızlı düşme butonuna tıklandıysa zıplatma
      if (e.target && (e.target.id === 'fullscreen-btn' || e.target.id === 'fastfall-btn')) return;
      
      startY = e.clientY;
      startTime = performance.now();
      isTrackingTouch = true;
      handleDown();
    });

    window.addEventListener('pointermove', (e) => {
      if (!isTrackingTouch) return;
      const deltaY = e.clientY - startY;
      // Parmağı aşağı kaydırınca hızlı düşmeyi tetikle (20px eşik)
      if (deltaY > 20) {
        this.fastFallPressed = true;
      }
    });

    const finishPointer = (e) => {
      if (isTrackingTouch && e) {
        const deltaY = e.clientY - startY;
        const deltaTime = performance.now() - startTime;
        // Hızlı bir şekilde aşağı çekip bıraktıysa (Swipe): yere inene kadar 220ms basılı tut
        if (deltaY > 25 && deltaTime < 350) {
          this.fastFallPressed = true;
          setTimeout(() => {
            this.fastFallPressed = false;
          }, 220);
        } else {
          this.fastFallPressed = false;
        }
      } else {
        this.fastFallPressed = false;
      }
      isTrackingTouch = false;
      handleUp();
    };

    window.addEventListener('pointerup', finishPointer);
    window.addEventListener('pointercancel', finishPointer);
  },
  
  update() {
    this.actionJustPressed = false;
  }
};
