/**
 * Data Builders for standard QR Code payloads
 */

export const DataBuilders = {
  // 1. URL with optional UTM parameters
  url(data) {
    let urlStr = data.url ? data.url.trim() : '';
    if (!urlStr) return '';
    if (!/^https?:\/\//i.test(urlStr)) {
      urlStr = 'https://' + urlStr;
    }

    try {
      const urlObj = new URL(urlStr);
      if (data.utmSource) urlObj.searchParams.set('utm_source', data.utmSource.trim());
      if (data.utmMedium) urlObj.searchParams.set('utm_medium', data.utmMedium.trim());
      if (data.utmCampaign) urlObj.searchParams.set('utm_campaign', data.utmCampaign.trim());
      if (data.utmTerm) urlObj.searchParams.set('utm_term', data.utmTerm.trim());
      if (data.utmContent) urlObj.searchParams.set('utm_content', data.utmContent.trim());
      return urlObj.toString();
    } catch (e) {
      return urlStr;
    }
  },

  // 2. Free Text / Markdown / Plain Notes
  text(data) {
    return data.text || '';
  },

  // 3. Wi-Fi Configuration (WIFI:S:ssid;T:WPA;P:password;H:true;;)
  wifi(data) {
    const ssid = (data.ssid || '').replace(/([\\;,:"])/g, '\\$1');
    const password = (data.password || '').replace(/([\\;,:"])/g, '\\$1');
    const type = data.encryption || 'WPA';
    const hidden = data.hidden ? 'H:true;' : '';

    if (type === 'nopass') {
      return `WIFI:S:${ssid};T:nopass;${hidden};`;
    }
    return `WIFI:S:${ssid};T:${type};P:${password};${hidden};`;
  },

  // 4. vCard 3.0 Standard Contact
  vcard(data) {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${data.lastName || ''};${data.firstName || ''};;;`,
      `FN:${[data.firstName, data.lastName].filter(Boolean).join(' ')}`
    ];

    if (data.organization) lines.push(`ORG:${data.organization}`);
    if (data.title) lines.push(`TITLE:${data.title}`);
    if (data.phoneMobile) lines.push(`TEL;TYPE=CELL,VOICE:${data.phoneMobile}`);
    if (data.phoneWork) lines.push(`TEL;TYPE=WORK,VOICE:${data.phoneWork}`);
    if (data.email) lines.push(`EMAIL;TYPE=INTERNET,PREF:${data.email}`);
    if (data.website) lines.push(`URL:${data.website.startsWith('http') ? data.website : 'https://' + data.website}`);

    if (data.street || data.city || data.state || data.zip || data.country) {
      lines.push(`ADR;TYPE=WORK:;;${data.street || ''};${data.city || ''};${data.state || ''};${data.zip || ''};${data.country || ''}`);
    }

    if (data.note) lines.push(`NOTE:${data.note.replace(/\n/g, '\\n')}`);
    lines.push('END:VCARD');
    return lines.join('\n');
  },

  // 5. Email (mailto:email@domain.com?subject=...&body=...)
  email(data) {
    if (!data.email) return '';
    const params = [];
    if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
    if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return `mailto:${data.email.trim()}${query}`;
  },

  // 6. Phone Call (tel:+123456789)
  phone(data) {
    return data.phone ? `tel:${data.phone.trim()}` : '';
  },

  // 7. SMS (smsto:+123456789:Message body)
  sms(data) {
    if (!data.phone) return '';
    return `SMSTO:${data.phone.trim()}:${data.message || ''}`;
  },

  // 8. WhatsApp (https://wa.me/number?text=...)
  whatsapp(data) {
    if (!data.phone) return '';
    let cleanPhone = data.phone.replace(/[^0-9]/g, '');
    const message = data.message ? encodeURIComponent(data.message) : '';
    return `https://wa.me/${cleanPhone}${message ? `?text=${message}` : ''}`;
  },

  // 9. Location / Geo coordinates / Google Maps
  location(data) {
    if (data.mode === 'address' && data.address) {
      return `https://maps.google.com/?q=${encodeURIComponent(data.address)}`;
    }
    if (data.latitude && data.longitude) {
      return `geo:${data.latitude.trim()},${data.longitude.trim()}?q=${data.latitude.trim()},${data.longitude.trim()}`;
    }
    return '';
  },

  // 10. Calendar Event (iCalendar standard)
  event(data) {
    const formatDate = (datetimeStr) => {
      if (!datetimeStr) return '';
      const d = new Date(datetimeStr);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${data.title || 'Event'}`
    ];

    if (data.location) lines.push(`LOCATION:${data.location}`);
    if (data.description) lines.push(`DESCRIPTION:${data.description.replace(/\n/g, '\\n')}`);
    if (data.startDate) lines.push(`DTSTART:${formatDate(data.startDate)}`);
    if (data.endDate) lines.push(`DTEND:${formatDate(data.endDate)}`);

    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');
    return lines.join('\n');
  },

  // 11. Crypto & Payments (Bitcoin, Ethereum, Solana, UPI)
  crypto(data) {
    const type = data.cryptoType || 'bitcoin';
    const address = (data.address || '').trim();
    if (!address) return '';

    if (type === 'bitcoin') {
      const params = [];
      if (data.amount) params.push(`amount=${data.amount}`);
      if (data.label) params.push(`label=${encodeURIComponent(data.label)}`);
      if (data.message) params.push(`message=${encodeURIComponent(data.message)}`);
      return `bitcoin:${address}${params.length ? '?' + params.join('&') : ''}`;
    }

    if (type === 'ethereum') {
      const params = [];
      if (data.amount) params.push(`value=${data.amount}`);
      return `ethereum:${address}${params.length ? '?' + params.join('&') : ''}`;
    }

    if (type === 'solana') {
      return `solana:${address}${data.amount ? `?amount=${data.amount}` : ''}`;
    }

    if (type === 'upi') {
      const params = [`pa=${address}`];
      if (data.label) params.push(`pn=${encodeURIComponent(data.label)}`);
      if (data.amount) params.push(`am=${encodeURIComponent(data.amount)}`);
      params.push('cu=INR');
      if (data.message) params.push(`tn=${encodeURIComponent(data.message)}`);
      return `upi://pay?${params.join('&')}`;
    }

    return address;
  },

  // 12. Social Media Hub Multi-Link / Profiles
  social(data) {
    if (data.platform === 'instagram' && data.username) {
      return `https://instagram.com/${data.username.replace('@', '')}`;
    }
    if (data.platform === 'twitter' && data.username) {
      return `https://x.com/${data.username.replace('@', '')}`;
    }
    if (data.platform === 'linkedin' && data.username) {
      return `https://linkedin.com/in/${data.username}`;
    }
    if (data.platform === 'youtube' && data.username) {
      return `https://youtube.com/@${data.username.replace('@', '')}`;
    }
    if (data.platform === 'github' && data.username) {
      return `https://github.com/${data.username}`;
    }
    if (data.platform === 'tiktok' && data.username) {
      return `https://tiktok.com/@${data.username.replace('@', '')}`;
    }
    return data.username || '';
  },

  // 13. App Stores (Dispatcher or Direct Link)
  app(data) {
    if (data.store === 'ios' && data.appId) {
      return `https://apps.apple.com/app/id${data.appId.replace(/[^0-9]/g, '')}`;
    }
    if (data.store === 'android' && data.appId) {
      return `https://play.google.com/store/apps/details?id=${data.appId.trim()}`;
    }
    return data.appId || '';
  }
};
