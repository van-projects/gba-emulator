class GameBoy {
  constructor() {
    // 64KB Memory
    this.memory = new Uint8Array(0x10000);

    // CPU registers
    this.registers = {
      A: 0x01,
      F: 0xB0,
      B: 0x00,
      C: 0x13,
      D: 0x00,
      E: 0xD8,
      H: 0x01,
      L: 0x4D,
      SP: 0xFFFE,
      PC: 0x0100
    };

    // Other state variables (flags, timers, etc) can go here

    // Load BIOS, ROM, etc. later
  }

  // Read a byte from memory
  readByte(address) {
    return this.memory[address];
  }

  // Write a byte to memory
  writeByte(address, value) {
    this.memory[address] = value & 0xFF;
  }

  // Main CPU execution cycle (simplified)
  step() {
    const opcode = this.readByte(this.registers.PC);
    this.registers.PC += 1;

    // For now, just log the opcode
    console.log("Opcode:", opcode.toString(16));
    // TODO: Decode and execute instruction here
  }

  // Start the emulator loop
  start() {
    setInterval(() => {
      this.step();
    }, 16); // Roughly 60Hz
  }
}
