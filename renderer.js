// Canvas renderer for GBA display

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Set canvas size to GBA resolution
    this.width = 240;
    this.height = 160;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Create image data buffer
    this.imageData = this.ctx.createImageData(this.width, this.height);
    this.buffer = new Uint32Array(this.imageData.data.buffer);
    
    // Scale canvas for better visibility
    this.scale = 3;
    this.canvas.style.width = (this.width * this.scale) + 'px';
    this.canvas.style.height = (this.height * this.scale) + 'px';
    this.canvas.style.imageRendering = 'pixelated';
  }
  
  // Render frame buffer to canvas
  render(framebuffer) {
    // Copy framebuffer to image data
    this.buffer.set(framebuffer);
    
    // Draw to canvas
    this.ctx.putImageData(this.imageData, 0, 0);
  }
  
  // Clear screen
  clear(color = 0xFF000000) {
    this.buffer.fill(color);
    this.ctx.putImageData(this.imageData, 0, 0);
  }
  
  // Set scale
  setScale(scale) {
    this.scale = scale;
    this.canvas.style.width = (this.width * this.scale) + 'px';
    this.canvas.style.height = (this.height * this.scale) + 'px';
  }
}
