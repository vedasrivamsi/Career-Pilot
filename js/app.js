'use strict';

const App = {
  currentTab: 'jobRoles',
  currentItem: null,
  bookmarks: JSON.parse(localStorage.getItem('careerPilotBookmarks') || '[]'),
  searchQuery: '',

  /* ─── INIT ─────────────────────────────────── */
  init() {
    this._initNavbar();
    this._initTabs();
    this._initBackButton();
    this._initKeyboard();
    this._initSearch();
    this.switchTab('jobRoles');
  },

  isBookmarked(id) {
    return this.bookmarks.includes(id);
  },

  toggleBookmark(id) {
    if (this.isBookmarked(id)) {
      this.bookmarks = this.bookmarks.filter(b => b !== id);
    } else {
      this.bookmarks.push(id);
    }
    localStorage.setItem('careerPilotBookmarks', JSON.stringify(this.bookmarks));
    
    // If we're inside the detail view, just updating the icon might be enough, but let's re-render
    // Actually, just re-render cards to reflect updated bookmark icons
    this.switchTab(this.currentTab);
  },

  _initSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
      input.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.switchTab(this.currentTab);
      });
    }
  },

  /* ─── NAVBAR ────────────────────────────────── */
  _initNavbar() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  },

  /* ─── PARTICLES ─────────────────────────────── */
  _initParticles() {
    const canvas = document.createElement('canvas');
    const wrap   = document.getElementById('particles');
    if (!wrap) return;
    wrap.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let w, h, particles = [];

    const resize = () => {
      w = canvas.width  = wrap.offsetWidth;
      h = canvas.height = wrap.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COLORS = ['rgba(108,99,255,', 'rgba(0,212,255,', 'rgba(255,107,157,'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x % w, p.y % h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      });
      requestAnimationFrame(draw);
    };
    draw();
  },

  /* ─── TABS ──────────────────────────────────── */
  _initTabs() {
    document.getElementById('tabSelector').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      const tab = btn.dataset.tab;
      this.switchTab(tab);
    });
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    let itemsToRender = [];
    
    if (tabId === 'saved') {
      const allItems = [
        ...(CareerPilotData.jobRoles || []),
        ...(CareerPilotData.subjects || []),
        ...(CareerPilotData.years || []),
        ...(CareerPilotData.platforms || [])
      ];
      itemsToRender = allItems.filter(item => this.isBookmarked(item.id));
      // deduplicate by id
      itemsToRender = Array.from(new Map(itemsToRender.map(item => [item.id, item])).values());
    } else {
      const dataMap = {
        jobRoles: CareerPilotData.jobRoles,
        subjects: CareerPilotData.subjects,
        years:    CareerPilotData.years,
        platforms: CareerPilotData.platforms,
      };
      itemsToRender = dataMap[tabId] || [];
    }

    // Apply search filter
    if (this.searchQuery) {
      itemsToRender = itemsToRender.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(this.searchQuery);
        const descMatch = item.description.toLowerCase().includes(this.searchQuery);
        const tagsMatch = (item.tags || []).some(t => t.toLowerCase().includes(this.searchQuery));
        const subjectsMatch = (item.subjects || []).some(s => s.toLowerCase().includes(this.searchQuery));
        return titleMatch || descMatch || tagsMatch || subjectsMatch;
      });
    }

    UI.renderCards(itemsToRender, tabId);
  },

  /* ─── DETAIL VIEW ───────────────────────────── */
  openDetail(item, category) {
    this.currentItem = { item, category };
    UI.renderDetail(item, category);
    UI.showOverlay();
  },

  /* ─── BACK BUTTON ───────────────────────────── */
  _initBackButton() {
    document.getElementById('detailBack').addEventListener('click', () => {
      UI.hideOverlay();
    });

    // Also close on overlay background (not on the card)
    document.getElementById('roadmapOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) UI.hideOverlay();
    });
  },

  /* ─── KEYBOARD ──────────────────────────────── */
  _initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') UI.hideOverlay();
    });
  },
};

/* ─── Global helper for footer links ─── */
function switchTab(tabId) {
  document.querySelector('#roadmaps').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => App.switchTab(tabId), 300);
}

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', () => App.init());
