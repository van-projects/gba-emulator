// CPU Registers for ARM7TDMI
// The GBA uses an ARM7TDMI processor with 32-bit registers

export class Registers {
  constructor() {
    // 16 general purpose registers (R0-R15)
    // R13 = SP (Stack Pointer)
    // R14 = LR (Link Register)
    // R15 = PC (Program Counter)
    this.r = new Uint32Array(16);
    
    // Current Program Status Register
    this.cpsr = 0;
    
    // Saved Program Status Registers (for different modes)
    this.spsr = {
      fiq: 0,
      svc: 0,
      abt: 0,
      irq: 0,
      und: 0
    };
    
    // Banked registers for different processor modes
    this.banked = {
      // FIQ mode (Fast Interrupt)
      fiq: {
        r8: 0, r9: 0, r10: 0, r11: 0, r12: 0, r13: 0, r14: 0
      },
      // Supervisor mode
      svc: { r13: 0, r14: 0 },
      // Abort mode
      abt: { r13: 0, r14: 0 },
      // IRQ mode
      irq: { r13: 0, r14: 0 },
      // Undefined mode
      und: { r13: 0, r14: 0 }
    };
    
    // Initialize PC to BIOS entry point
    this.r[15] = 0x08000000;
    
    // Start in System mode
    this.setMode(0x1F);
  }
  
  // CPSR flags
  get n() { return (this.cpsr >> 31) & 1; } // Negative
  get z() { return (this.cpsr >> 30) & 1; } // Zero
  get c() { return (this.cpsr >> 29) & 1; } // Carry
  get v() { return (this.cpsr >> 28) & 1; } // Overflow
  get i() { return (this.cpsr >> 7) & 1; }  // IRQ disable
  get f() { return (this.cpsr >> 6) & 1; }  // FIQ disable
  get t() { return (this.cpsr >> 5) & 1; }  // Thumb mode
  
  get mode() { return this.cpsr & 0x1F; }
  
  setN(val) {
    if (val) this.cpsr |= (1 << 31);
    else this.cpsr &= ~(1 << 31);
  }
  
  setZ(val) {
    if (val) this.cpsr |= (1 << 30);
    else this.cpsr &= ~(1 << 30);
  }
  
  setC(val) {
    if (val) this.cpsr |= (1 << 29);
    else this.cpsr &= ~(1 << 29);
  }
  
  setV(val) {
    if (val) this.cpsr |= (1 << 28);
    else this.cpsr &= ~(1 << 28);
  }
  
  setT(val) {
    if (val) this.cpsr |= (1 << 5);
    else this.cpsr &= ~(1 << 5);
  }
  
  setMode(mode) {
    this.cpsr = (this.cpsr & ~0x1F) | (mode & 0x1F);
  }
  
  // Get PC (always returns actual PC, accounting for pipeline)
  get pc() {
    return this.r[15];
  }
  
  // Set PC
  set pc(val) {
    this.r[15] = val & 0xFFFFFFFE; // Align to 2 bytes
  }
  
  // Get SP
  get sp() {
    return this.r[13];
  }
  
  // Set SP
  set sp(val) {
    this.r[13] = val;
  }
  
  // Get LR
  get lr() {
    return this.r[14];
  }
  
  // Set LR
  set lr(val) {
    this.r[14] = val;
  }
  
  reset() {
    this.r.fill(0);
    this.cpsr = 0x1F; // System mode
    this.r[15] = 0x08000000; // ROM start
  }
}
