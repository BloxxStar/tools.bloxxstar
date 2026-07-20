(() => {
  const cfg = window.BLOXXSTAR_SUPABASE || {};
  const setupNotice = document.querySelector('#setupNotice');
  const loginPanel = document.querySelector('#loginPanel');
  const dashboard = document.querySelector('#dashboard');
  const logoutButton = document.querySelector('#logoutButton');
  const loginMessage = document.querySelector('#loginMessage');
  const setMessage = document.querySelector('#setMessage');
  let client = null;
  let manufacturers = [];
  let sets = [];

  if (!cfg.url || !cfg.publishableKey || !window.supabase) {
    setupNotice.hidden = false;
    loginPanel.hidden = true;
    return;
  }

  client = window.supabase.createClient(cfg.url, cfg.publishableKey);

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const formatDate = (value) => value ? new Intl.DateTimeFormat('de-DE').format(new Date(value)) : 'kein Datum';

  async function ensureEditor(session) {
    const role = session?.user?.app_metadata?.role;
    if (!['admin', 'editor', 'reviewer'].includes(role)) {
      await client.auth.signOut();
      throw new Error('Für dieses Konto ist keine Backend-Rolle hinterlegt.');
    }
  }

  async function showSession(session) {
    if (!session) {
      loginPanel.hidden = false;
      dashboard.hidden = true;
      logoutButton.hidden = true;
      return;
    }
    await ensureEditor(session);
    loginPanel.hidden = true;
    dashboard.hidden = false;
    logoutButton.hidden = false;
    await refreshAll();
  }

  document.querySelector('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    loginMessage.textContent = 'Anmeldung läuft …';
    const { data, error } = await client.auth.signInWithPassword({
      email: document.querySelector('#email').value.trim(),
      password: document.querySelector('#password').value
    });
    if (error) {
      loginMessage.textContent = error.message;
      return;
    }
    try {
      await showSession(data.session);
      loginMessage.textContent = '';
    } catch (error) {
      loginMessage.textContent = error.message;
    }
  });

  logoutButton.addEventListener('click', async () => {
    await client.auth.signOut();
    await showSession(null);
  });

  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach(item => item.classList.toggle('active', item === button));
      document.querySelectorAll('.tab-panel').forEach(panel => panel.hidden = panel.id !== button.dataset.tab);
    });
  });

  async function refreshAll() {
    const [manufacturerResult, setResult, findingResult] = await Promise.all([
      client.from('manufacturers').select('id,name,slug').order('name'),
      client.from('sets').select('id,manufacturer_id,slug,set_number,name,status,eol_status,eol_date,eol_precision,eol_confirmed,eol_note,manufacturers(name)').order('updated_at', { ascending: false }),
      client.from('watchdog_findings').select('id,field_name,old_value,proposed_value,evidence_url,confidence,detected_at,status,sets(set_number,name),sources(name)').eq('status', 'open').order('detected_at', { ascending: false })
    ]);
    const error = manufacturerResult.error || setResult.error || findingResult.error;
    if (error) throw error;
    manufacturers = manufacturerResult.data || [];
    sets = setResult.data || [];
    renderManufacturers();
    renderSets();
    renderEol();
    renderWatchdog(findingResult.data || []);
    document.querySelector('#setCount').textContent = sets.length;
    document.querySelector('#findingCount').textContent = (findingResult.data || []).length;
    document.querySelector('#eolCount').textContent = sets.filter(item => item.eol_date && new Date(item.eol_date) <= new Date(Date.now() + 90 * 86400000) && item.eol_status !== 'eol').length;
  }

  function renderManufacturers() {
    const select = document.querySelector('#manufacturerId');
    select.innerHTML = manufacturers.length
      ? manufacturers.map(item => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('')
      : '<option value="">Zuerst Hersteller anlegen</option>';
  }

  function rowMarkup(item, extra = '') {
    return `<article class="data-row"><div><h3>${escapeHtml(item.manufacturers?.name || '')} ${escapeHtml(item.set_number)} – ${escapeHtml(item.name)}</h3><p><span class="status-chip">${escapeHtml(item.status)}</span><span class="status-chip">${escapeHtml(item.eol_status)}</span>${extra}</p></div><div class="row-actions"><button class="button" data-edit-set="${item.id}">Bearbeiten</button></div></article>`;
  }

  function renderSets() {
    const target = document.querySelector('#setList');
    target.innerHTML = sets.length ? sets.map(item => rowMarkup(item)).join('') : '<div class="empty-state">Noch keine Sets in der Datenbank.</div>';
    bindEditButtons();
  }

  function renderEol() {
    const target = document.querySelector('#eolList');
    const sorted = [...sets].sort((a,b) => (a.eol_date || '9999').localeCompare(b.eol_date || '9999'));
    target.innerHTML = sorted.length ? sorted.map(item => rowMarkup(item, `EOL: ${escapeHtml(formatDate(item.eol_date))}${item.eol_confirmed ? ' · bestätigt' : ''}`)).join('') : '<div class="empty-state">Noch keine EOL-Daten vorhanden.</div>';
    bindEditButtons();
  }

  function renderWatchdog(findings) {
    const target = document.querySelector('#watchdogList');
    target.innerHTML = findings.length ? findings.map(item => `<article class="data-row"><div><h3>${escapeHtml(item.sets?.set_number || item.external_key || 'Unbekanntes Set')} – ${escapeHtml(item.field_name)}</h3><p>${escapeHtml(item.sources?.name || 'Quelle')} · erkannt ${escapeHtml(formatDate(item.detected_at))} · Vertrauen ${item.confidence == null ? '–' : Math.round(item.confidence * 100) + '%'}</p><p>Alt: ${escapeHtml(JSON.stringify(item.old_value))}<br>Vorschlag: ${escapeHtml(JSON.stringify(item.proposed_value))}</p></div><div class="row-actions"><button class="button primary" data-finding="${item.id}" data-status="accepted">Übernehmen</button><button class="button" data-finding="${item.id}" data-status="deferred">Später</button><button class="button" data-finding="${item.id}" data-status="rejected">Verwerfen</button></div></article>`).join('') : '<div class="empty-state">Keine offenen Watchdog-Meldungen.</div>';
    target.querySelectorAll('[data-finding]').forEach(button => button.addEventListener('click', () => reviewFinding(button.dataset.finding, button.dataset.status)));
  }

  async function reviewFinding(id, status) {
    const { data: { user } } = await client.auth.getUser();
    const { error } = await client.from('watchdog_findings').update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id || null }).eq('id', id);
    if (error) return alert(error.message);
    await refreshAll();
  }

  function bindEditButtons() {
    document.querySelectorAll('[data-edit-set]').forEach(button => button.addEventListener('click', () => openSetDialog(sets.find(item => item.id === button.dataset.editSet))));
  }

  const dialog = document.querySelector('#setDialog');
  document.querySelector('#newSetButton').addEventListener('click', () => openSetDialog(null));
  document.querySelector('#closeDialog').addEventListener('click', () => dialog.close());
  document.querySelector('#cancelDialog').addEventListener('click', () => dialog.close());

  function openSetDialog(item) {
    document.querySelector('#dialogTitle').textContent = item ? 'Set bearbeiten' : 'Set anlegen';
    document.querySelector('#setId').value = item?.id || '';
    document.querySelector('#manufacturerId').value = item?.manufacturer_id || manufacturers[0]?.id || '';
    document.querySelector('#setNumber').value = item?.set_number || '';
    document.querySelector('#setName').value = item?.name || '';
    document.querySelector('#setSlug').value = item?.slug || '';
    document.querySelector('#contentStatus').value = item?.status || 'draft';
    document.querySelector('#eolStatus').value = item?.eol_status || 'unknown';
    document.querySelector('#eolDate').value = item?.eol_date || '';
    document.querySelector('#eolPrecision').value = item?.eol_precision || 'unknown';
    document.querySelector('#eolConfirmed').checked = Boolean(item?.eol_confirmed);
    document.querySelector('#eolNote').value = item?.eol_note || '';
    setMessage.textContent = '';
    dialog.showModal();
  }

  document.querySelector('#setForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage.textContent = 'Speichern …';
    const id = document.querySelector('#setId').value;
    const { data: { user } } = await client.auth.getUser();
    const payload = {
      manufacturer_id: document.querySelector('#manufacturerId').value,
      set_number: document.querySelector('#setNumber').value.trim(),
      name: document.querySelector('#setName').value.trim(),
      slug: document.querySelector('#setSlug').value.trim(),
      status: document.querySelector('#contentStatus').value,
      eol_status: document.querySelector('#eolStatus').value,
      eol_date: document.querySelector('#eolDate').value || null,
      eol_precision: document.querySelector('#eolPrecision').value,
      eol_confirmed: document.querySelector('#eolConfirmed').checked,
      eol_note: document.querySelector('#eolNote').value.trim() || null,
      eol_checked_at: new Date().toISOString(),
      updated_by: user?.id || null
    };
    if (!id) payload.created_by = user?.id || null;
    const query = id ? client.from('sets').update(payload).eq('id', id) : client.from('sets').insert(payload);
    const { error } = await query;
    if (error) {
      setMessage.textContent = error.message;
      return;
    }
    dialog.close();
    await refreshAll();
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) loginMessage.textContent = error.message;
    else showSession(data.session).catch(error => loginMessage.textContent = error.message);
  });
  client.auth.onAuthStateChange((_event, session) => showSession(session).catch(error => loginMessage.textContent = error.message));
})();
