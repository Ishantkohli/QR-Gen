/**
 * History and Saved Templates Manager using LocalStorage
 */

const HISTORY_KEY = 'qr_studio_history_v1';
const SAVED_TEMPLATES_KEY = 'qr_studio_saved_templates_v1';

export const HistoryManager = {
  getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read history:', e);
      return [];
    }
  },

  addItem(item) {
    try {
      const history = this.getHistory();
      const newItem = {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString(),
        title: item.title || 'QR Code',
        type: item.type || 'url',
        data: item.data,
        previewDataUrl: item.previewDataUrl || '',
        options: item.options
      };

      // Limit to 30 items
      const updated = [newItem, ...history.filter(h => h.data !== newItem.data)].slice(0, 30);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return newItem;
    } catch (e) {
      console.error('Failed to save history item:', e);
      return null;
    }
  },

  deleteItem(id) {
    try {
      const history = this.getHistory();
      const updated = history.filter(h => h.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to delete history item:', e);
      return [];
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  },

  // Custom User Templates
  getSavedTemplates() {
    try {
      const data = localStorage.getItem(SAVED_TEMPLATES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveTemplate(name, options) {
    try {
      const templates = this.getSavedTemplates();
      const newTpl = {
        id: 'tpl_' + Date.now(),
        name: name || 'Custom Style',
        timestamp: new Date().toISOString(),
        options: { ...options }
      };
      templates.push(newTpl);
      localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(templates));
      return newTpl;
    } catch (e) {
      console.error('Failed to save template:', e);
      return null;
    }
  },

  deleteTemplate(id) {
    try {
      const templates = this.getSavedTemplates();
      const updated = templates.filter(t => t.id !== id);
      localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  }
};
