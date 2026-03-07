/**
 * js/leaderboard-ui.js — UI del ranking global
 *
 * Modal con navegación entre días (flechas + swipe), podio top 3,
 * lista scrollable, highlight del jugador actual y compartir resultado.
 *
 * ORDEN DE CARGA: después de firebase-leaderboard.js, antes de main.js
 * Depende de: FirebaseLeaderboard, t(), getLang(), delay()
 */

var LeaderboardUI = (function () {

  /* ── Estado ────────────────────────────────────────── */
  var _currentDate = null;   /* Date object del día que se muestra */
  var _isOpen      = false;
  var _isLoading   = false;
  var _touchStartX = 0;
  var _touchDeltaX = 0;
  var _swiping     = false;

  var SWIPE_THRESHOLD = 50;
  var MEDALS = ['🥇', '🥈', '🥉'];

  /* ── Abrir modal ───────────────────────────────────── */

  function open(dateOverride) {
    if (!FirebaseLeaderboard.isReady()) {
      /* Fallback PGS nativo */
      if (typeof PlayGamesService !== 'undefined' && PlayGamesService.isSignedIn()) {
        PlayGamesService.showLeaderboard('daily_challenge');
      }
      return;
    }

    _currentDate = dateOverride ? new Date(dateOverride) : new Date();
    _isOpen = true;

    var modal = document.getElementById('modal-leaderboard');
    if (!modal) return;

    _updateDateDisplay();
    _bindEvents();
    modal.style.display = 'flex';

    /* Pequeño delay para animación */
    requestAnimationFrame(function () {
      modal.classList.add('lb-visible');
    });

    _loadRanking();
  }

  /* ── Cerrar modal ──────────────────────────────────── */

  function close() {
    _isOpen = false;
    var modal = document.getElementById('modal-leaderboard');
    if (!modal) return;
    modal.classList.remove('lb-visible');
    setTimeout(function () { modal.style.display = 'none'; }, 250);
  }

  function isOpen() { return _isOpen; }

  /* ── Eventos ───────────────────────────────────────── */

  function _bindEvents() {
    var modal   = document.getElementById('modal-leaderboard');
    var content = document.getElementById('lb-swipe-area');
    var btnPrev = document.getElementById('lb-prev');
    var btnNext = document.getElementById('lb-next');
    var btnClose1 = document.getElementById('btn-close-leaderboard');
    var btnClose2 = document.getElementById('btn-lb-close');
    var btnShare  = document.getElementById('btn-lb-share');

    /* Evitar duplicados */
    if (modal._lbBound) return;
    modal._lbBound = true;

    /* Cerrar */
    if (btnClose1) btnClose1.addEventListener('click', close);
    if (btnClose2) btnClose2.addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

    /* Navegación flechas */
    if (btnPrev) btnPrev.addEventListener('click', function () { _navigate(-1); });
    if (btnNext) btnNext.addEventListener('click', function () { _navigate(1); });

    /* Swipe táctil */
    if (content) {
      content.addEventListener('touchstart', _onTouchStart, { passive: true });
      content.addEventListener('touchmove',  _onTouchMove,  { passive: false });
      content.addEventListener('touchend',   _onTouchEnd,   { passive: true });
    }

    /* Compartir */
    if (btnShare) btnShare.addEventListener('click', _shareRanking);
  }

  /* ── Swipe ─────────────────────────────────────────── */

  function _onTouchStart(e) {
    if (_isLoading) return;
    _touchStartX = e.touches[0].clientX;
    _touchDeltaX = 0;
    _swiping = true;
  }

  function _onTouchMove(e) {
    if (!_swiping) return;
    _touchDeltaX = e.touches[0].clientX - _touchStartX;

    /* Pequeño desplazamiento visual del contenido */
    var area = document.getElementById('lb-swipe-area');
    if (area) {
      var clamp = Math.max(-80, Math.min(80, _touchDeltaX * 0.4));
      area.style.transform = 'translateX(' + clamp + 'px)';
      area.style.opacity = String(1 - Math.abs(clamp) / 200);
    }

    /* Evitar scroll vertical mientras swipe horizontal */
    if (Math.abs(_touchDeltaX) > 15) { e.preventDefault(); }
  }

  function _onTouchEnd() {
    if (!_swiping) return;
    _swiping = false;

    var area = document.getElementById('lb-swipe-area');
    if (area) { area.style.transform = ''; area.style.opacity = ''; }

    if (Math.abs(_touchDeltaX) >= SWIPE_THRESHOLD) {
      _navigate(_touchDeltaX < 0 ? 1 : -1);
    }
  }

  /* ── Navegación entre días ─────────────────────────── */

  function _navigate(direction) {
    if (_isLoading) return;

    var next = new Date(_currentDate);
    next.setDate(next.getDate() + direction);

    /* No permitir ir al futuro */
    var today = new Date();
    today.setHours(23, 59, 59, 999);
    if (next > today) return;

    /* Animación de transición */
    var area = document.getElementById('lb-swipe-area');
    if (area) {
      var slideOut = direction > 0 ? '-100%' : '100%';
      var slideIn  = direction > 0 ? '100%'  : '-100%';
      area.style.transition = 'transform .2s ease, opacity .2s ease';
      area.style.transform = 'translateX(' + slideOut + ')';
      area.style.opacity = '0';

      setTimeout(function () {
        _currentDate = next;
        _updateDateDisplay();
        area.style.transition = 'none';
        area.style.transform = 'translateX(' + slideIn + ')';
        area.style.opacity = '0';

        requestAnimationFrame(function () {
          area.style.transition = 'transform .2s ease, opacity .2s ease';
          area.style.transform = 'translateX(0)';
          area.style.opacity = '1';
        });

        _loadRanking();
      }, 200);
    } else {
      _currentDate = next;
      _updateDateDisplay();
      _loadRanking();
    }
  }

  /* ── Fecha ─────────────────────────────────────────── */

  function _isToday(d) {
    var n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  }

  function _isYesterday(d) {
    var y = new Date(); y.setDate(y.getDate() - 1);
    return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
  }

  function _formatDateLabel(d) {
    if (_isToday(d))     return t('date_today');
    if (_isYesterday(d)) return t('date_yesterday');
    var lang = typeof getLang === 'function' ? getLang() : 'es';
    var opts = { day: 'numeric', month: 'short' };
    if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
    return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', opts);
  }

  function _updateDateDisplay() {
    var label   = document.getElementById('lb-date-label');
    var btnNext = document.getElementById('lb-next');
    var badge   = document.getElementById('lb-today-badge');

    if (label) label.textContent = _formatDateLabel(_currentDate);

    /* Deshabilitar flecha derecha si estamos en hoy */
    if (btnNext) {
      var atToday = _isToday(_currentDate);
      btnNext.disabled = atToday;
      btnNext.style.opacity = atToday ? '0.25' : '1';
    }

    /* Badge "hoy" */
    if (badge) badge.style.display = _isToday(_currentDate) ? 'inline-flex' : 'none';
  }

  /* ── Cargar ranking ────────────────────────────────── */

  function _loadRanking() {
    _isLoading = true;
    var dateKey = FirebaseLeaderboard.formatDate(_currentDate);

    _showState('loading');

    FirebaseLeaderboard.getRanking(dateKey, 50).then(function (entries) {
      _isLoading = false;
      if (!entries || !entries.length) {
        _showState('empty');
        _updateShareButton(null);
        return;
      }
      _renderEntries(entries);
      _showState('list');

      /* Actualizar botón compartir */
      var me = null;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isMe) { me = entries[i]; me._total = entries.length; break; }
      }
      _updateShareButton(me);

    }).catch(function (err) {
      _isLoading = false;
      _showState('error', err);
      _updateShareButton(null);
    });
  }

  /* ── Estados del contenido ─────────────────────────── */

  function _showState(state, err) {
    var loading = document.getElementById('lb-loading');
    var list    = document.getElementById('lb-list');
    var empty   = document.getElementById('lb-empty');
    var error   = document.getElementById('lb-error');

    if (loading) loading.style.display = state === 'loading' ? 'flex' : 'none';
    if (list)    list.style.display    = state === 'list'    ? 'flex' : 'none';
    if (empty) {
      empty.style.display = state === 'empty' ? 'block' : 'none';
      if (state === 'empty') {
        var isT = _isToday(_currentDate);
        empty.innerHTML = isT
          ? '🌍<br>' + t('lb_empty')
          : '📭<br>' + t('lb_empty_past');
      }
    }
    if (error) {
      error.style.display = state === 'error' ? 'block' : 'none';
      if (state === 'error') {
        error.innerHTML = '⚠️ ' + t('lb_error');
        if (err && err.message) {
          console.error('[Leaderboard UI]', err.code, err.message);
        }
      }
    }
  }

  /* ── Renderizar entradas ───────────────────────────── */

  function _renderEntries(entries) {
    var list = document.getElementById('lb-list');
    if (!list) return;
    list.innerHTML = '';

    /* Contador de participantes */
    var counter = document.getElementById('lb-participants');
    if (counter) {
      counter.textContent = entries.length + ' ' + t('lb_participants');
      counter.style.display = 'block';
    }

    entries.forEach(function (entry, idx) {
      var div = document.createElement('div');
      var isTop3 = idx < 3;
      var cls = 'lb-entry';
      if (entry.isMe) cls += ' lb-entry--me';
      if (isTop3) cls += ' lb-entry--top' + (idx + 1);
      div.className = cls;

      var pos = isTop3 ? MEDALS[idx] : '<span class="lb-pos-num">' + (idx + 1) + '</span>';
      var pct = Math.round((entry.score / 15) * 100);
      var barWidth = Math.max(4, pct);
      var name = _esc(entry.playerName);

      div.innerHTML =
        '<div class="lb-rank">' + pos + '</div>' +
        '<div class="lb-player">' +
          '<span class="lb-player-name">' + name +
            (entry.isMe ? ' <span class="lb-badge-you">' + t('lb_you') + '</span>' : '') +
          '</span>' +
          '<div class="lb-score-bar-track">' +
            '<div class="lb-score-bar-fill" style="width:' + barWidth + '%"></div>' +
          '</div>' +
        '</div>' +
        '<div class="lb-result">' +
          '<span class="lb-result-score">' + entry.score + '</span>' +
          '<span class="lb-result-total">/15</span>' +
        '</div>';

      list.appendChild(div);

      /* Animación escalonada */
      div.style.animationDelay = (idx * 0.04) + 's';
    });

    /* Scroll al jugador actual */
    requestAnimationFrame(function () {
      var myRow = list.querySelector('.lb-entry--me');
      if (myRow) {
        setTimeout(function () {
          myRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });
  }

  /* ── Botón compartir ───────────────────────────────── */

  function _updateShareButton(myEntry) {
    var btn = document.getElementById('btn-lb-share');
    if (!btn) return;
    btn.style.display = myEntry ? 'flex' : 'none';
    btn._entry = myEntry;
  }

  function _shareRanking() {
    var btn = document.getElementById('btn-lb-share');
    var entry = btn && btn._entry;
    if (!entry) return;

    var lang = typeof getLang === 'function' ? getLang() : 'es';
    var dateLabel = _formatDateLabel(_currentDate);
    var pct = Math.round((entry.score / 15) * 100);
    var posEmoji = entry.position <= 3 ? MEDALS[entry.position - 1] : '🏅';

    var text;
    if (lang === 'en') {
      text = 'FlagMaster ' + posEmoji + '\n' +
        'Daily Challenge — ' + dateLabel + '\n' +
        'Score: ' + entry.score + '/15 (' + pct + '%)\n' +
        'Rank: #' + entry.position + ' of ' + (entry._total || '?') + ' players\n' +
        'Can you beat me? 🌍';
    } else {
      text = 'FlagMaster ' + posEmoji + '\n' +
        'Reto del Día — ' + dateLabel + '\n' +
        'Puntuación: ' + entry.score + '/15 (' + pct + '%)\n' +
        'Puesto: #' + entry.position + ' de ' + (entry._total || '?') + ' jugadores\n' +
        '¿Puedes superarme? 🌍';
    }

    /* Capacitor Share → clipboard fallback */
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share) {
      window.Capacitor.Plugins.Share.share({
        title: 'FlagMaster ' + posEmoji,
        text: text,
        dialogTitle: lang === 'en' ? 'Share your ranking' : 'Comparte tu posición'
      }).catch(function () {});
      return;
    }

    /* Fallback: copiar al portapapeles */
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        _showShareToast(lang === 'en' ? 'Copied!' : '¡Copiado!');
      }).catch(function () {});
    }
  }

  function _showShareToast(msg) {
    var toastEl = document.getElementById('achievement-toast');
    var icon    = document.getElementById('achievement-toast-icon');
    var name    = document.getElementById('achievement-toast-name');
    var label   = document.getElementById('achievement-toast-label');
    if (!toastEl) return;
    if (icon)  icon.textContent  = '📋';
    if (name)  name.textContent  = msg;
    if (label) label.textContent = '';
    toastEl.style.display = 'flex';
    toastEl.classList.remove('toast-hide');
    toastEl.classList.add('toast-show');
    setTimeout(function () {
      toastEl.classList.add('toast-hide');
      setTimeout(function () {
        toastEl.style.display = 'none';
        toastEl.classList.remove('toast-show', 'toast-hide');
      }, 400);
    }, 2000);
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── API pública ───────────────────────────────────── */

  return {
    open:   open,
    close:  close,
    isOpen: isOpen
  };
})();
