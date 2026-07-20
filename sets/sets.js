(() => {
  'use strict';

  const searchInput = document.querySelector('#set-search');
  const clearButton = document.querySelector('#clear-search');
  const manufacturerFilter = document.querySelector('#manufacturer-filter');
  const eolFilter = document.querySelector('#eol-filter');
  const resetButton = document.querySelector('#reset-filters');
  const results = document.querySelector('#set-results');
  const count = document.querySelector('#result-count');
  const title = document.querySelector('#result-title');
  const empty = document.querySelector('#empty-state');

  const labels = {
    expected: 'EOL erwartet',
    confirmed: 'EOL bestätigt',
    ended: 'Bereits EOL',
    'not-announced': 'Kein EOL angekündigt',
    unknown: 'EOL unbekannt'
  };

  let sets = [];

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const searchableText = set => [
    set.manufacturer, set.setNumber, set.name, set.edition, set.category,
    ...(set.tags || [])
  ].filter(Boolean).join(' ').toLocaleLowerCase('de');

  const formatEolDate = eol => {
    if (!eol?.date) return 'Datum offen';
    const date = new Date(`${eol.date}T00:00:00`);
    if (Number.isNaN(date.getTime())) return eol.date;
    if (eol.precision === 'year') return String(date.getFullYear());
    if (eol.precision === 'month') return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(date);
    if (eol.precision === 'quarter') return `Quartal um ${new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(date)}`;
    return new Intl.DateTimeFormat('de-DE').format(date);
  };

  const renderCard = set => {
    const eol = set.eol || { state: 'unknown' };
    return `<article class="set-card">
      <div class="set-card-top"><span class="manufacturer">${escapeHtml(set.manufacturer)}</span><span class="status status-${escapeHtml(eol.state)}">${escapeHtml(labels[eol.state] || labels.unknown)}</span></div>
      <p class="set-number">Set ${escapeHtml(set.setNumber)}</p>
      <h3>${escapeHtml(set.name)}</h3>
      <p>${escapeHtml(set.edition || set.category || '')}</p>
      <div class="tag-row">${(set.tags || []).slice(0, 4).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      <dl><div><dt>EOL</dt><dd>${escapeHtml(formatEolDate(eol))}</dd></div><div><dt>Quellenstatus</dt><dd>${escapeHtml(eol.sourceType || 'unknown')}</dd></div></dl>
    </article>`;
  };

  const renderEolList = (elementId, selectedSets) => {
    const element = document.querySelector(elementId);
    if (!element) return;
    if (!selectedSets.length) {
      element.innerHTML = '<p class="muted-list">Noch keine Sets in dieser Liste.</p>';
      return;
    }
    element.innerHTML = `<ul>${selectedSets.map(set => `<li><strong>${escapeHtml(set.manufacturer)} ${escapeHtml(set.setNumber)}</strong><span>${escapeHtml(set.name)}</span><small>${escapeHtml(formatEolDate(set.eol))}</small></li>`).join('')}</ul>`;
  };

  const renderEolPanels = () => {
    const upcoming = sets.filter(set => ['expected', 'confirmed'].includes(set.eol?.state)).sort((a, b) => (a.eol.date || '9999').localeCompare(b.eol.date || '9999'));
    const ended = sets.filter(set => set.eol?.state === 'ended').sort((a, b) => (b.eol.date || '').localeCompare(a.eol.date || ''));
    const unknown = sets.filter(set => set.eol?.state === 'unknown');
    renderEolList('#eol-upcoming', upcoming);
    renderEolList('#eol-ended', ended);
    renderEolList('#eol-unknown', unknown);
  };

  const applyFilters = () => {
    const query = searchInput.value.trim().toLocaleLowerCase('de');
    const manufacturer = manufacturerFilter.value;
    const eolState = eolFilter.value;
    const filtered = sets.filter(set => {
      const queryMatches = !query || searchableText(set).includes(query);
      const manufacturerMatches = !manufacturer || set.manufacturer === manufacturer;
      const eolMatches = !eolState || set.eol?.state === eolState;
      return queryMatches && manufacturerMatches && eolMatches;
    });

    results.innerHTML = filtered.map(renderCard).join('');
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'Set' : 'Sets'}`;
    title.textContent = query ? `Treffer für „${searchInput.value.trim()}“` : 'Alle Sets';
    empty.hidden = filtered.length !== 0;
  };

  const populateManufacturers = () => {
    [...new Set(sets.map(set => set.manufacturer))].sort((a, b) => a.localeCompare(b, 'de')).forEach(manufacturer => {
      const option = document.createElement('option');
      option.value = manufacturer;
      option.textContent = manufacturer;
      manufacturerFilter.append(option);
    });
  };

  const resetFilters = () => {
    searchInput.value = '';
    manufacturerFilter.value = '';
    eolFilter.value = '';
    applyFilters();
    searchInput.focus();
  };

  searchInput.addEventListener('input', applyFilters);
  manufacturerFilter.addEventListener('change', applyFilters);
  eolFilter.addEventListener('change', applyFilters);
  clearButton.addEventListener('click', () => { searchInput.value = ''; applyFilters(); searchInput.focus(); });
  resetButton.addEventListener('click', resetFilters);

  fetch('../data/sets/index.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      sets = Array.isArray(data.sets) ? data.sets : [];
      populateManufacturers();
      applyFilters();
      renderEolPanels();
    })
    .catch(error => {
      console.error('Set-Daten konnten nicht geladen werden:', error);
      results.innerHTML = '<p class="load-error">Die Set-Datenbank konnte gerade nicht geladen werden.</p>';
      count.textContent = 'Fehler';
    });
})();
