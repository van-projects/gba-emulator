// GBA Timer system
import { IO_REGISTERS } from '../memory/memory_map.js';

export class Timer {
  constructor(mmu) {
    this.mmu = mmu;
    
    // Four timers
    this.timers = [
      { counter: 0, reload: 0, control: 0 },
      { counter: 0, reload: 0, control: 0 },
      { counter: 0, reload: 0, control: 0 },
      { counter: 0, reload: 0, control: 0 }
    ];
    
    // Timer prescaler values
    this.prescalers = [1, 64, 256, 1024];
  }
  
  reset() {
    for (let i = 0; i < 4; i++) {
      this.timers[i].counter = 0;
      this.timers[i].reload = 0;
      this.timers[i].control = 0;
    }
  }
  
  // Step timers for given number of cycles
  step(cycles) {
    for (let i = 0; i < 4; i++) {
      this.stepTimer(i, cycles);
    }
  }
  
  stepTimer(index, cycles) {
    const timer = this.timers[index];
    
    // Check if timer is enabled
    const enabled = (timer.control & 0x80) !== 0;
    if (!enabled) {
      return;
    }
    
    // Check if counting up
    const countUp = (timer.control & 0x04) !== 0;
    if (countUp && index > 0) {
      // This timer counts when previous timer overflows
      return;
    }
    
    // Get prescaler
    const prescalerIndex = timer.control & 0x03;
    const prescaler = this.prescalers[prescalerIndex];
    
    // Increment counter
    const increment = Math.floor(cycles / prescaler);
    timer.counter += increment;
    
    // Check for overflow
    if (timer.counter > 0xFFFF) {
      timer.counter = timer.reload;
      
      // Handle overflow
      this.handleOverflow(index);
    }
    
    // Update register
    this.writeTimerCounter(index, timer.counter);
  }
  
  handleOverflow(index) {
    const timer = this.timers[index];
    
    // Check IRQ enable
    const irqEnable = (timer.control & 0x40) !== 0;
    if (irqEnable) {
      this.triggerIRQ(index);
    }
    
    // Trigger next timer if in count-up mode
    if (index < 3) {
      const nextTimer = this.timers[index + 1];
      const countUp = (nextTimer.control & 0x04) !== 0;
      
      if (countUp) {
        nextTimer.counter++;
        if (nextTimer.counter > 0xFFFF) {
          nextTimer.counter = nextTimer.reload;
          this.handleOverflow(index + 1);
        }
      }
    }
  }
  
  triggerIRQ(index) {
    // Read IF register
    const ifReg = this.mmu.readHalfWord(IO_REGISTERS.IF);
    
    // Set timer IRQ bit (bits 3-6)
    const irqBit = 1 << (3 + index);
    this.mmu.writeHalfWord(IO_REGISTERS.IF, ifReg | irqBit);
  }
  
  // Read timer counter
  readTimerCounter(index) {
    const baseAddr = IO_REGISTERS.TM0CNT_L + (index * 4);
    return this.mmu.readHalfWord(baseAddr);
  }
  
  // Write timer counter
  writeTimerCounter(index, value) {
    const baseAddr = IO_REGISTERS.TM0CNT_L + (index * 4);
    this.mmu.writeHalfWord(baseAddr, value & 0xFFFF);
  }
  
  // Read timer control
  readTimerControl(index) {
    const baseAddr = IO_REGISTERS.TM0CNT_H + (index * 4);
    return this.mmu.readHalfWord(baseAddr);
  }
  
  // Write timer control
  writeTimerControl(index, value) {
    const timer = this.timers[index];
    const oldControl = timer.control;
    timer.control = value & 0xFF;
    
    // If timer was just enabled, reload counter
    const wasDisabled = (oldControl & 0x80) === 0;
    const nowEnabled = (timer.control & 0x80) !== 0;
    
    if (wasDisabled && nowEnabled) {
      timer.counter = timer.reload;
    }
    
    const baseAddr = IO_REGISTERS.TM0CNT_H + (index * 4);
    this.mmu.writeHalfWord(baseAddr, timer.control);
  }
  
  // Write timer reload value
  writeTimerReload(index, value) {
    this.timers[index].reload = value & 0xFFFF;
  }
}
