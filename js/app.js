/**
 * QR Studio Pro - Main Application Logic
 */

import { QRGenerator } from './qr-generator.js';
import { DataBuilders } from './data-builders.js';
import { DesignPresets } from './presets.js';
import { HistoryManager } from './history.js';
import { BatchGenerator } from './batch.js';

// Brand SVGs for quick-insert logos (inline SVG data URIs avoid CORS taint issues on export)
const BrandLogos = {
  whatsapp: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2325D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  wifi: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>',
  instagram: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>',
  youtube: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF0000"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  github: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23181717"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>',
  twitter: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  apple: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23000000"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.13 1.83-.99 2.94.88 0 2.16-.52 2.82-1.33z"/></svg>',
  google: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234285F4"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.18 0-5.76-2.58-5.76-5.76 0-3.18 2.58-5.76 5.76-5.76 1.42 0 2.715.518 3.722 1.368l3.047-3.047C18.847 3.513 15.753 2.16 12.24 2.16 6.8 2.16 2.4 6.56 2.4 12s4.4 9.84 9.84 9.84c5.76 0 9.84-3.96 9.84-9.84 0-.6-.06-1.2-.18-1.715H12.24z"/></svg>',
  linkedin: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>',
  spotify: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.12-.779-.18-.899-.54-.12-.42.18-.78.54-.899 4.62-1.02 8.58-.6 11.761 1.32.36.24.479.66.28 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.3-1.98-8.28-2.58-12.18-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.5-1.38 9.96-.72 13.74 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 9.12 8.16 5.58 9.24c-.54.18-1.14-.12-1.32-.66-.18-.54.12-1.14.66-1.32 4.02-1.2 10.74-.96 14.88 1.5.48.3.66.9.36 1.38-.3.42-.9.6-1.38.36z"/></svg>',
  paypal: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300457C"><path d="M20.007 7.027c-.086-1.298-.445-2.278-1.155-3.003C17.755 2.87 16.035 2 13.904 2H5.163c-.457 0-.845.334-.913.785L1.037 23.276a.458.458 0 0 0 .452.525h5.362c.408 0 .753-.298.815-.7L9.363 12.3c.06-.39.397-.68.795-.68h1.22c3.082 0 5.485-1.253 6.136-4.666.026-.145.056-.282.083-.414a5.14 5.14 0 0 0 .41-1.513zM15.42 8.358c-.461 2.42-2.164 2.42-4.349 2.42H9.006c-.198 0-.365.145-.395.34l-.995 6.467-.714 4.67a.153.153 0 0 1-.15.176h-2.58a.153.153 0 0 1-.15-.176L7.1 5.093c.022-.15.152-.26.304-.26h6.495c.708 0 1.282.088 1.699.27.42.183.719.467.893.856.173.388.225.864.156 1.417a2.64 2.64 0 0 1-.227.982z"/></svg>',
  bitcoin: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23F7931A"><path d="M23.638 14.073c-.45-3.005-2.524-4.282-4.887-4.783 2.122-.49 3.716-1.545 3.161-4.28-.507-2.5-2.5-3.412-5.46-3.865L17.1.002h-2.85l1.09 4.38a36.4 36.4 0 0 0-2.31-.55l1.09-4.38h-2.85l-1.09-4.38c-.62-.14-1.25-.28-1.89-.42L11.33.002H8.48l-1.09 4.38c-.58-.13-1.12-.26-1.64-.4l.01-.06H1.93l-.55 2.2s1.49.34 1.46.36c.81.2 1.05.73.93 1.44l-2.22 8.92c.08.04.18.09.28.13l-1.09 4.38h2.85l1.09-4.38c.75.2 1.48.39 2.19.57l-1.09 4.38h2.85l1.09-4.38c2.51.68 4.9.46 5.86-1.95 2.15-.5 3.78-1.44 3.3-4.66.45-1.18.23-2.21-.1-2.9zM10.22 7.22c.32 0 2.21-.08 2.58.74.34.78-.18 1.45-.5 1.45H10.22zm-.98 7.3c.36 0 2.87-.08 3.25.87.35.8-.23 1.54-.59 1.54H9.24z"/></svg>',
  upi: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>',
  mail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'
};

class App {
  constructor() {
    this.currentType = 'url';
    this.generator = null;
    this.batchGenerator = null;
    this.updateDebounceTimer = null;
    this.selectedLogoPreset = null;

    this.init();
  }

