/**
 * QR Code Scanner & Decoder Module
 * Uses jsQR to decode camera feed or uploaded image files.
 */

export class QRScanner {
  constructor({ videoElement, canvasElement, resultCallback, errorCallback }) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.resultCallback = resultCallback;
    this.errorCallback = errorCallback;
    this.stream = null;
    this.animFrameId = null;
    this.isScanning = false;
  }

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (this.errorCallback) this.errorCallback('Camera access is not supported by your browser.');
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', true);
      await this.video.play();
      this.isScanning = true;
      this.scanLoop();
      return true;
    } catch (err) {
      console.error('Camera access error:', err);
      if (this.errorCallback) {
        this.errorCallback(err.name === 'NotAllowedError' ? 'Camera permission was denied.' : 'Unable to access camera.');
      }
      return false;
    }
  }

  stopCamera() {
    this.isScanning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  scanLoop() {
    if (!this.isScanning) return;

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA && this.ctx && typeof jsQR !== 'undefined') {
      this.canvas.height = this.video.videoHeight;
      this.canvas.width = this.video.videoWidth;
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        this.resultCallback(code.data);
        return; // Pause scanning on detect
      }
    }

    this.animFrameId = requestAnimationFrame(() => this.scanLoop());
  }

  /**
   * Decode an uploaded file (Image / Blob)
   */
  async decodeFile(file) {
    if (typeof jsQR === 'undefined') {
      throw new Error('jsQR library not loaded');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const tempCanvas = document.createElement('canvas');
          const ctx = tempCanvas.getContext('2d');
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (code && code.data) {
            resolve(code.data);
          } else {
            reject(new Error('No QR code detected in this image.'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  }
}
