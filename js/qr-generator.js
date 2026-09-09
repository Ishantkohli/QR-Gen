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

    if (!this._rawWrapper) {
      this._rawWrapper = document.createElement('div');
      this._rawWrapper.className = 'qr-raw-wrapper';
      this.qrCode.append(this._rawWrapper);
    }

    // Wait on drawing promise or frame
    if (this.qrCode._canvasDrawingPromise) {
      await this.qrCode._canvasDrawingPromise;
    } else {
      await new Promise(r => requestAnimationFrame(r));
    }

    // If frame is enabled, render framed version
    if (this.currentOptions.frame && this.currentOptions.frame.style !== 'none') {
      const framedCanvas = await this.generateFramedCanvas(320);
      if (framedCanvas) {
        this.container.innerHTML = '';
        this.container.appendChild(framedCanvas);
      }
    } else {
      if (this.container.firstChild !== this._rawWrapper) {
        this.container.innerHTML = '';
        this.container.appendChild(this._rawWrapper);
      }
    }
  }

  /**
   * Generates a framed canvas with high quality rendering
   */
  async generateFramedCanvas(targetSize = 1024) {
    const tempOpts = {
      ...this.getCleanLibraryOptions(),
      width: targetSize,
      height: targetSize
    };
    const tempQR = new QRCodeStyling(tempOpts);
    const tempDiv = document.createElement('div');
    tempQR.append(tempDiv);

    if (tempQR._canvasDrawingPromise) {
      await tempQR._canvasDrawingPromise;
    } else {
      await new Promise(r => requestAnimationFrame(r));
    }

    const rawCanvas = tempDiv.querySelector('canvas') || (tempQR._canvas ? tempQR._canvas.getCanvas() : null);
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

    } else if (frame.style === 'corner-brackets') {
      const padding = 28 * scale;
      const bottomHeight = frameText ? 44 * scale : 0;
      const cornerRadius = 24 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2) + bottomHeight;

      // Draw outer background card
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.stroke();

      // Draw QR Code
      ctx.drawImage(rawCanvas, padding, padding, qrSize, qrSize);

      // Draw 4 Corner Brackets around QR code
      const bracketLen = 34 * scale;
      const bracketStroke = 8 * scale;
      const bracketRadius = 14 * scale;
      const bX = padding - (10 * scale);
      const bY = padding - (10 * scale);
      const bW = qrSize + (20 * scale);
      const bH = qrSize + (20 * scale);

      ctx.strokeStyle = frameColor;
      ctx.lineWidth = bracketStroke;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Top-Left bracket
      ctx.beginPath();
      ctx.moveTo(bX, bY + bracketLen);
      ctx.lineTo(bX, bY + bracketRadius);
      ctx.arcTo(bX, bY, bX + bracketRadius, bY, bracketRadius);
      ctx.lineTo(bX + bracketLen, bY);
      ctx.stroke();

      // Top-Right bracket
      ctx.beginPath();
      ctx.moveTo(bX + bW - bracketLen, bY);
      ctx.lineTo(bX + bW - bracketRadius, bY);
      ctx.arcTo(bX + bW, bY, bX + bW, bY + bracketRadius, bracketRadius);
      ctx.lineTo(bX + bW, bY + bracketLen);
      ctx.stroke();

      // Bottom-Left bracket
      ctx.beginPath();
      ctx.moveTo(bX, bY + bH - bracketLen);
      ctx.lineTo(bX, bY + bH - bracketRadius);
      ctx.arcTo(bX, bY + bH, bX + bracketRadius, bY + bH, bracketRadius);
      ctx.lineTo(bX + bracketLen, bY + bH);
      ctx.stroke();

      // Bottom-Right bracket
      ctx.beginPath();
      ctx.moveTo(bX + bW - bracketLen, bY + bH);
      ctx.lineTo(bX + bW - bracketRadius, bY + bH);
      ctx.arcTo(bX + bW, bY + bH, bX + bW, bY + bH - bracketRadius, bracketRadius);
      ctx.lineTo(bX + bW, bY + bH - bracketLen);
      ctx.stroke();

      if (frameText) {
        ctx.fillStyle = frameColor;
        ctx.font = `800 ${18 * scale}px ${frame.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, finalCanvas.width / 2, qrSize + padding + (22 * scale));
      }

    } else if (frame.style === 'circle-badge' || frame.style === 'circle-outline') {
      const padding = 32 * scale;
      const bottomHeight = frame.style === 'circle-badge' && frameText ? 44 * scale : 0;
      const cornerRadius = 24 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2) + bottomHeight;

      // Background Card
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.stroke();

      // Draw Circular Ring
      const centerX = finalCanvas.width / 2;
      const centerY = padding + (qrSize / 2);
      const radius = (qrSize / 2) + (14 * scale);

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 6 * scale;
      ctx.stroke();
      ctx.restore();

      // Draw QR code inside circle
      ctx.drawImage(rawCanvas, padding, padding, qrSize, qrSize);

      // If badge with text, draw pill button at bottom
      if (frame.style === 'circle-badge' && frameText) {
        const btnWidth = Math.min(qrSize * 0.72, 190 * scale);
        const btnHeight = 38 * scale;
        const btnX = centerX - (btnWidth / 2);
        const btnY = centerY + radius - (btnHeight / 2) + (6 * scale);

        ctx.fillStyle = frameColor;
        this.roundRect(ctx, btnX, btnY, btnWidth, btnHeight, btnHeight / 2);
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.font = `bold ${14 * scale}px ${frame.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, centerX, btnY + (btnHeight / 2));
      }

    } else if (frame.style === 'hexagon-badge' || frame.style === 'hexagon-outline') {
      const padding = 34 * scale;
      const bottomHeight = frame.style === 'hexagon-badge' && frameText ? 44 * scale : 0;
      const cornerRadius = 24 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2) + bottomHeight;

      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.stroke();

      const centerX = finalCanvas.width / 2;
      const centerY = padding + (qrSize / 2);
      const hexRadius = (qrSize / 2) + (18 * scale);

      // Draw Hexagon Border
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) - (Math.PI / 6);
        const hx = centerX + hexRadius * Math.cos(angle);
        const hy = centerY + hexRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 6 * scale;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();

      // Draw QR Code
      ctx.drawImage(rawCanvas, padding, padding, qrSize, qrSize);

      if (frame.style === 'hexagon-badge' && frameText) {
        const btnWidth = Math.min(qrSize * 0.8, 210 * scale);
        const btnHeight = 36 * scale;
        const btnX = centerX - (btnWidth / 2);
        const btnY = qrSize + padding + (12 * scale);

        ctx.fillStyle = frameColor;
        this.roundRect(ctx, btnX, btnY, btnWidth, btnHeight, btnHeight / 2);
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.font = `bold ${14 * scale}px ${frame.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, centerX, btnY + (btnHeight / 2));
      }

    } else if (frame.style === 'ribbon') {
      const padding = 24 * scale;
      const bottomHeight = 60 * scale;
      const cornerRadius = 24 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2) + bottomHeight;

      // Card
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.stroke();

      // Draw QR Code
      ctx.drawImage(rawCanvas, padding, padding, qrSize, qrSize);

      // Draw 3D Ribbon Banner
      const ribW = qrSize + (12 * scale);
      const ribH = 38 * scale;
      const ribX = (finalCanvas.width - ribW) / 2;
      const ribY = qrSize + padding + (10 * scale);
      const foldW = 16 * scale;

      // Ribbon Fold Tails (Darker shade)
      ctx.fillStyle = this.adjustColorBrightness(frameColor, -25);
      // Left tail
      ctx.beginPath();
      ctx.moveTo(ribX, ribY + (6 * scale));
      ctx.lineTo(ribX - foldW, ribY + (6 * scale));
      ctx.lineTo(ribX - (foldW * 0.6), ribY + (6 * scale) + (ribH / 2));
      ctx.lineTo(ribX - foldW, ribY + ribH + (6 * scale));
      ctx.lineTo(ribX, ribY + ribH);
      ctx.closePath();
      ctx.fill();

      // Right tail
      ctx.beginPath();
      ctx.moveTo(ribX + ribW, ribY + (6 * scale));
      ctx.lineTo(ribX + ribW + foldW, ribY + (6 * scale));
      ctx.lineTo(ribX + ribW + (foldW * 0.6), ribY + (6 * scale) + (ribH / 2));
      ctx.lineTo(ribX + ribW + foldW, ribY + ribH + (6 * scale));
      ctx.lineTo(ribX + ribW, ribY + ribH);
      ctx.closePath();
      ctx.fill();

      // Main Ribbon Body
      ctx.fillStyle = frameColor;
      ctx.fillRect(ribX, ribY, ribW, ribH);

      // Text on Ribbon
      ctx.fillStyle = textColor;
      ctx.font = `800 ${16 * scale}px ${frame.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frameText, finalCanvas.width / 2, ribY + (ribH / 2));

    } else if (frame.style === 'tooltip-bubble') {
      const padding = 24 * scale;
      const bottomHeight = 64 * scale;
      const cornerRadius = 24 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2) + bottomHeight;

      // Card
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.stroke();

      // Draw QR Code
      ctx.drawImage(rawCanvas, padding, padding, qrSize, qrSize);

      // Draw Tooltip Bubble at bottom
      const bubbleW = qrSize;
      const bubbleH = 42 * scale;
      const bubbleX = padding;
      const bubbleY = qrSize + padding + (12 * scale);
      const arrowW = 16 * scale;
      const arrowH = 8 * scale;
      const centerX = finalCanvas.width / 2;

      ctx.fillStyle = frameColor;
      this.roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 12 * scale);
      ctx.fill();

      // Pointer triangle pointing UP
      ctx.beginPath();
      ctx.moveTo(centerX - (arrowW / 2), bubbleY);
      ctx.lineTo(centerX, bubbleY - arrowH);
      ctx.lineTo(centerX + (arrowW / 2), bubbleY);
      ctx.closePath();
      ctx.fill();

      // Bubble text
      ctx.fillStyle = textColor;
      ctx.font = `bold ${16 * scale}px ${frame.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frameText, centerX, bubbleY + (bubbleH / 2));

    } else if (frame.style === 'phone') {
      const padding = 20 * scale;
      const topBezel = 38 * scale;
      const bottomBezel = 58 * scale;
      const cornerRadius = 34 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + topBezel + bottomBezel;

      // Smartphone outer body
      ctx.fillStyle = frameColor;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      // Screen area (white)
      const screenX = 8 * scale;
      const screenY = topBezel;
      const screenW = finalCanvas.width - (screenX * 2);
      const screenH = qrSize + (padding * 2) - 8 * scale;

      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, screenX, screenY, screenW, screenH, 18 * scale);
      ctx.fill();

      // Speaker notch & camera dot at top
      ctx.fillStyle = '#ffffff';
      const speakerW = 44 * scale;
      const speakerH = 5 * scale;
      this.roundRect(ctx, (finalCanvas.width - speakerW) / 2, 16 * scale, speakerW, speakerH, speakerH / 2);
      ctx.fill();

      // Draw QR Code inside screen
      ctx.drawImage(rawCanvas, padding, topBezel + (6 * scale), qrSize, qrSize);

      // Bottom Button / Pill
      const btnW = 140 * scale;
      const btnH = 34 * scale;
      const btnX = (finalCanvas.width - btnW) / 2;
      const btnY = finalCanvas.height - bottomBezel + (12 * scale);

      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, btnX, btnY, btnW, btnH, btnH / 2);
      ctx.fill();

      ctx.fillStyle = frameColor;
      ctx.font = `800 ${15 * scale}px ${frame.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frameText, finalCanvas.width / 2, btnY + (btnH / 2));

    } else if (frame.style === 'dashed-circle') {
      const padding = 30 * scale;
      const cornerRadius = 24 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2);

      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.stroke();

      // Draw Dashed Circle
      const centerX = finalCanvas.width / 2;
      const centerY = finalCanvas.height / 2;
      const radius = (qrSize / 2) + (14 * scale);

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 4 * scale;
      ctx.setLineDash([8 * scale, 6 * scale]);
      ctx.stroke();
      ctx.restore();

      ctx.drawImage(rawCanvas, padding, padding, qrSize, qrSize);

    } else if (frame.style === 'arch-card') {
      const padding = 20 * scale;
      const bottomHeight = 64 * scale;
      const cornerRadius = 28 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2) + bottomHeight;

      // Solid color background card
      ctx.fillStyle = frameColor;
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      // Inner white rounded square for QR code
      const innerX = 12 * scale;
      const innerY = 12 * scale;
      const innerW = finalCanvas.width - (innerX * 2);
      const innerH = qrSize + (padding * 2) - (12 * scale);

      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, innerX, innerY, innerW, innerH, cornerRadius - 6);
      ctx.fill();

      // Draw QR Code
      ctx.drawImage(rawCanvas, padding, padding, qrSize, qrSize);

      // Bottom text
      ctx.fillStyle = textColor;
      ctx.font = `italic bold ${20 * scale}px ${frame.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frameText, finalCanvas.width / 2, finalCanvas.height - (bottomHeight / 2) + (4 * scale));

    } else if (frame.style === 'simple-box') {
      const padding = 20 * scale;
      const cornerRadius = 18 * scale;

      finalCanvas.width = qrSize + (padding * 2);
      finalCanvas.height = qrSize + (padding * 2);

      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, 0, 0, finalCanvas.width, finalCanvas.height, cornerRadius);
      ctx.fill();

      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 6 * scale;
      this.roundRect(ctx, 8 * scale, 8 * scale, finalCanvas.width - (16 * scale), finalCanvas.height - (16 * scale), cornerRadius - 4);
      ctx.stroke();

      ctx.drawImage(rawCanvas, padding, padding, qrSize, qrSize);
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

  adjustColorBrightness(hex, percent) {
    hex = (hex || '#2563eb').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
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
