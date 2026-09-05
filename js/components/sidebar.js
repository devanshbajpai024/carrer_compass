/**
 * sidebar.js — Renders and manages the app sidebar + topbar.
 * Call Sidebar.init({ currentPage, user, profile }) on every dashboard page.
 */

const Sidebar = (() => {

  const NAV_ITEMS = [
    { group: 'Main' },
    { id: 'dashboard',  label: 'Dashboard',     icon: '🏠', href: 'dashboard.html' },
    { id: 'explore',    label: 'Explore',        icon: '🔍', href: 'explore.html' },
    { id: 'saved',      label: 'Saved',          icon: '🔖', href: 'saved.html' },
    { id: 'tracker',    label: 'Applications',   icon: '📋', href: 'tracker.html' },
    { id: 'deadlines',  label: 'Deadlines',      icon: '⏰', href: 'deadlines.html' },
    { group: 'Insights' },
    { id: 'skill-gap',  label: 'Skill Gap',      icon: '📊', href: 'skill-gap.html' },
    { id: 'analytics',  label: 'Analytics',      icon: '📈', href: 'analytics.html' },
    { group: 'Account' },
    { id: 'profile',    label: 'My Profile',     icon: '👤', href: 'profile.html' },
  ];

  let currentPage = '';
  let user = null;
  let profile = null;

  function init({ page, currentUser, studentProfile }) {
    currentPage = page;
    user = currentUser;
    profile = studentProfile;

    renderSidebar();
    renderTopbar();
    initMobileToggle();
    initThemeToggle();
    initNotifications();
    initProfileDropdown();
  }

  function getInitials(name) {
    return (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function renderSidebar() {
    let existing = document.getElementById('app-sidebar');
    if (existing) existing.remove();

    const savedCount = user ? SavedService.getSavedCount(user.id) : 0;
    const notifCount = user ? NotificationService.getUnreadCount(user.id) : 0;

    const sidebar = document.createElement('nav');
    sidebar.id = 'app-sidebar';
    sidebar.className = 'sidebar';
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', 'Main navigation');

    const navItemsHTML = NAV_ITEMS.map(item => {
      if (item.group) {
        return `<div class="sidebar-section-label">${item.group}</div>`;
      }
      const isActive = currentPage === item.id;
      let badge = '';
      if (item.id === 'saved' && savedCount > 0) {
        badge = `<span class="sidebar-link-badge">${savedCount}</span>`;
      }
      return `
        <a href="${item.href}"
          class="sidebar-link ${isActive ? 'active' : ''}"
          ${isActive ? 'aria-current="page"' : ''}
          title="${item.label}">
          <span class="sidebar-link-icon" aria-hidden="true">${item.icon}</span>
          <span>${item.label}</span>
          ${badge}
        </a>`;
    }).join('');

    sidebar.innerHTML = `
      <a href="dashboard.html" class="sidebar-logo">
        <div class="sidebar-logo-icon" aria-hidden="true">🎯</div>
        <div>
          <div class="sidebar-logo-text">OpportunityEngine</div>
          <div class="sidebar-logo-sub">PS2 · AI-Powered</div>
        </div>
      </a>
      <nav class="sidebar-nav">${navItemsHTML}</nav>
      <div class="sidebar-footer">
        <a href="profile.html" class="sidebar-user">
          <div class="sidebar-avatar">${getInitials(profile?.name || user?.name)}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${profile?.name || user?.name || 'Student'}</div>
            <div class="sidebar-user-email">${user?.email || ''}</div>
          </div>
        </a>
      </div>
    `;

    document.body.prepend(sidebar);

    // Overlay for mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    overlay.addEventListener('click', closeMobileSidebar);
    document.body.appendChild(overlay);
  }

  function renderTopbar() {
    let existing = document.getElementById('app-topbar');
    if (existing) existing.remove();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = (profile?.name || user?.name || 'Student').split(' ')[0];
    const notifCount = user ? NotificationService.getUnreadCount(user.id) : 0;

    const topbar = document.createElement('header');
    topbar.id = 'app-topbar';
    topbar.className = 'topbar';
    topbar.setAttribute('role', 'banner');

    topbar.innerHTML = `
      <div class="topbar-left">
        <button class="hamburger" id="sidebar-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
        <span class="topbar-greeting">${greeting}, ${firstName} 👋</span>
        <div class="topbar-search search-bar">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input class="search-input" id="global-search" type="search"
            placeholder="Search opportunities..."
            aria-label="Search opportunities" />
        </div>
      </div>
      <div class="topbar-right">
        <button class="theme-toggle" id="theme-toggle" title="Toggle theme" aria-label="Toggle dark/light mode">🌙</button>
        <div class="notif-btn-wrapper" style="position:relative;">
          <button class="notif-btn" id="notif-btn" aria-label="Notifications" aria-haspopup="true">
            🔔
            <span class="notif-dot ${notifCount > 0 ? 'visible' : ''}" id="notif-dot"></span>
          </button>
          <div class="notif-panel" id="notif-panel" role="menu">
            <div class="notif-panel-header">
              <span class="notif-panel-title">Notifications</span>
              <button class="btn btn-ghost btn-sm" id="mark-all-read">Mark all read</button>
            </div>
            <div class="notif-list" id="notif-list"></div>
          </div>
        </div>
        <div style="position:relative;">
          <button class="profile-menu-btn" id="profile-menu-btn" aria-haspopup="true" aria-expanded="false">
            <div class="profile-menu-avatar">${getInitials(profile?.name || user?.name)}</div>
            <span class="profile-menu-name">${firstName}</span>
            <span aria-hidden="true">▾</span>
          </button>
          <div class="profile-dropdown" id="profile-dropdown" role="menu">
            <a href="profile.html" role="menuitem">👤 My Profile</a>
            <a href="analytics.html" role="menuitem">📈 Analytics</a>
            <div style="height:1px;background:var(--border-subtle);margin:4px 0;"></div>
            <button class="logout-btn" id="logout-btn" role="menuitem">🚪 Sign Out</button>
          </div>
        </div>
      </div>
    `;

    // Insert after sidebar
    const shell = document.querySelector('.app-shell') || document.querySelector('.main-content');
    if (shell) {
      shell.prepend(topbar);
    } else {
      document.body.appendChild(topbar);
    }

    // Global search redirect
    const searchInput = topbar.querySelector('#global-search');
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) window.location.href = `explore.html?q=${encodeURIComponent(q)}`;
      }
    });

    renderNotifications();
  }

  function renderNotifications() {
    const list = document.getElementById('notif-list');
    if (!list || !user) return;
    const notifs = NotificationService.getUserNotifications(user.id);
    if (notifs.length === 0) {
      list.innerHTML = `<div class="notif-item"><div class="notif-body" style="text-align:center;padding:16px;color:var(--text-muted);">No notifications yet</div></div>`;
      return;
    }
    list.innerHTML = notifs.slice(0, 10).map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}"
        ${n.link ? `onclick="window.location.href='${n.link}'"` : ''}>
        <span class="notif-icon">${n.icon || '🔔'}</span>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-text">${n.body}</div>
        </div>
        <span class="notif-time">${timeAgo(n.createdAt)}</span>
      </div>`).join('');
  }

  function initMobileToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const isOpen = sidebar.classList.toggle('open');
        overlay.classList.toggle('visible', isOpen);
        toggle.setAttribute('aria-expanded', isOpen);
      });
    }
  }

  function closeMobileSidebar() {
    document.getElementById('app-sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('visible');
    document.getElementById('sidebar-toggle')?.setAttribute('aria-expanded', 'false');
  }

  function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const current = localStorage.getItem('soe_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', current);
    btn.textContent = current === 'dark' ? '🌙' : '☀️';

    btn.addEventListener('click', () => {
      const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('soe_theme', theme);
      btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    });
  }

  function initNotifications() {
    const btn = document.getElementById('notif-btn');
    const panel = document.getElementById('notif-panel');
    const markAll = document.getElementById('mark-all-read');
    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', () => panel.classList.remove('open'));
    panel.addEventListener('click', e => e.stopPropagation());

    if (markAll && user) {
      markAll.addEventListener('click', () => {
        NotificationService.markAllRead(user.id);
        document.getElementById('notif-dot')?.classList.remove('visible');
        renderNotifications();
      });
    }
  }

  function initProfileDropdown() {
    const btn = document.getElementById('profile-menu-btn');
    const dropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
    dropdown.addEventListener('click', e => e.stopPropagation());

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => AuthService.logout());
    }
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return { init };
})();
