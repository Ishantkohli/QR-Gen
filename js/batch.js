/**
 * Batch QR Code Generator
 * Processes multiple URLs/lines or CSV data and creates a downloadable ZIP.
 */

export class BatchGenerator {
  constructor(generatorInstance) {
    this.generator = generatorInstance;
  }

  parseInput(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];

    lines.forEach((line, index) => {
      // Check for comma separated format: URL, Filename
      if (line.includes(',')) {
        const parts = line.split(',');
        const data = parts[0].trim();
        const name = parts[1].trim() || `qr_${index + 1}`;
        if (data) items.push({ data, name });
      } else {
        items.push({
          data: line,
          name: `qr_${index + 1}_${this.sanitizeName(line.substring(0, 15))}`
        });
      }
    });

    return items;
  }

  sanitizeName(str) {
    return str.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  }

  async generateZip(items, { format = 'png', resolution = 1024, onProgress }) {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip library not loaded');
    }

    const zip = new JSZip();
    const total = items.length;

    for (let i = 0; i < total; i++) {
      const item = items[i];
      if (onProgress) {
        onProgress(i + 1, total, item.name);
      }

      // Clone current options with new data
      const opts = {
        ...this.generator.getCleanLibraryOptions(),
        data: item.data,
        width: resolution,
        height: resolution
      };

      if (format === 'svg' && (!this.generator.currentOptions.frame || this.generator.currentOptions.frame.style === 'none')) {
        const svgQR = new QRCodeStyling({ ...opts, type: 'svg' });
        const blob = await svgQR.getRawData('svg');
        zip.file(`${item.name}.svg`, blob);
      } else {
        const tempQR = new QRCodeStyling({ ...opts, type: 'canvas' });
        const tempDiv = document.createElement('div');
        tempQR.append(tempDiv);
        await new Promise(r => setTimeout(r, 40));
        
        let canvas = tempDiv.querySelector('canvas');
        if (this.generator.currentOptions.frame && this.generator.currentOptions.frame.style !== 'none') {
          // Temporarily set data for framed generator
          const origData = this.generator.currentOptions.data;
          this.generator.currentOptions.data = item.data;
          canvas = await this.generator.generateFramedCanvas(resolution);
          this.generator.currentOptions.data = origData;
        }

        if (canvas) {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          zip.file(`${item.name}.png`, blob);
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  }
}
