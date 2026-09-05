/**
 * opportunityCard.js
 * Renders a full opportunity card with recommendation data.
 * Returns an HTMLElement (not innerHTML) for easy DOM management.
 */

const OpportunityCard = (() => {

  function getCategoryClass(category) {
    return 'badge-' + (category || 'internship').toLowerCase().replace(/\s+/g, '-');
  }

  function getModeIcon(mode) {
    const icons = { Remote: '🌐', 'On-site': '🏢', Hybrid: '🔄' };
    return icons[mode] || '📍';
  }

  function getDeadlineBadge(deadline) {
    const today = new Date();
    const d = new Date(deadline);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `<span class="deadline-badge expired">⚠️ Expired</span>`;
    if (diff <= 3) return `<span class="deadline-badge urgent">🔴 ${diff}d left</span>`;
    if (diff <= 7) return `<span class="deadline-badge soon">🟡 ${diff}d left</span>`;
    const dateStr = d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    return `<span class="deadline-badge ok">📅 ${dateStr}</span>`;
  }

  function getMatchScoreEl(score) {
    if (score === undefined || score === null) return '';
    const cls = score >= 75 ? 'match-score-high' : score >= 50 ? 'match-score-medium' : 'match-score-low';
    return `<span class="match-score ${cls}">
      <span class="score-dot"></span>${score}% Match
    </span>`;
  }

  function getStipendText(opp) {
    if (opp.stipend) return `<span>💰 ${opp.stipend}</span>`;
    if (opp.prize) return `<span>🏆 ${opp.prize}</span>`;
    return `<span class="text-muted">Unpaid</span>`;
  }

  /**
   * create(opp, options)
   * @param {Object} opp - opportunity data (may include .recommendation)
   * @param {Object} options - { userId, showReasons, compact }
   * @returns {HTMLElement}
   */
  function create(opp, options = {}) {
    const { userId, showReasons = true, compact = false } = options;
    const rec = opp.recommendation || null;
    const isSaved = userId ? SavedService.isSaved(userId, opp.id) : false;
    const appStatus = userId ? TrackerService.getApplicationStatus(userId, opp.id) : null;

    const card = document.createElement('article');
    card.className = 'opp-card card-enter shimmer-hover';
    card.setAttribute('data-opp-id', opp.id);
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');

    const skillBadges = (opp.requiredSkills || []).slice(0, 4)
      .map(s => `<span class="skill-badge">${s}</span>`).join('');
    const moreSills = opp.requiredSkills?.length > 4
      ? `<span class="skill-badge">+${opp.requiredSkills.length - 4}</span>` : '';

    const reasonsHTML = (showReasons && rec?.reasons?.length > 0 && !compact)
      ? `<div class="rec-reasons">
          ${rec.reasons.slice(0, 3).map(r => `
            <div class="rec-reason-item ${r.positive ? 'positive' : 'negative'}">
              <span class="rec-reason-icon">${r.icon}</span>
              <span>${r.text}</span>
            </div>`).join('')}
        </div>` : '';

    const statusBadge = appStatus
      ? `<span class="badge badge-accent">${appStatus}</span>` : '';

    card.innerHTML = `
      <div class="opp-card-header">
        <div style="flex:1;min-width:0;">
          <div class="opp-card-title">${opp.title}</div>
          <div class="opp-card-org">🏢 ${opp.organization}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
          <span class="badge ${getCategoryClass(opp.category)}">${opp.category}</span>
          ${rec ? getMatchScoreEl(rec.score) : ''}
        </div>
      </div>

      <div class="opp-card-meta">
        <span>${getModeIcon(opp.mode)} ${opp.mode}</span>
        <span>📍 ${opp.location}</span>
        <span>⏱ ${opp.duration}</span>
        ${getDeadlineBadge(opp.deadline)}
        ${getStipendText(opp)}
        ${statusBadge}
      </div>

      ${!compact ? `<div class="opp-card-skills">${skillBadges}${moreSills}</div>` : ''}

      ${reasonsHTML}

      <div class="opp-card-footer">
        <div class="opp-card-actions">
          ${userId ? `
            <button class="opp-card-save-btn ${isSaved ? 'saved' : ''}"
              data-opp-id="${opp.id}"
              title="${isSaved ? 'Remove from saved' : 'Save opportunity'}"
              aria-label="${isSaved ? 'Remove from saved' : 'Save opportunity'}">
              ${isSaved ? '🔖' : '🔖'}
            </button>` : ''}
          <button class="btn btn-primary btn-sm apply-btn" data-opp-id="${opp.id}">
            Apply Now
          </button>
        </div>
        <button class="btn btn-ghost btn-sm view-detail-btn" data-opp-id="${opp.id}">
          Details →
        </button>
      </div>
    `;

    // ── Wire events ──────────────────────────────────────────────────────
    // View details
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        openDetail(opp.id);
      }
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.closest('button')) openDetail(opp.id);
    });

    const detailBtn = card.querySelector('.view-detail-btn');
    if (detailBtn) detailBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDetail(opp.id);
    });

    // Save toggle
    const saveBtn = card.querySelector('.opp-card-save-btn');
    if (saveBtn && userId) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const result = SavedService.toggle(userId, opp.id);
        saveBtn.classList.toggle('saved', result.saved);
        saveBtn.title = result.saved ? 'Remove from saved' : 'Save opportunity';
        Toast.show({
          type: result.saved ? 'success' : 'info',
          title: result.saved ? 'Saved!' : 'Removed',
          message: result.saved ? `${opp.title} added to saved` : `Removed from saved list`,
        });
      });
    }

    // Apply
    const applyBtn = card.querySelector('.apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleApply(opp, userId, applyBtn);
      });
    }

    return card;
  }

  function openDetail(oppId) {
    window.location.href = `opportunity.html?id=${oppId}`;
  }

  function handleApply(opp, userId, btn) {
    if (!userId) {
      window.location.href = 'auth.html';
      return;
    }
    const existing = TrackerService.getApplicationStatus(userId, opp.id);
    if (existing && existing !== 'Interested') {
      Toast.show({ type: 'info', title: 'Already tracked', message: `Status: ${existing}` });
      return;
    }
    TrackerService.addApplication(userId, opp.id, 'Applied');
    btn.textContent = 'Applied ✓';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    btn.disabled = true;
    Toast.show({
      type: 'success',
      title: 'Application tracked!',
      message: `${opp.title} added to your tracker`,
    });
  }

  /**
   * renderList(opps, container, options)
   * Renders an array of opportunities into a container element.
   */
  function renderList(opps, container, options = {}) {
    container.innerHTML = '';
    if (!opps || opps.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No opportunities found</h3>
          <p>Try adjusting your filters or updating your profile skills.</p>
        </div>`;
      return;
    }
    opps.forEach(opp => {
      container.appendChild(create(opp, options));
    });
  }

  return { create, renderList };
})();