  init() {
    // 1. Initialize Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // 2. Initialize QR Generator
    const container = document.getElementById('qrCanvasContainer');
    this.generator = new QRGenerator(container);
    this.batchGenerator = new BatchGenerator(this.generator);

    // 3. Render Brand Logos in panel
    this.renderBrandPresets();

    // 4. Render Design Presets in Modal
    this.renderDesignPresetsModal();

    // 5. Initialize Theme
    this.initTheme();

    // 6. Bind all Event Listeners
    this.bindEvents();

    // 7. Initial QR code generation
    this.triggerUpdate();

    // Re-render lucide after dynamic elements
    setTimeout(() => {
      if (window.lucide) window.lucide.createIcons();
    }, 100);
  }

  // ==========================================
  // Brand Logos & Presets
  // ==========================================
  renderBrandPresets() {
    const grid = document.getElementById('brandPresetsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(BrandLogos).forEach(brand => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'logo-preset-btn';
      btn.title = brand.toUpperCase();
      btn.dataset.brand = brand;

      const img = document.createElement('img');
      img.src = BrandLogos[brand];
      img.alt = brand;
      img.style.width = '24px';
      img.style.height = '24px';
      img.style.objectFit = 'contain';

      btn.appendChild(img);

      btn.addEventListener('click', () => {
        if (this.selectedLogoPreset === brand) {
          // Deselect
          this.selectedLogoPreset = null;
          btn.classList.remove('active');
          document.getElementById('btnRemoveLogo').style.display = 'none';
          this.generator.update({ image: '' });
          this.showToast('Brand logo removed', 'info');
        } else {
          // Select
          grid.querySelectorAll('.logo-preset-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedLogoPreset = brand;
          document.getElementById('btnRemoveLogo').style.display = 'inline-flex';
          this.generator.update({ image: BrandLogos[brand] });
          this.showToast(`Applied ${brand.toUpperCase()} logo`, 'success');
        }
      });

      grid.appendChild(btn);
    });
  }

