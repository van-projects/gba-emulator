// GBA GPU (PPU - Picture Processing Unit)
import { IO_REGISTERS, DISPCNT_FLAGS } from '../memory/memory_map.js';

export class GPU {
  constructor(mmu) {
    this.mmu = mmu;
    
    // Display dimensions
    this.width = 240;
    this.height = 160;
    
    // Frame buffer (RGBA)
    this.framebuffer = new Uint32Array(this.width * this.height);
    
    // Current scanline
    this.scanline = 0;
    
    // Cycles per scanline (approximately)
    this.cyclesPerScanline = 1232;
    this.currentCycles = 0;
    
    // V-Blank flag
    this.inVBlank = false;
    
    // Callbacks
    this.onVBlank = null;
  }
  
  reset() {
    this.framebuffer.fill(0xFFFFFFFF); // White
    this.scanline = 0;
    this.currentCycles = 0;
    this.inVBlank = false;
  }
  
  // Step GPU for given number of cycles
  step(cycles) {
    this.currentCycles += cycles;
    
    if (this.currentCycles >= this.cyclesPerScanline) {
      this.currentCycles -= this.cyclesPerScanline;
      this.scanline++;
      
      // Update VCOUNT register
      this.mmu.writeHalfWord(IO_REGISTERS.VCOUNT, this.scanline);
      
      if (this.scanline < this.height) {
        // Render scanline
        this.renderScanline();
      } else if (this.scanline === this.height) {
        // Enter V-Blank
        this.inVBlank = true;
        
        // Set V-Blank flag in DISPSTAT
        const dispstat = this.mmu.readHalfWord(IO_REGISTERS.DISPSTAT);
        this.mmu.writeHalfWord(IO_REGISTERS.DISPSTAT, dispstat | 0x0001);
        
        // Trigger V-Blank callback
        if (this.onVBlank) {
          this.onVBlank();
        }
      } else if (this.scanline >= 228) {
        // End of frame
        this.scanline = 0;
        this.inVBlank = false;
        
        // Clear V-Blank flag
        const dispstat = this.mmu.readHalfWord(IO_REGISTERS.DISPSTAT);
        this.mmu.writeHalfWord(IO_REGISTERS.DISPSTAT, dispstat & ~0x0001);
      }
    }
  }
  
  // Render current scanline
  renderScanline() {
    const dispcnt = this.mmu.readHalfWord(IO_REGISTERS.DISPCNT);
    const mode = dispcnt & 0x7;
    
    // Check forced blank
    if (dispcnt & DISPCNT_FLAGS.FORCED_BLANK) {
      this.fillScanline(0xFFFFFFFF); // White
      return;
    }
    
    // Render based on mode
    switch (mode) {
      case 3:
        this.renderMode3();
        break;
      case 4:
        this.renderMode4();
        break;
      default:
        // Modes 0-2, 5 require tile rendering (not implemented)
        this.fillScanline(0xFF000000); // Black
        break;
    }
  }
  
  // Render Mode 3 (240x160, 16-bit direct color)
  renderMode3() {
    const y = this.scanline;
    const offset = y * this.width;
    
    for (let x = 0; x < this.width; x++) {
      // Read pixel from VRAM
      const vramOffset = (y * this.width + x) * 2;
      const color16 = this.mmu.readHalfWord(0x06000000 + vramOffset);
      
      // Convert 15-bit BGR to 32-bit RGBA
      const r = ((color16 & 0x1F) << 3) | ((color16 & 0x1F) >> 2);
      const g = (((color16 >> 5) & 0x1F) << 3) | (((color16 >> 5) & 0x1F) >> 2);
      const b = (((color16 >> 10) & 0x1F) << 3) | (((color16 >> 10) & 0x1F) >> 2);
      const a = 0xFF;
      
      this.framebuffer[offset + x] = (a << 24) | (b << 16) | (g << 8) | r;
    }
  }
  
  // Render Mode 4 (240x160, 8-bit palettized)
  renderMode4() {
    const y = this.scanline;
    const offset = y * this.width;
    
    // Determine which frame to use
    const dispcnt = this.mmu.readHalfWord(IO_REGISTERS.DISPCNT);
    const frameSelect = (dispcnt & DISPCNT_FLAGS.FRAME_SELECT) ? 0xA000 : 0;
    
    for (let x = 0; x < this.width; x++) {
      // Read palette index from VRAM
      const vramOffset = frameSelect + (y * this.width + x);
      const paletteIndex = this.mmu.readByte(0x06000000 + vramOffset);
      
      // Read color from palette
      const color16 = this.mmu.readHalfWord(0x05000000 + paletteIndex * 2);
      
      // Convert to RGBA
      const r = ((color16 & 0x1F) << 3) | ((color16 & 0x1F) >> 2);
      const g = (((color16 >> 5) & 0x1F) << 3) | (((color16 >> 5) & 0x1F) >> 2);
      const b = (((color16 >> 10) & 0x1F) << 3) | (((color16 >> 10) & 0x1F) >> 2);
      const a = 0xFF;
      
      this.framebuffer[offset + x] = (a << 24) | (b << 16) | (g << 8) | r;
    }
  }
  
  // Fill scanline with solid color
  fillScanline(color) {
    const y = this.scanline;
    const offset = y * this.width;
    
    for (let x = 0; x < this.width; x++) {
      this.framebuffer[offset + x] = color;
    }
  }
  
  // Get frame buffer for rendering
  getFramebuffer() {
    return this.framebuffer;
  }
  
  // Convert color from GBA format (BGR555) to RGBA
  convertColor(color16) {
    const r = ((color16 & 0x1F) << 3) | ((color16 & 0x1F) >> 2);
    const g = (((color16 >> 5) & 0x1F) << 3) | (((color16 >> 5) & 0x1F) >> 2);
    const b = (((color16 >> 10) & 0x1F) << 3) | (((color16 >> 10) & 0x1F) >> 2);
    const a = 0xFF;
    
    return (a << 24) | (b << 16) | (g << 8) | r;
  }
}
