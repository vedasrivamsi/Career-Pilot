'use strict';

const UI = {

  // Resource type icons (SVG strings)
  icons: {
    youtube: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.8 8S21.6 6.6 21 6c-.7-.7-1.5-.7-1.9-.8C16.8 5 12 5 12 5s-4.8 0-7.1.2c-.4.1-1.2.1-1.9.8-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.7.7 1.6.7 2 .8C6.4 19 12 19 12 19s4.8 0 7.1-.3c.4-.1 1.2-.1 1.9-.8.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM10 15V9l6 3-6 3z"/></svg>`,
    docs:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    practice:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    arrow:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
    chevron: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`,
    clock:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    star:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    back:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
    ext:     `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  },

  /* ────────────────────────────────────────────
     renderCards(items, category)
  ──────────────────────────────────────────── */
  renderCards(items, category) {
    const grid = document.getElementById('cardsGrid');
    grid.innerHTML = '';

    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'roadmap-card';
      card.dataset.id = item.id;
      card.dataset.cat = category;
      card.style.setProperty('--card-gradient', item.gradient);
      card.style.setProperty('--card-color', item.color);
      card.style.animationDelay = `${i * 0.06}s`;

      // Difficulty class
      const diffClass = 'diff-' + (item.difficulty || 'Intermediate').split('–')[0].trim().split(' ')[0];

      const tagsHtml = (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

      // For year cards show subjects instead of tags
      const extraInfo = category === 'years' && item.subjects
        ? `<div class="card-tags">${item.subjects.slice(0,3).map(s => `<span class="tag">${s}</span>`).join('')}${item.subjects.length > 3 ? `<span class="tag">+${item.subjects.length-3}</span>` : ''}</div>`
        : `<div class="card-tags">${tagsHtml}</div>`;

      card.innerHTML = `
        <button class="bookmark-btn ${App.isBookmarked(item.id) ? 'active' : ''}" aria-label="Bookmark" onclick="event.stopPropagation(); App.toggleBookmark('${item.id}');">
          ${App.isBookmarked(item.id) ? '❤️' : '🤍'}
        </button>
        <span class="card-icon">${item.icon}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-description">${item.description}</p>
        ${extraInfo}
        <div class="card-meta">
          <div class="card-meta-item">
            <span class="card-meta-icon">${this.icons.clock}</span>
            <span>${item.duration}</span>
          </div>
          <span class="difficulty-badge ${diffClass}">${item.difficulty}</span>
          <div class="card-arrow">${this.icons.arrow}</div>
        </div>`;

      card.addEventListener('click', () => App.openDetail(item, category));
      grid.appendChild(card);
    });
  },

  /* ────────────────────────────────────────────
     renderDetail(item)
  ──────────────────────────────────────────── */
  renderDetail(item) {
    this._renderDetailHeader(item);
    this._renderSteps(item.steps || []);
  },

  _renderDetailHeader(item) {
    const header = document.getElementById('detailHeader');
    const progress = document.getElementById('detailProgress');

    // Subjects bar for year cards
    const subjectsHtml = item.subjects
      ? `<div class="subjects-bar">${item.subjects.map(s => `<span class="subject-pill">${s}</span>`).join('')}</div>`
      : '';

    const diffClass = 'diff-' + (item.difficulty || 'Intermediate').split('–')[0].trim().split(' ')[0];

    header.innerHTML = `
      <div class="detail-header-top">
        <div class="detail-icon-wrap" style="--card-color:${item.color}">${item.icon}</div>
        <div class="detail-info">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h1 class="detail-title">${item.title}</h1>
            <button class="bookmark-btn ${App.isBookmarked(item.id) ? 'active' : ''}" style="position:static; margin-left:15px; font-size:1.5rem; background:none; border:none; cursor:pointer;" onclick="App.toggleBookmark('${item.id}'); this.innerHTML = App.isBookmarked('${item.id}') ? '❤️' : '🤍'; this.classList.toggle('active');">
              ${App.isBookmarked(item.id) ? '❤️' : '🤍'}
            </button>
          </div>
          <p class="detail-description">${item.description}</p>
          <div class="detail-badges">
            <span class="detail-badge"><span class="detail-badge-icon">${this.icons.clock}</span>${item.duration}</span>
            <span class="difficulty-badge ${diffClass}">${item.difficulty}</span>
            <span class="detail-badge"><span class="detail-badge-icon">${this.icons.star}</span>${item.steps.length} Steps</span>
          </div>
          ${subjectsHtml}
        </div>
      </div>`;
  },

  _renderSteps(steps) {
    const container = document.getElementById('detailSteps');
    container.innerHTML = '';

    steps.forEach((step, i) => {
      const item = document.createElement('div');
      item.className = 'step-item';
      item.dataset.idx = i;

      const topicsHtml = (step.topics || []).map(t => `<span class="topic-chip">${t}</span>`).join('');
      const resourcesHtml = (step.resources || []).map(r => this._resourceCard(r)).join('');

      item.innerHTML = `
        <div class="step-number">${i + 1}</div>
        <div class="step-card">
          <div class="step-header">
            <div class="step-header-left">
              <div class="step-title">${step.title}</div>
              <div class="step-duration">${this.icons.clock} &nbsp;${step.duration}</div>
            </div>
            <div class="step-toggle">${this.icons.chevron}</div>
          </div>
          <div class="step-body">
            <p class="step-description">${step.description}</p>
            ${topicsHtml ? `<div class="step-section-label">Topics Covered</div><div class="topics-list">${topicsHtml}</div>` : ''}
            ${resourcesHtml ? `<div class="step-section-label">Resources & Links</div><div class="resources-grid">${resourcesHtml}</div>` : ''}
          </div>
        </div>`;

      // Toggle accordion
      item.querySelector('.step-header').addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        container.querySelectorAll('.step-item').forEach(el => el.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });

      container.appendChild(item);
    });

    // Auto-open first step
    if (container.firstChild) {
      container.firstChild.classList.add('active');
    }
  },

  _resourceCard(r) {
    const iconHtml = this.icons[r.type] || this.icons.docs;
    const channel  = r.channel ? `<div class="resource-channel">${r.channel}</div>` : '';
    return `
      <a class="resource-link" href="${r.url}" target="_blank" rel="noopener noreferrer">
        <div class="resource-icon ${r.type}">${iconHtml}</div>
        <div class="resource-info">
          <div class="resource-title">${r.title}</div>
          ${channel}
        </div>
        <span class="resource-ext-icon">${this.icons.ext}</span>
      </a>`;
  },

  /* ────────────────────────────────────────────
     showOverlay / hideOverlay
  ──────────────────────────────────────────── */
  showOverlay() {
    const overlay = document.getElementById('roadmapOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
  },

  hideOverlay() {
    const overlay = document.getElementById('roadmapOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  },
};