  renderDesignPresetsModal() {
    const grid = document.getElementById('presetsModalGrid');
    if (!grid) return;
    grid.innerHTML = '';

    DesignPresets.forEach(preset => {
      const card = document.createElement('div');
      card.className = 'preset-card';

      const thumb = document.createElement('div');
      thumb.className = 'preset-preview-thumb';
      thumb.style.background = preset.background || '#ffffff';
      thumb.style.border = '1px solid var(--border-color)';

      // Preview mini canvas inside card
      const miniDiv = document.createElement('div');
      thumb.appendChild(miniDiv);

      const miniQR = new QRCodeStyling({
        width: 80,
        height: 80,
        data: 'https://example.com',
        margin: 2,
        dotsOptions: {
          type: preset.dotsType,
          color: preset.dotsColor,
          gradient: preset.dotsColorType === 'gradient' ? {
            type: preset.gradientType,
            rotation: (preset.gradientRotation * Math.PI) / 180,
            colorStops: [
              { offset: 0, color: preset.dotsColor },
              { offset: 1, color: preset.dotsGradientColor }
            ]
          } : null
        },
        backgroundOptions: { color: preset.background },
        cornersSquareOptions: { type: preset.cornerSquareType, color: preset.cornerSquareColor },
        cornersDotOptions: { type: preset.cornerDotType, color: preset.cornerDotColor }
      });
      miniQR.append(miniDiv);

      const title = document.createElement('div');
      title.className = 'preset-title';
      title.textContent = preset.name;

      const desc = document.createElement('div');
      desc.className = 'preset-desc';
      desc.textContent = preset.desc;

      card.appendChild(thumb);
      card.appendChild(title);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        this.applyPreset(preset);
        this.closeModal('presetsModal');
        this.showToast(`Applied "${preset.name}" preset!`, 'success');
      });

      grid.appendChild(card);
    });
  }

  applyPreset(preset) {
    // 1. Update UI controls to match preset
    // Body Dots
    document.querySelectorAll('#dotStyleTiles .style-tile').forEach(t => {
      t.classList.toggle('active', t.dataset.val === preset.dotsType);
    });

    // Corner Square & Dot
    document.querySelectorAll('#cornerSquareTiles .style-tile').forEach(t => {
      t.classList.toggle('active', t.dataset.val === preset.cornerSquareType);
    });
    document.querySelectorAll('#cornerDotTiles .style-tile').forEach(t => {
      t.classList.toggle('active', t.dataset.val === preset.cornerDotType);
    });

    // Colors
    const isGrad = preset.dotsColorType === 'gradient';
    const radInput = document.querySelector(`input[name="colorMode"][value="${isGrad ? preset.gradientType || 'linear' : 'single'}"]`);
    if (radInput) radInput.checked = true;

    document.getElementById('primaryColorInput').value = preset.dotsColor;
    document.getElementById('primaryColorHex').value = preset.dotsColor.toUpperCase();

    if (isGrad) {
      document.getElementById('gradientColorInput').value = preset.dotsGradientColor;
      document.getElementById('gradientColorHex').value = preset.dotsGradientColor.toUpperCase();
      document.getElementById('gradientAngleSlider').value = preset.gradientRotation || 45;
      document.getElementById('gradientAngleVal').textContent = `${preset.gradientRotation || 45}°`;
      document.getElementById('gradientColorGroup').style.display = 'flex';
      document.getElementById('gradientAngleGroup').style.display = 'flex';
    } else {
      document.getElementById('gradientColorGroup').style.display = 'none';
      document.getElementById('gradientAngleGroup').style.display = 'none';
    }

    document.getElementById('cornerSquareColorInput').value = preset.cornerSquareColor;
    document.getElementById('cornerSquareColorHex').value = preset.cornerSquareColor.toUpperCase();

    document.getElementById('cornerDotColorInput').value = preset.cornerDotColor;
    document.getElementById('cornerDotColorHex').value = preset.cornerDotColor.toUpperCase();

    document.getElementById('bgColorInput').value = preset.background || '#ffffff';
    document.getElementById('bgColorHex').value = (preset.background || '#ffffff').toUpperCase();
    document.getElementById('bgTransparent').checked = preset.background === 'transparent';

    // Frame
    document.querySelectorAll('#frameStyleTiles .style-tile').forEach(t => {
      t.classList.toggle('active', t.dataset.val === (preset.frame || 'none'));
    });
    document.getElementById('frameOptionsGroup').style.display = (preset.frame && preset.frame !== 'none') ? 'block' : 'none';

    if (preset.frameText) document.getElementById('frameTextInput').value = preset.frameText;
    if (preset.frameColor) {
      document.getElementById('frameColorInput').value = preset.frameColor;
      document.getElementById('frameColorHex').value = preset.frameColor.toUpperCase();
    }
    if (preset.frameTextColor) {
      document.getElementById('frameTextColorInput').value = preset.frameTextColor;
      document.getElementById('frameTextColorHex').value = preset.frameTextColor.toUpperCase();
    }

    // Trigger update
    this.triggerUpdate();
  }

  // ==========================================
  // Event Binding
  // ==========================================
  bindEvents() {
    // 1. Data Type Switching
    const typeTabs = document.getElementById('typeTabs');
    typeTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.type-tab-btn');
      if (!btn) return;

      typeTabs.querySelectorAll('.type-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetType = btn.dataset.type;
      this.currentType = targetType;

      // Switch form panel
      document.querySelectorAll('#contentPanels .form-panel').forEach(panel => {
        panel.style.display = panel.dataset.panel === targetType ? 'block' : 'none';
      });

      this.triggerUpdate();
    });

    // 2. Form Inputs Live Listeners
    const contentPanels = document.getElementById('contentPanels');
    contentPanels.addEventListener('input', () => this.triggerUpdate());
    contentPanels.addEventListener('change', () => this.triggerUpdate());

    // Location Mode Radio
    document.querySelectorAll('input[name="locMode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const isAddr = e.target.value === 'address';
        document.getElementById('locAddressGroup').style.display = isAddr ? 'flex' : 'none';
        document.getElementById('locLatGroup').style.display = isAddr ? 'none' : 'flex';
        document.getElementById('locLngGroup').style.display = isAddr ? 'none' : 'flex';
        this.triggerUpdate();
      });
    });

    // 3. Accordions Collapsing
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        item.classList.toggle('active');
      });
    });

    // 4. Style Tiles (Dots, Corner Square, Corner Dot, Frame)
    this.bindTileSelection('dotStyleTiles', () => this.triggerUpdate());
    this.bindTileSelection('cornerSquareTiles', () => this.triggerUpdate());
    this.bindTileSelection('cornerDotTiles', () => this.triggerUpdate());
    this.bindTileSelection('frameStyleTiles', (val) => {
      document.getElementById('frameOptionsGroup').style.display = val !== 'none' ? 'block' : 'none';
      this.triggerUpdate();
    });

    // 5. Color Controls & Mode
    document.querySelectorAll('input[name="colorMode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const isGrad = e.target.value !== 'single';
        document.getElementById('gradientColorGroup').style.display = isGrad ? 'flex' : 'none';
        document.getElementById('gradientAngleGroup').style.display = isGrad ? 'flex' : 'none';
        this.triggerUpdate();
      });
    });

    this.bindColorSync('primaryColorInput', 'primaryColorHex');
    this.bindColorSync('gradientColorInput', 'gradientColorHex');
    this.bindColorSync('cornerSquareColorInput', 'cornerSquareColorHex');
    this.bindColorSync('cornerDotColorInput', 'cornerDotColorHex');
    this.bindColorSync('bgColorInput', 'bgColorHex');
    this.bindColorSync('frameColorInput', 'frameColorHex');
    this.bindColorSync('frameTextColorInput', 'frameTextColorHex');

    // Sliders
    document.getElementById('gradientAngleSlider').addEventListener('input', (e) => {
      document.getElementById('gradientAngleVal').textContent = `${e.target.value}°`;
      this.triggerUpdate();
    });

    document.getElementById('logoSizeSlider').addEventListener('input', (e) => {
      document.getElementById('logoSizeVal').textContent = `${e.target.value}%`;
      this.triggerUpdate();
    });

    document.getElementById('logoMarginSlider').addEventListener('input', (e) => {
      document.getElementById('logoMarginVal').textContent = `${e.target.value}px`;
      this.triggerUpdate();
    });

    document.getElementById('marginSlider').addEventListener('input', (e) => {
      document.getElementById('marginVal').textContent = `${e.target.value}px`;
      this.triggerUpdate();
    });

    document.getElementById('bgTransparent').addEventListener('change', () => this.triggerUpdate());
    document.getElementById('hideDotsBehindLogo').addEventListener('change', () => this.triggerUpdate());
    document.getElementById('frameTextInput').addEventListener('input', () => this.triggerUpdate());
    document.getElementById('errorCorrectionSelect').addEventListener('change', () => this.triggerUpdate());

    // 6. Custom Logo Upload
    const logoFileInput = document.getElementById('logoFileInput');
    document.getElementById('btnUploadLogo').addEventListener('click', () => logoFileInput.click());
    logoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        // Deselect brand icons
        document.querySelectorAll('.logo-preset-btn').forEach(b => b.classList.remove('active'));
        this.selectedLogoPreset = null;

        document.getElementById('btnRemoveLogo').style.display = 'inline-flex';
        this.generator.update({ image: ev.target.result });
        this.showToast('Custom logo uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('btnRemoveLogo').addEventListener('click', () => {
      logoFileInput.value = '';
      document.querySelectorAll('.logo-preset-btn').forEach(b => b.classList.remove('active'));
      this.selectedLogoPreset = null;
      document.getElementById('btnRemoveLogo').style.display = 'none';
      this.generator.update({ image: '' });
      this.showToast('Logo removed', 'info');
    });

    // 7. Export Buttons
    document.getElementById('btnDownloadPng').addEventListener('click', () => this.handleExport('png'));
    document.getElementById('btnDownloadSvg').addEventListener('click', () => this.handleExport('svg'));
    document.getElementById('btnDownloadPdf').addEventListener('click', () => this.handleExport('pdf'));
    document.getElementById('btnDownloadJpeg').addEventListener('click', () => this.handleExport('jpeg'));
    document.getElementById('btnCopyClipboard').addEventListener('click', () => this.handleExport('copy'));
    document.getElementById('btnPrint').addEventListener('click', () => window.print());

    // 8. Custom Template Save
    document.getElementById('btnSaveCustomTemplate').addEventListener('click', () => {
      const name = prompt('Enter a name for your custom style preset:', 'My Brand Style');
      if (!name) return;
      HistoryManager.saveTemplate(name, this.generator.currentOptions);
      this.showToast(`Saved style "${name}" to templates!`, 'success');
    });

    // 9. Modals Trigger
    document.getElementById('btnOpenPresets').addEventListener('click', () => this.openModal('presetsModal'));
    document.getElementById('btnOpenAnalytics').addEventListener('click', () => {
      this.openModal('analyticsModal');
      this.initAnalytics();
    });
    document.getElementById('btnRefreshAnalytics').addEventListener('click', () => {
      this.refreshAnalyticsData();
    });
    document.getElementById('btnOpenBatch').addEventListener('click', () => this.openModal('batchModal'));
    document.getElementById('btnOpenHistory').addEventListener('click', () => {
      this.openModal('historyModal');
      this.renderHistoryModal();
    });

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        this.closeModal(modalId);
      });
    });

    // Click outside modal
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });

    // 11. Batch generator events
    this.bindBatchEvents();

    // 12. History clear
    document.getElementById('btnClearHistory').addEventListener('click', () => {
      if (confirm('Clear all generation history?')) {
        HistoryManager.clearHistory();
        this.renderHistoryModal();
        this.showToast('History cleared', 'info');
      }
    });

    // 13. Theme Toggle
    document.getElementById('themeToggleBtn').addEventListener('click', () => this.toggleTheme());
  }

  bindTileSelection(containerId, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener('click', (e) => {
      const tile = e.target.closest('.style-tile');
      if (!tile) return;

      container.querySelectorAll('.style-tile').forEach(t => t.classList.remove('active'));
      tile.classList.add('active');

      if (callback) callback(tile.dataset.val);
    });
  }

  bindColorSync(pickerId, hexId) {
    const picker = document.getElementById(pickerId);
    const hex = document.getElementById(hexId);
    if (!picker || !hex) return;

    picker.addEventListener('input', () => {
      hex.value = picker.value.toUpperCase();
      this.triggerUpdate();
    });

    hex.addEventListener('change', () => {
      let val = hex.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        picker.value = val;
        hex.value = val.toUpperCase();
        this.triggerUpdate();
      }
    });
  }

  // ==========================================
  // Update & Payload Generation
  // ==========================================
  triggerUpdate() {
    clearTimeout(this.updateDebounceTimer);
    this.updateDebounceTimer = setTimeout(() => {
      this.generateQRCodeFromUI();
    }, 60);
  }

  generateQRCodeFromUI() {
    // 1. Build Payload Data
    const payload = this.buildCurrentPayload();
    if (!payload) return;

    // Update labels
    document.getElementById('payloadTypeLabel').textContent = `Type: ${this.currentType.toUpperCase()}`;
    document.getElementById('payloadLengthLabel').textContent = `${payload.length} characters`;

    // 2. Extract Options from UI
    const dotType = this.getActiveTileVal('dotStyleTiles') || 'rounded';
    const cornerSquareType = this.getActiveTileVal('cornerSquareTiles') || 'extra-rounded';
    const cornerDotType = this.getActiveTileVal('cornerDotTiles') || 'dot';
    const frameStyle = this.getActiveTileVal('frameStyleTiles') || 'none';

    const colorMode = document.querySelector('input[name="colorMode"]:checked')?.value || 'single';
    const primaryColor = document.getElementById('primaryColorInput').value;
    const gradientColor = document.getElementById('gradientColorInput').value;
    const gradientAngle = parseInt(document.getElementById('gradientAngleSlider').value, 10) || 45;

    const cornerSquareColor = document.getElementById('cornerSquareColorInput').value;
    const cornerDotColor = document.getElementById('cornerDotColorInput').value;

    const isTransparent = document.getElementById('bgTransparent').checked;
    const bgColor = isTransparent ? 'transparent' : document.getElementById('bgColorInput').value;

    const logoSize = (parseInt(document.getElementById('logoSizeSlider').value, 10) || 35) / 100;
    const logoMargin = parseInt(document.getElementById('logoMarginSlider').value, 10) || 6;
    const hideBackgroundDots = document.getElementById('hideDotsBehindLogo').checked;

    const frameText = document.getElementById('frameTextInput').value || 'SCAN ME';
    const frameColor = document.getElementById('frameColorInput').value;
    const frameTextColor = document.getElementById('frameTextColorInput').value;

    const errorCorrectionLevel = document.getElementById('errorCorrectionSelect').value;
    const margin = parseInt(document.getElementById('marginSlider').value, 10) || 10;

    // Dots gradient object
    let dotsGradient = null;
    if (colorMode !== 'single') {
      dotsGradient = {
        type: colorMode,
        rotation: (gradientAngle * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: primaryColor },
          { offset: 1, color: gradientColor }
        ]
      };
    }

    const newOptions = {
      data: payload,
      margin: margin,
      qrOptions: {
        errorCorrectionLevel: errorCorrectionLevel
      },
      dotsOptions: {
        type: dotType,
        color: primaryColor,
        gradient: dotsGradient
      },
      cornersSquareOptions: {
        type: cornerSquareType,
        color: cornerSquareColor
      },
      cornersDotOptions: {
        type: cornerDotType,
        color: cornerDotColor
      },
      backgroundOptions: {
        color: bgColor
      },
      imageOptions: {
        imageSize: logoSize,
        margin: logoMargin,
        hideBackgroundDots: hideBackgroundDots,
        crossOrigin: 'anonymous'
      },
      frame: {
        style: frameStyle,
        text: frameText,
        color: frameColor,
        textColor: frameTextColor,
        fontFamily: "Arial, Helvetica, sans-serif"
      }
    };

    this.generator.update(newOptions);
    this.updateScannabilityScore();
  }

  getActiveTileVal(containerId) {
    const active = document.querySelector(`#${containerId} .style-tile.active`);
    return active ? active.dataset.val : null;
  }

  buildCurrentPayload() {
    switch (this.currentType) {
      case 'url':
        return DataBuilders.url({
          url: document.getElementById('inputUrl').value,
          utmSource: document.getElementById('utmSource').value,
          utmMedium: document.getElementById('utmMedium').value,
          utmCampaign: document.getElementById('utmCampaign').value,
          utmContent: document.getElementById('utmContent').value
        });

      case 'vcard':
        return DataBuilders.vcard({
          firstName: document.getElementById('vcardFirstName').value,
          lastName: document.getElementById('vcardLastName').value,
          organization: document.getElementById('vcardOrg').value,
          title: document.getElementById('vcardTitle').value,
          phoneMobile: document.getElementById('vcardPhoneMobile').value,
          email: document.getElementById('vcardEmail').value,
          website: document.getElementById('vcardWebsite').value,
          street: document.getElementById('vcardStreet').value
        });

      case 'wifi':
        return DataBuilders.wifi({
          ssid: document.getElementById('wifiSsid').value,
          password: document.getElementById('wifiPassword').value,
          encryption: document.getElementById('wifiEncryption').value,
          hidden: document.getElementById('wifiHidden').checked
        });

      case 'text':
        return DataBuilders.text({
          text: document.getElementById('inputText').value
        });

      case 'email':
        return DataBuilders.email({
          email: document.getElementById('emailTo').value,
          subject: document.getElementById('emailSubject').value,
          body: document.getElementById('emailBody').value
        });

      case 'whatsapp':
        return DataBuilders.whatsapp({
          phone: document.getElementById('waPhone').value,
          message: document.getElementById('waMessage').value
        });

      case 'sms':
        return DataBuilders.sms({
          phone: document.getElementById('smsPhone').value,
          message: document.getElementById('smsMessage').value
        });

      case 'location': {
        const mode = document.querySelector('input[name="locMode"]:checked')?.value;
        return DataBuilders.location({
          mode: mode,
          address: document.getElementById('locAddress').value,
          latitude: document.getElementById('locLat').value,
          longitude: document.getElementById('locLng').value
        });
      }

      case 'event':
        return DataBuilders.event({
          title: document.getElementById('eventTitle').value,
          location: document.getElementById('eventLocation').value,
          startDate: document.getElementById('eventStart').value,
          endDate: document.getElementById('eventEnd').value,
          description: document.getElementById('eventDesc').value
        });

      case 'crypto':
        return DataBuilders.crypto({
          cryptoType: document.getElementById('cryptoType').value,
          address: document.getElementById('cryptoAddress').value,
          amount: document.getElementById('cryptoAmount').value,
          label: document.getElementById('cryptoLabel').value
        });

      case 'social':
        return DataBuilders.social({
          platform: document.getElementById('socialPlatform').value,
          username: document.getElementById('socialUsername').value
        });

      case 'app':
        return DataBuilders.app({
          store: document.getElementById('appStore').value,
          appId: document.getElementById('appId').value
        });

      default:
        return 'https://example.com';
    }
  }

  // ==========================================
  // Exports & Downloads
  // ==========================================
  async handleExport(format) {
    const res = parseInt(document.getElementById('exportResolutionSelect').value, 10) || 1024;
    const filename = `qr_studio_${this.currentType}_${Date.now()}`;

    try {
      await this.generator.export(format, res, filename);

      if (format === 'copy') {
        this.showToast('QR Code image copied to clipboard!', 'success');
      } else {
        this.showToast(`Exported ${format.toUpperCase()} successfully!`, 'success');
        // Confetti celebration
        if (window.confetti) {
          window.confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      }

      // Record to history
      HistoryManager.addItem({
        type: this.currentType,
        data: this.generator.currentOptions.data,
        options: this.generator.currentOptions
      });

    } catch (err) {
      console.error('Export error:', err);
      this.showToast(err.message || 'Export failed', 'error');
    }
  }

  // ==========================================
  // Contrast Ratio & Visual Scannability Health Score Check
  // ==========================================
  calculateLuminance(hex) {
    let rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    let a = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  hexToRgb(hex) {
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    let fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  getContrastRatio(color1, color2) {
    if (color1 === 'transparent') color1 = '#ffffff';
    if (color2 === 'transparent') color2 = '#ffffff';
    let l1 = this.calculateLuminance(color1);
    let l2 = this.calculateLuminance(color2);
    let lighter = Math.max(l1, l2);
    let darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  updateScannabilityScore() {
    const payload = this.buildCurrentPayload() || '';
    const errorCorrectionLevel = document.getElementById('errorCorrectionSelect').value;
    const isTransparent = document.getElementById('bgTransparent').checked;
    const bgColor = isTransparent ? '#ffffff' : document.getElementById('bgColorInput').value;
    const primaryColor = document.getElementById('primaryColorInput').value;
    
    let score = 100;
    let feedback = [];
    
    // 1. Contrast Check
    const contrast = this.getContrastRatio(primaryColor, bgColor);
    if (contrast < 3.0) {
      score -= 45;
      feedback.push('<span style="color: var(--accent-rose); font-weight: 700;">⚠️ Critical: Low color contrast (' + contrast.toFixed(1) + ':1). Choose a darker QR code color or lighter background.</span>');
    } else if (contrast < 4.5) {
      score -= 20;
      feedback.push('<span style="color: var(--accent-amber); font-weight: 700;">⚠️ Warning: Moderate contrast (' + contrast.toFixed(1) + ':1). Scanners might struggle in low light.</span>');
    } else {
      feedback.push('<span style="color: var(--accent-emerald);">✓ Excellent color contrast ratio (' + contrast.toFixed(1) + ':1).</span>');
    }

    // 2. Data Density Check
    const len = payload.length;
    if (len > 140 && (errorCorrectionLevel === 'L' || errorCorrectionLevel === 'M')) {
      score -= 15;
      feedback.push('<span style="color: var(--accent-amber);">⚠️ Warning: High data density (' + len + ' chars). Switch to Error Correction Q or H for better durability.</span>');
    } else if (len > 220) {
      score -= 10;
      feedback.push('<span style="color: var(--accent-amber);">⚠️ Notice: QR code contains a lot of data. Printing it too small might make it unscannable.</span>');
    } else {
      feedback.push('<span style="color: var(--accent-emerald);">✓ Optimal payload length (' + len + ' chars).</span>');
    }

    // 3. Logo Check
    const isLogo = this.selectedLogoPreset || document.getElementById('logoFileInput').files.length > 0;
    if (isLogo) {
      const logoSize = parseInt(document.getElementById('logoSizeSlider').value, 10);
      if (logoSize > 32 && errorCorrectionLevel !== 'H') {
        score -= 20;
        feedback.push('<span style="color: var(--accent-rose); font-weight: 700;">⚠️ Danger: Large logo overlay (' + logoSize + '%). Set Error Correction Level to H (30%) to prevent scan errors.</span>');
      } else if (logoSize > 32) {
        feedback.push('<span style="color: var(--accent-amber);">✓ Large logo loaded. Verified with Error Correction Level H.</span>');
      } else {
        feedback.push('<span style="color: var(--accent-emerald);">✓ Logo size is within safe bounds (' + logoSize + '%).</span>');
      }
    }

    if (isTransparent) {
      score -= 5;
      feedback.push('<span style="color: var(--text-muted); font-size: 0.7rem;">ℹ️ Transparency enabled. Ensure you print the QR code on a light background.</span>');
    }

    score = Math.max(10, Math.min(100, score));

    // Update UI elements
    const scoreValEl = document.getElementById('scannabilityScoreVal');
    const progressBarEl = document.getElementById('scannabilityProgressBar');
    const feedbackEl = document.getElementById('scannabilityFeedback');

    if (scoreValEl && progressBarEl && feedbackEl) {
      progressBarEl.style.width = `${score}%`;
      feedbackEl.innerHTML = feedback.join('');

      if (score >= 80) {
        scoreValEl.textContent = `${score}% Excellent`;
        scoreValEl.style.color = 'var(--accent-emerald)';
        progressBarEl.style.background = 'var(--accent-emerald)';
      } else if (score >= 50) {
        scoreValEl.textContent = `${score}% Good`;
        scoreValEl.style.color = 'var(--accent-amber)';
        progressBarEl.style.background = 'var(--accent-amber)';
      } else {
        scoreValEl.textContent = `${score}% Critical`;
        scoreValEl.style.color = 'var(--accent-rose)';
        progressBarEl.style.background = 'var(--accent-rose)';
      }
    }
  }

  // ==========================================
  // Campaign Analytics Simulator
  // ==========================================
  initAnalytics() {
    this.refreshAnalyticsData(true);
  }

  refreshAnalyticsData(isFirst = false) {
    if (!isFirst) {
      this.showToast('Refreshing live tracking statistics...', 'info');
    }

    const totalScans = Math.floor(20000 + Math.random() * 8000);
    const uniqueUsers = Math.floor(totalScans * 0.73 + Math.random() * 500);
    const conversion = (uniqueUsers / totalScans * 100).toFixed(1);

    document.getElementById('statTotalScans').textContent = totalScans.toLocaleString();
    document.getElementById('statUniqueScanners').textContent = uniqueUsers.toLocaleString();
    document.getElementById('statConvRate').textContent = `${conversion}%`;

    const bars = ['chartBar1', 'chartBar2', 'chartBar3', 'chartBar4', 'chartBar5', 'chartBar6'];
    bars.forEach(barId => {
      const el = document.getElementById(barId);
      if (el) {
        const height = Math.floor(40 + Math.random() * 80);
        el.style.height = `${height}px`;
      }
    });

    if (!isFirst) {
      setTimeout(() => {
        this.showToast('Analytics dashboard updated successfully!', 'success');
      }, 300);
    }
  }

  // ==========================================
  // Batch Generator Implementation
  // ==========================================
  bindBatchEvents() {
    document.getElementById('btnBatchSample').addEventListener('click', () => {
      const sample = `https://myshop.com/promo1, summer_sale
https://myshop.com/promo2, winter_discount
https://myshop.com/vip, vip_member_pass
WIFI:S:OfficeWifi;T:WPA;P:SecretPass123;;, wifi_card`;
      document.getElementById('batchInputText').value = sample;
    });

    document.getElementById('btnStartBatch').addEventListener('click', async () => {
      const text = document.getElementById('batchInputText').value.trim();
      if (!text) {
        this.showToast('Please enter at least one URL or payload', 'error');
        return;
      }

      const items = this.batchGenerator.parseInput(text);
      if (items.length === 0) {
        this.showToast('No valid items found', 'error');
        return;
      }

      const format = document.getElementById('batchFormatSelect').value;
      const res = parseInt(document.getElementById('batchResSelect').value, 10) || 1024;

      const progressWrapper = document.getElementById('batchProgressWrapper');
      const progressBar = document.getElementById('batchProgressBar');
      const progressLabel = document.getElementById('batchProgressLabel');
      const progressPercent = document.getElementById('batchProgressPercent');
      const btnStart = document.getElementById('btnStartBatch');

      progressWrapper.style.display = 'block';
      btnStart.disabled = true;

      try {
        const zipBlob = await this.batchGenerator.generateZip(items, {
          format,
          resolution: res,
          onProgress: (current, total, name) => {
            const pct = Math.round((current / total) * 100);
            progressBar.style.width = `${pct}%`;
            progressPercent.textContent = `${pct}%`;
            progressLabel.textContent = `Generated ${current}/${total}: ${name}`;
          }
        });

        // Download zip
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `qr_batch_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast(`Batch completed! Downloaded ${items.length} QR codes.`, 'success');
        if (window.confetti) window.confetti();
      } catch (err) {
        console.error('Batch failed:', err);
        this.showToast('Batch generation error: ' + err.message, 'error');
      } finally {
        btnStart.disabled = false;
        setTimeout(() => {
          progressWrapper.style.display = 'none';
        }, 2000);
      }
    });
  }

  // ==========================================
  // History Modal Rendering
  // ==========================================
  renderHistoryModal() {
    const container = document.getElementById('historyListContainer');
    if (!container) return;

    const history = HistoryManager.getHistory();
    if (history.length === 0) {
      container.innerHTML = `
        <div class="history-empty">
          <i data-lucide="inbox" style="width: 48px; height: 48px; margin-bottom: 0.5rem; opacity: 0.4;"></i>
          <p>No history yet. Generate your first QR code to save here.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = '';
    history.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item-row';

      const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      row.innerHTML = `
        <div class="history-item-info">
          <div class="history-item-title">${item.type.toUpperCase()} • ${dateStr}</div>
          <div class="history-item-subtitle" title="${item.data}">${item.data}</div>
        </div>
        <div style="display: flex; gap: 0.4rem; flex-shrink: 0;">
          <button type="button" class="btn-secondary btn-restore" title="Load into Studio" style="padding: 0.4rem 0.6rem;">
            <i data-lucide="corner-up-left"></i>
          </button>
          <button type="button" class="btn-secondary btn-del" title="Delete" style="padding: 0.4rem 0.6rem; color: var(--accent-rose);">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;

      row.querySelector('.btn-restore').addEventListener('click', () => {
        if (item.options) {
          this.generator.update(item.options);
          this.closeModal('historyModal');
          this.showToast('Loaded QR code settings from history!', 'success');
        }
      });

      row.querySelector('.btn-del').addEventListener('click', () => {
        HistoryManager.deleteItem(item.id);
        this.renderHistoryModal();
      });

      container.appendChild(row);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // ==========================================
  // Modal Helpers
  // ==========================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
    if (modalId === 'analyticsModal') {
      console.log('Analytics Simulator closed');
    }
  }

  // ==========================================
  // Theme Toggle
  // ==========================================
  initTheme() {
    const saved = localStorage.getItem('qr_studio_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeIcon(saved);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('qr_studio_theme', next);
    this.updateThemeIcon(next);
  }

  updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    if (theme === 'dark') {
      icon.setAttribute('data-lucide', 'sun');
    } else {
      icon.setAttribute('data-lucide', 'moon');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // ==========================================
  // Toast Notification System
  // ==========================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
    toast.innerHTML = `<i data-lucide="${iconName}"></i><span>${message}</span>`;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
