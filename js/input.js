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
    let isTrackingTouch = false;

    // Pointer olayları: Fare ve dokunmayı karşılar, aşağı kaydırma (swipe down) ile hızlı düşmeyi tetikler
    window.addEventListener('pointerdown', (e) => {
      // Tam ekran butonuna basıldıysa oyun zıplamasını tetikleme
      if (e.target && e.target.id === 'fullscreen-btn') return;
      
      startY = e.clientY;
      isTrackingTouch = true;
      handleDown();
    });

    window.addEventListener('pointermove', (e) => {
      if (!isTrackingTouch) return;
      const deltaY = e.clientY - startY;
      // Parmağı 30 pikselden fazla aşağı kaydırırsa: Fast Fall (Hızlı Düşme)
      if (deltaY > 30) {
        this.fastFallPressed = true;
      }
    });

    const finishPointer = () => {
      isTrackingTouch = false;
      this.fastFallPressed = false;
      handleUp();
    };

    window.addEventListener('pointerup', finishPointer);
    window.addEventListener('pointercancel', finishPointer);
  },
  
  update() {
    this.actionJustPressed = false;
  }
};
