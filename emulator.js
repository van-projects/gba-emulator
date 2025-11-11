// Main GBA Emulator class
import { MMU } from './memory/mmu.js';
import { ARM7TDMI } from './cpu/arm7tdmi.js';
import { GPU } from './gpu/gpu.js';
import { Renderer } from './gpu/renderer.js';
import { Keypad } from './io/keypad.js';
import { Timer } from './io/timer.js';

export class GBAEmulator {
  constructor(canvas) {
    // Initialize components
    this.mmu = new MMU();
    this.cpu = new ARM7TDMI(this.mmu);
    this.gpu = new GPU(this.mmu);
    this.keypad = new Keypad(this.mmu);
    this.timer = new Timer(this.mmu);
    
    // Renderer (if canvas provided)
    this.renderer = canvas ? new Renderer(canvas) : null;
    
    // Emulation state
    this.running = false;
    this.frameTime = 1000 / 60; // 60 FPS
    this.lastFrameTime = 0;
    
    // Cycles per frame (approximately)
    this.cyclesPerFrame = 280896; // 16.78 MHz / 60 FPS
    
    // Statistics
    this.stats = {
      fps: 0,
      frameCount: 0,
      lastFpsUpdate: 0
    };
    
    // Setup GPU V-Blank callback
    this.gpu.onVBlank = () => {
      this.onVBlank();
    };
    
    // Animation frame handle
    this.animationFrameId = null;
  }
  
  // Load ROM
  async loadROM(romData) {
    if (typeof romData === 'string') {
      // Load from URL
      const response = await fetch(romData);
      const buffer = await response.arrayBuffer();
      romData = new Uint8Array(buffer);
    }
    
    this.mmu.loadROM(romData);
    console.log(`Loaded ROM: ${romData.length} bytes`);
    
    // Reset emulator
    this.reset();
  }
  
  // Load BIOS
  async loadBIOS(biosData) {
    if (typeof biosData === 'string') {
      const response = await fetch(biosData);
      const buffer = await response.arrayBuffer();
      biosData = new Uint8Array(buffer);
    }
    
    this.mmu.loadBIOS(biosData);
    console.log('Loaded BIOS');
  }
  
  // Reset emulator
  reset() {
    this.cpu.reset();
    this.gpu.reset();
    this.keypad.reset();
    this.timer.reset();
    
    this.stats.frameCount = 0;
    this.stats.fps = 0;
    
    console.log('Emulator reset');
  }
  
  // Start emulation
  start() {
    if (this.running) {
      return;
    }
    
    this.running = true;
    this.lastFrameTime = performance.now();
    this.stats.lastFpsUpdate = performance.now();
    
    this.runFrame();
    
    console.log('Emulator started');
  }
  
  // Stop emulation
  stop() {
    this.running = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('Emulator stopped');
  }
  
  // Run one frame
  runFrame() {
    if (!this.running) {
      return;
    }
    
    const startTime = performance.now();
    
    // Run CPU and GPU for one frame
    let cycles = 0;
    while (cycles < this.cyclesPerFrame) {
      // Execute one CPU instruction
      this.cpu.step();
      
      // Get cycles elapsed
      const cpuCycles = 1; // Simplified
      cycles += cpuCycles;
      
      // Step GPU
      this.gpu.step(cpuCycles);
      
      // Step timers
      this.timer.step(cpuCycles);
    }
    
    // Update statistics
    this.stats.frameCount++;
    const now = performance.now();
    if (now - this.stats.lastFpsUpdate >= 1000) {
      this.stats.fps = this.stats.frameCount;
      this.stats.frameCount = 0;
      this.stats.lastFpsUpdate = now;
    }
    
    // Calculate frame timing
    const frameTime = now - startTime;
    const delay = Math.max(0, this.frameTime - frameTime);
    
    // Schedule next frame
    if (delay > 0) {
      setTimeout(() => {
        this.animationFrameId = requestAnimationFrame(() => this.runFrame());
      }, delay);
    } else {
      this.animationFrameId = requestAnimationFrame(() => this.runFrame());
    }
  }
  
  // V-Blank callback
  onVBlank() {
    // Render frame
    if (this.renderer) {
      this.renderer.render(this.gpu.getFramebuffer());
    }
  }
  
  // Step one instruction (for debugging)
  step() {
    this.cpu.step();
    const cpuCycles = 1;
    this.gpu.step(cpuCycles);
    this.timer.step(cpuCycles);
  }
  
  // Get emulator state (for debugging)
  getState() {
    return {
      cpu: this.cpu.getState(),
      fps: this.stats.fps,
      running: this.running
    };
  }
  
  // Set frame rate
  setFrameRate(fps) {
    this.frameTime = 1000 / fps;
  }
  
  // Get current FPS
  getFPS() {
    return this.stats.fps;
  }
}
