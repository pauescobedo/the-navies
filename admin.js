(() => {
  const accountDialog = document.querySelector('#account-dialog');
  const panel = accountDialog?.querySelector('.account-admin-panel');
  if (!accountDialog || !panel) return;

  const form = panel.querySelector('.account-admin-form');
  const input = form.querySelector('input[name="code"]');
  const submitButton = form.querySelector('button');
  const error = panel.querySelector('.account-admin-error');
  const loginView = panel.querySelector('.account-admin-login');
  const sessionView = panel.querySelector('.account-admin-session');
  const time = panel.querySelector('.account-admin-time');
  const extendButton = panel.querySelector('.account-admin-extend');
  const endButton = panel.querySelector('.account-admin-end');
  const remainingLabel = sessionView.querySelector('small');
  const apiUrl = String(window.NAVIES_ADMIN_API_URL || '').replace(/\/$/, '');
  const sessionKey = 'navies-admin-session';
  let lastActiveState = null;
  const copy = {
    es:{ access:'Acceder a administración', active:'Administración activa', verify:'Verificar código', invalid:'El código no es válido o ha caducado.', unavailable:'Falta configurar el servicio privado de administración.', network:'No se ha podido contactar con el servicio de administración.', extend:'Extender 10 minutos', end:'Salir del modo administración', remaining:'Tiempo restante' },
    ca:{ access:'Accedir a administració', active:'Administració activa', verify:'Verificar el codi', invalid:'El codi no és vàlid o ha caducat.', unavailable:'Falta configurar el servei privat d’administració.', network:'No s’ha pogut contactar amb el servei d’administració.', extend:'Ampliar 10 minuts', end:'Sortir del mode administració', remaining:'Temps restant' },
    en:{ access:'Access administration', active:'Administration active', verify:'Verify code', invalid:'The code is invalid or has expired.', unavailable:'The private administration service has not been configured.', network:'The administration service could not be reached.', extend:'Extend 10 minutes', end:'Exit administration mode', remaining:'Time remaining' },
    it:{ access:'Accedi all’amministrazione', active:'Amministrazione attiva', verify:'Verifica codice', invalid:'Il codice non è valido o è scaduto.', unavailable:'Il servizio privato di amministrazione non è configurato.', network:'Impossibile contattare il servizio di amministrazione.', extend:'Estendi di 10 minuti', end:'Esci dalla modalità amministrazione', remaining:'Tempo rimanente' },
    fr:{ access:'Accéder à l’administration', active:'Administration active', verify:'Vérifier le code', invalid:'Le code est invalide ou a expiré.', unavailable:'Le service privé d’administration n’est pas configuré.', network:'Impossible de contacter le service d’administration.', extend:'Prolonger de 10 minutes', end:'Quitter le mode administration', remaining:'Temps restant' }
  };

  function language() {
    const value = document.documentElement.lang?.toLowerCase().split('-')[0];
    return copy[value] ? value : 'es';
  }

  function words() { return copy[language()]; }

  function readSession() {
    try {
      const session = JSON.parse(sessionStorage.getItem(sessionKey));
      if (!session?.token || !Number.isFinite(session.expiresAt)) return null;
      return session;
    } catch (_) { return null; }
  }

  function clearSession() {
    sessionStorage.removeItem(sessionKey);
    document.body.classList.remove('admin-mode');
    window.dispatchEvent(new CustomEvent('navies-admin-change', { detail:{ active:false } }));
  }

  function remainingSeconds(session = readSession()) {
    return session ? Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000)) : 0;
  }

  function format(seconds) {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function update() {
    let session = readSession();
    let remaining = remainingSeconds(session);
    if (session && remaining <= 0) {
      clearSession();
      session = null;
      remaining = 0;
    }
    const active = Boolean(session);
    document.body.classList.toggle('admin-mode', active);
    if (active !== lastActiveState) {
      lastActiveState = active;
      window.dispatchEvent(new CustomEvent('navies-admin-change', { detail:{ active } }));
    }
    loginView.hidden = active;
    sessionView.hidden = !active;
    if (active) {
      time.textContent = format(remaining);
      extendButton.hidden = remaining > 120;
    }
    submitButton.textContent = words().verify;
    extendButton.textContent = words().extend;
    endButton.textContent = words().end;
    remainingLabel.textContent = words().remaining;
    window.dispatchEvent(new CustomEvent('navies-admin-change', { detail:{ active } }));
  }

  async function request(path, options) {
    if (!apiUrl) throw new Error('unconfigured');
    const response = await fetch(`${apiUrl}${path}`, options);
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'invalid');
    return result;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    const code = input.value.replace(/\D/g, '').slice(0, 6);
    if (code.length !== 6) {
      error.textContent = words().invalid;
      return;
    }
    submitButton.disabled = true;
    try {
      const result = await request('/verify', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ code })
      });
      sessionStorage.setItem(sessionKey, JSON.stringify({ token:result.token, expiresAt:result.expiresAt }));
      input.value = '';
      update();
    } catch (requestError) {
      error.textContent = requestError.message === 'unconfigured' ? words().unavailable : (requestError.message === 'invalid' ? words().invalid : words().network);
    } finally {
      submitButton.disabled = false;
    }
  });

  extendButton.addEventListener('click', async () => {
    const session = readSession();
    if (!session) return update();
    extendButton.disabled = true;
    try {
      const result = await request('/extend', {
        method:'POST',
        headers:{ 'Authorization':`Bearer ${session.token}` }
      });
      sessionStorage.setItem(sessionKey, JSON.stringify({ token:result.token, expiresAt:result.expiresAt }));
      update();
    } catch (_) {
      clearSession();
      update();
    } finally {
      extendButton.disabled = false;
    }
  });

  endButton.addEventListener('click', () => {
    clearSession();
    update();
  });

  window.addEventListener('navies-auth-change', (event) => {
    if (!event.detail?.member) {
      clearSession();
      panel.hidden = true;
    } else {
      panel.hidden = event.detail.member !== 'pauescobedo';
    }
    update();
  });

  window.setInterval(update, 1000);
  window.naviesAdmin = {
    isActive:() => remainingSeconds() > 0,
    request:async (path, options = {}) => {
      const session = readSession();
      const headers = { ...(options.headers || {}) };
      if (session?.token) headers.Authorization = `Bearer ${session.token}`;
      return request(path, { ...options, headers });
    }
  };
  update();
})();
