/**
 * QR Generator Core Engine
 * Integrates QRCodeStyling with custom frames, branding, and multi-format exports.
 */

export class QRGenerator {
  constructor(containerElement) {
    this.container = containerElement;
    this.qrCode = null;
    this.currentOptions = this.getDefaultOptions();
    this.init();
  }

  getDefaultOptions() {
    return {
      width: 320,
      height: 320,
      type: 'canvas',
      data: 'https://example.com',
      image: '',
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'Q'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.35,
        margin: 6,
        crossOrigin: 'anonymous'
      },
      dotsOptions: {
        type: 'rounded',
        color: '#2563eb',
        gradient: null
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#1d4ed8'
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#2563eb'
      },
      // Extended properties for frames
      frame: {
        style: 'none', // 'none' | 'bottom-badge' | 'top-banner' | 'card-border' | 'phone'
        text: 'SCAN ME',
        color: '#2563eb',
        textColor: '#ffffff',
        fontFamily: "Arial, Helvetica, sans-serif"
      }
    };
  }

  init() {
    if (typeof QRCodeStyling === 'undefined') {
      console.error('QRCodeStyling library not loaded');
      return;
    }
    this.qrCode = new QRCodeStyling(this.getCleanLibraryOptions());
    this.render();
  }

  getCleanLibraryOptions() {
    const opts = { ...this.currentOptions };
    // Extract base options recognized by QRCodeStyling
    const libOpts = {
      width: opts.width || 320,
      height: opts.height || 320,
      type: 'canvas',
      data: opts.data || 'https://example.com',
      margin: opts.margin !== undefined ? opts.margin : 10,
      qrOptions: opts.qrOptions,
      imageOptions: opts.imageOptions,
      dotsOptions: opts.dotsOptions,
      backgroundOptions: opts.backgroundOptions,
      cornersSquareOptions: opts.cornersSquareOptions,
      cornersDotOptions: opts.cornersDotOptions
    };

    if (opts.image && opts.image.trim() !== '') {
      libOpts.image = opts.image;
    } else {
      libOpts.image = '';
    }

    return libOpts;
  }

  update(newOptions) {
    this.currentOptions = {
      ...this.currentOptions,
      ...newOptions,
      frame: {
        ...this.currentOptions.frame,
        ...(newOptions.frame || {})
      },
      dotsOptions: {
        ...this.currentOptions.dotsOptions,
        ...(newOptions.dotsOptions || {})
      },
      backgroundOptions: {
        ...this.currentOptions.backgroundOptions,
        ...(newOptions.backgroundOptions || {})
      },
      cornersSquareOptions: {
        ...this.currentOptions.cornersSquareOptions,
        ...(newOptions.cornersSquareOptions || {})
      },
      cornersDotOptions: {
        ...this.currentOptions.cornersDotOptions,
        ...(newOptions.cornersDotOptions || {})
      },
      imageOptions: {
        ...this.currentOptions.imageOptions,
        ...(newOptions.imageOptions || {})
      }
    };

    if (!this.qrCode) {
      this.init();
      return;
    }

    this.qrCode.update(this.getCleanLibraryOptions());
    this.render();
  }

  async render() {
    if (!this.qrCode || !this.container) return;
    this.container.innerHTML = '';

    // Render raw QR code inside temporary or container
    const rawWrapper = document.createElement('div');
    rawWrapper.className = 'qr-raw-wrapper';
    this.qrCode.append(rawWrapper);

    // Wait slightly for canvas render
    await new Promise(resolve => setTimeout(resolve, 50));

    // If frame is enabled, render framed version
    if (this.currentOptions.frame && this.currentOptions.frame.style !== 'none') {
      const framedCanvas = await this.generateFramedCanvas(320);
      this.container.innerHTML = '';
      this.container.appendChild(framedCanvas);
    } else {
      this.container.innerHTML = '';
      this.container.appendChild(rawWrapper);
    }
  }

  /**
   * Generates a framed canvas with high quality rendering
   */
  async generateFramedCanvas(targetSize = 1024) {
    // Generate raw canvas at requested resolution
    const tempOpts = {
      ...this.getCleanLibraryOptions(),
      width: targetSize,
      height: targetSize
    };
    const tempQR = new QRCodeStyling(tempOpts);
    const tempDiv = document.createElement('div');
    tempQR.append(tempDiv);
    await new Promise(r => setTimeout(r, 60));

    const rawCanvas = tempDiv.querySelector('canvas');
    if (!rawCanvas) return null;

    const frame = this.currentOptions.frame || { style: 'none' };
    if (frame.style === 'none') {
      return rawCanvas;
    }

    const scale = targetSize / 320;
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');

    const qrSize = targetSize;
    const frameColor = frame.color || '#2563eb';
    const textColor = frame.textColor || '#ffffff';
    const frameText = frame.text || 'SCAN ME';

    if (frame.style === 'bottom-badge') {
      const padding = 24 * scale;
      const bannerHeight = 64 * scale;
      const cornerRadius = 24 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2) + bannerHeight;

      // Draw outer background card
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      // Shadow / border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.stroke();

      // Draw QR Code
      ctx.drawImage(rawCanvas, padding, padding, qrSize, qrSize);

      // Draw Bottom Badge Button
      const btnX = padding;
      const btnY = qrSize + padding + (8 * scale);
      const btnWidth = qrSize;
      const btnHeight = 48 * scale;
      const btnRadius = 14 * scale;

      ctx.fillStyle = frameColor;
      this.roundRect(ctx, btnX, btnY, btnWidth, btnHeight, btnRadius);
      ctx.fill();

      // Draw text
      ctx.fillStyle = textColor;
      ctx.font = `bold ${18 * scale}px ${frame.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frameText.toUpperCase(), btnX + (btnWidth / 2), btnY + (btnHeight / 2));

    } else if (frame.style === 'top-banner') {
      const padding = 24 * scale;
      const bannerHeight = 64 * scale;
      const cornerRadius = 24 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2) + bannerHeight;

      // Draw card
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.stroke();

      // Draw Top Banner
      const btnX = padding;
      const btnY = padding;
      const btnWidth = qrSize;
      const btnHeight = 48 * scale;
      const btnRadius = 14 * scale;

      ctx.fillStyle = frameColor;
      this.roundRect(ctx, btnX, btnY, btnWidth, btnHeight, btnRadius);
      ctx.fill();

      // Draw text
      ctx.fillStyle = textColor;
      ctx.font = `bold ${18 * scale}px ${frame.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frameText.toUpperCase(), btnX + (btnWidth / 2), btnY + (btnHeight / 2));

      // Draw QR Code below
      ctx.drawImage(rawCanvas, padding, padding + bannerHeight, qrSize, qrSize);

    } else if (frame.style === 'card-border') {
      const borderWidth = 16 * scale;
      const padding = 20 * scale;
      const bottomHeight = 50 * scale;
      const cornerRadius = 28 * scale;

      finalCanvas.width = qrSize + ((borderWidth + padding) * 2);
      finalCanvas.height = qrSize + ((borderWidth + padding) * 2) + bottomHeight;

      // Draw thick border background
      ctx.fillStyle = frameColor;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      // Inner white card
      const innerX = borderWidth;
      const innerY = borderWidth;
      const innerW = finalCanvas.width - (borderWidth * 2);
      const innerH = finalCanvas.height - (borderWidth * 2);

      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, innerX, innerY, innerW, innerH, cornerRadius - 8);
      ctx.fill();

      // Draw QR Code
      ctx.drawImage(rawCanvas, borderWidth + padding, borderWidth + padding, qrSize, qrSize);

      // Draw Bottom CTA
      ctx.fillStyle = frameColor;
      ctx.font = `800 ${19 * scale}px ${frame.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frameText.toUpperCase(), finalCanvas.width / 2, finalCanvas.height - borderWidth - (bottomHeight / 2));
    }

    return finalCanvas;
  }

  roundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'undefined') radius = 5;
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
  }

  /**
   * Export to file
   */
  async export(format = 'png', resolution = 1024, filename = 'qr-code') {
    const isFramed = this.currentOptions.frame && this.currentOptions.frame.style !== 'none';

    if (format === 'svg' && !isFramed) {
      // Direct vector SVG download via library
      const svgQR = new QRCodeStyling({
        ...this.getCleanLibraryOptions(),
        type: 'svg',
        width: resolution,
        height: resolution
      });
      await svgQR.download({ name: filename, extension: 'svg' });
      return;
    }

    // Canvas-based export (PNG, JPEG, WEBP, PDF)
    let canvas;
    if (isFramed) {
      canvas = await this.generateFramedCanvas(resolution);
    } else {
      const tempQR = new QRCodeStyling({
        ...this.getCleanLibraryOptions(),
        type: 'canvas',
        width: resolution,
        height: resolution
      });
      const tempDiv = document.createElement('div');
      tempQR.append(tempDiv);
      await new Promise(r => setTimeout(r, 60));
      canvas = tempDiv.querySelector('canvas');
    }

    if (!canvas) {
      throw new Error('Failed to generate export canvas');
    }

    if (format === 'pdf') {
      this.exportPDF(canvas, filename);
      return;
    }

    if (format === 'copy') {
      await this.copyToClipboard(canvas);
      return;
    }

    // Download image
    const mimeType = format === 'jpeg' || format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportPDF(canvas, filename) {
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      alert('PDF generator library loading. Please try again.');
      return;
    }
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Center on page
    const qrWidth = 120;
    const qrHeight = (canvas.height / canvas.width) * qrWidth;
    const x = (pageWidth - qrWidth) / 2;
    const y = (pageHeight - qrHeight) / 2 - 15;

    // Add clean header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('Scan QR Code', pageWidth / 2, y - 20, { align: 'center' });

    // Add QR image
    doc.addImage(imgData, 'PNG', x, y, qrWidth, qrHeight);

    // Add footer caption
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('Generated with QR Studio • High Resolution Print', pageWidth / 2, y + qrHeight + 20, { align: 'center' });

    doc.save(`${filename}.pdf`);
  }

  async copyToClipboard(canvas) {
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error('Clipboard image copy not supported in this browser');
    }
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error('Canvas blob conversion failed'));
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 'image/png');
    });
  }
}
