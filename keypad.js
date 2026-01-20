// GBA Keypad input handling
import { IO_REGISTERS, KEY_BITS } from '../memory/memory_map.js';

export class Keypad {
  constructor(mmu) {
    this.mmu = mmu;
    
    // Key state (bit = 0 when pressed, 1 when released)
    this.keyState = 0x03FF; // All keys released
    
    // Key mapping
    this.keyMap = {
      'KeyZ': KEY_BITS.A,
      'KeyX': KEY_BITS.B,
      'Enter': KEY_BITS.START,
      'ShiftRight': KEY_BITS.SELECT,
      'ArrowRight': KEY_BITS.RIGHT,
      'ArrowLeft': KEY_BITS.LEFT,
      'ArrowUp': KEY_BITS.UP,
      'ArrowDown': KEY_BITS.DOWN,
      'KeyA': KEY_BITS.L,
      'KeyS': KEY_BITS.R
    };
    
    // Bind keyboard events
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });
    
    window.addEventListener('keyup', (e) => {
      this.handleKeyUp(e);
    });
  }
  
  handleKeyDown(event) {
    const key = event.code;
    
    if (key in this.keyMap) {
      event.preventDefault();
      
      // Clear bit (pressed = 0)
      this.keyState &= ~this.keyMap[key];
      
      // Update KEYINPUT register
      this.updateKeyInput();
    }
  }
  
  handleKeyUp(event) {
    const key = event.code;
    
    if (key in this.keyMap) {
      event.preventDefault();
      
      // Set bit (released = 1)
      this.keyState |= this.keyMap[key];
      
      // Update KEYINPUT register
      this.updateKeyInput();
    }
  }
  
  updateKeyInput() {
    // Write to KEYINPUT register
    this.mmu.writeHalfWord(IO_REGISTERS.KEYINPUT, this.keyState);
  }
  
  // Check if key is pressed
  isPressed(keyBit) {
    return (this.keyState & keyBit) === 0;
  }
  
  // Get key state
  getState() {
    return this.keyState;
  }
  
  reset() {
    this.keyState = 0x03FF;
    this.updateKeyInput();
  }
  
  // Get key name for display
  getKeyName(keyBit) {
    switch (keyBit) {
      case KEY_BITS.A: return 'A';
      case KEY_BITS.B: return 'B';
      case KEY_BITS.START: return 'START';
      case KEY_BITS.SELECT: return 'SELECT';
      case KEY_BITS.RIGHT: return 'RIGHT';
      case KEY_BITS.LEFT: return 'LEFT';
      case KEY_BITS.UP: return 'UP';
      case KEY_BITS.DOWN: return 'DOWN';
      case KEY_BITS.L: return 'L';
      case KEY_BITS.R: return 'R';
      default: return 'UNKNOWN';
    }
  }
}
