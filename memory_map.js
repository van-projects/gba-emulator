// GBA Memory Map
// Based on official GBA memory layout

export const MEMORY_MAP = {
  // BIOS - System ROM (16KB)
  BIOS_START: 0x00000000,
  BIOS_END: 0x00003FFF,
  BIOS_SIZE: 0x4000,
  
  // External Work RAM (256KB)
  EWRAM_START: 0x02000000,
  EWRAM_END: 0x0203FFFF,
  EWRAM_SIZE: 0x40000,
  
  // Internal Work RAM (32KB)
  IWRAM_START: 0x03000000,
  IWRAM_END: 0x03007FFF,
  IWRAM_SIZE: 0x8000,
  
  // I/O Registers
  IO_START: 0x04000000,
  IO_END: 0x040003FF,
  IO_SIZE: 0x400,
  
  // Palette RAM (1KB)
  PALETTE_START: 0x05000000,
  PALETTE_END: 0x050003FF,
  PALETTE_SIZE: 0x400,
  
  // Video RAM (96KB)
  VRAM_START: 0x06000000,
  VRAM_END: 0x06017FFF,
  VRAM_SIZE: 0x18000,
  
  // Object Attribute Memory (1KB)
  OAM_START: 0x07000000,
  OAM_END: 0x070003FF,
  OAM_SIZE: 0x400,
  
  // Game Pak ROM (32MB max)
  ROM_START: 0x08000000,
  ROM_END: 0x09FFFFFF,
  
  // Game Pak SRAM (64KB max)
  SRAM_START: 0x0E000000,
  SRAM_END: 0x0E00FFFF,
  SRAM_SIZE: 0x10000
};

// Important I/O Register addresses
export const IO_REGISTERS = {
  // Display
  DISPCNT: 0x04000000,  // Display Control
  DISPSTAT: 0x04000004, // Display Status
  VCOUNT: 0x04000006,   // Vertical Counter
  
  // Background Control
  BG0CNT: 0x04000008,
  BG1CNT: 0x0400000A,
  BG2CNT: 0x0400000C,
  BG3CNT: 0x0400000E,
  
  // DMA
  DMA0SAD: 0x040000B0,  // DMA 0 Source Address
  DMA0DAD: 0x040000B4,  // DMA 0 Destination Address
  DMA0CNT: 0x040000B8,  // DMA 0 Control
  
  // Timers
  TM0CNT_L: 0x04000100, // Timer 0 Counter
  TM0CNT_H: 0x04000102, // Timer 0 Control
  
  // Input
  KEYINPUT: 0x04000130, // Key Status
  KEYCNT: 0x04000132,   // Key Interrupt Control
  
  // Interrupts
  IE: 0x04000200,       // Interrupt Enable
  IF: 0x04000202,       // Interrupt Request Flags
  IME: 0x04000208       // Interrupt Master Enable
};

// Display control flags
export const DISPCNT_FLAGS = {
  BG_MODE: 0x0007,      // BG Mode (0-5)
  CGB_MODE: 0x0008,     // CGB mode
  FRAME_SELECT: 0x0010, // Display frame select
  OAM_HBL: 0x0020,      // Allow access to OAM during H-Blank
  OBJ_MAPPING: 0x0040,  // OBJ character VRAM mapping
  FORCED_BLANK: 0x0080, // Forced blank
  BG0_ON: 0x0100,       // Display BG0
  BG1_ON: 0x0200,       // Display BG1
  BG2_ON: 0x0400,       // Display BG2
  BG3_ON: 0x0800,       // Display BG3
  OBJ_ON: 0x1000,       // Display OBJ
  WIN0_ON: 0x2000,      // Display Window 0
  WIN1_ON: 0x4000,      // Display Window 1
  WINOBJ_ON: 0x8000     // Display OBJ Window
};

// Key input bits
export const KEY_BITS = {
  A: 0x0001,
  B: 0x0002,
  SELECT: 0x0004,
  START: 0x0008,
  RIGHT: 0x0010,
  LEFT: 0x0020,
  UP: 0x0040,
  DOWN: 0x0080,
  R: 0x0100,
  L: 0x0200
};
