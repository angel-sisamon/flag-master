/**
 * js/main.js — FlagMaster v4
 *
 * Nombres internos de modo: 'guess-country' | 'guess-flag' | 'timetrial' | 'daily' | 'review'
 * getGameState() campos: mode, continent, score, streak, maxStreak, correct, wrong, attempted,
 *                        answered, finished, isTimeTrial, isDailyChallenge, isReview,
 *                        currentIndex, wrongList
 */

/*
 * Estructura de modos en acordeón:
 *   - GRUPOS (type:'group'): Clásico | Multijugador  → colapsables
 *   - STANDALONE (type:'solo'): Reto del Día         → siempre visible, al mismo nivel
 *
 * Los grupos empiezan expandidos (expanded:true) o colapsados (expanded:false).
 */
var MODE_GROUPS = [
  {
    id:       'classic',
    icon:     '🎮',
    nameKey:  'group_classic',
    expanded: true,      /* abierto por defecto */
    modes: [
      { id:'guess-country', visualBig:'🌍', active:true  },
      { id:'guess-flag',    visualBig:'🚩', active:true  },
      { id:'timetrial',     visualBig:'⚡', active:true  },
    ]
  },
  {
    id:       'multiplayer',
    icon:     '👥',
    nameKey:  'group_multiplayer',
    expanded: false,     /* cerrado por defecto */
    modes: [
      { id:'quick-match',  visualBig:'⚡', active:false },
      { id:'escalada',     visualBig:'📈', active:false },
      { id:'tournament',   visualBig:'🏆', active:false },
    ]
  },
];

/* Modo "solo" fuera de grupos — al mismo nivel que los grupos */
var MODE_SOLO = { id:'daily', visualBig:'📅', active:true };

/* Estado de expansión de grupos (por id de grupo) */
var _groupExpanded = { classic: true, multiplayer: false };

var MODE_I18N = {
  'guess-country':{ name:'mode_guess_country',   desc:'mode_guess_country_desc' },
  'guess-flag':   { name:'mode_guess_flag',      desc:'mode_guess_flag_desc' },
  'timetrial':    { name:'mode_time_attack',     desc:'mode_time_attack_desc' },
  'daily':        { name:'mode_daily',           desc:'mode_daily_desc' },
  'quick-match':  { name:'mode_quick_match',     desc:'mode_quick_match_desc' },
  'escalada':     { name:'mode_escalada',        desc:'mode_escalada_desc' },
  'tournament':   { name:'mode_tournament',      desc:'mode_tournament_desc' },
};

/* Helper: obtener visualBig de cualquier modo */
function _getModeVisual(id) {
  for (var g = 0; g < MODE_GROUPS.length; g++) {
    for (var m = 0; m < MODE_GROUPS[g].modes.length; m++) {
      if (MODE_GROUPS[g].modes[m].id === id) return MODE_GROUPS[g].modes[m].visualBig;
    }
  }
  if (MODE_SOLO.id === id) return MODE_SOLO.visualBig;
  return '🌍';
}

var _selectedModeId = loadLastMode() || 'guess-country';
var _selectedContinent = storageLoad('last_continent','all') || 'all';
var _settings       = loadSettings();
var _timerHandle    = null;
var _globalTimer    = null;
var _globalSecs     = 60;
var _gameActive     = false;
var _autoAdvance    = null;
var _pendingReviewCodes = [];

document.addEventListener('DOMContentLoaded', function () {

  initI18N();
  applyDarkMode(_settings.darkMode);
  AudioFX.setEnabled(_settings.soundEnabled);

/* ★ PGS: Inicializar Google Play Games Services ★ */
  ProfilePill.init();
  PlayGamesService.init().then(function (signedIn) {
    ProfilePill.updateFromPGS(signedIn);
    if (signedIn) {
      console.log('[FlagMaster] PGS conectado, sincronizando logros locales...');
      PlayGamesService.syncAllLocal();
      var pgsBtn = document.getElementById('btn-pgs-achievements');
      if (pgsBtn) pgsBtn.style.display = 'block';
    }
  });

  initSettingsEvents(function (ns) {
    _settings = ns;
    applyDarkMode(ns.darkMode);
    AudioFX.setEnabled(ns.soundEnabled);
    _renderHomeMenu();
    _refreshBestScore();
    updateDailyCardUI();
    _updateDailyStreakUI();
  });

  _renderHomeMenu();
  _refreshBestScore();
  updateDailyCardUI();
  _updateDailyStreakUI();
  initRankingFilters();

  document.getElementById('btn-play').addEventListener('click', function () {
    AudioFX.resume();
    _launchSelected();
  });
  document.getElementById('btn-settings-home').addEventListener('click', function () {
    showSettingsModal(_settings);
  });
  document.getElementById('btn-ranking-home').addEventListener('click', function () {
    renderRankingScreen('all');
    document.querySelectorAll('#ranking-filters .chip').forEach(function (c) {
      c.classList.toggle('active', c.dataset.filter === 'all');
    });
    showScreen('ranking');
  });
  document.getElementById('btn-achievements-home').addEventListener('click', function () {
    renderAchievementsScreen();
    showScreen('achievements');
  });
  document.getElementById('btn-stats-home').addEventListener('click', function () {
    renderStatsScreen();
    showScreen('stats');
  });

  document.getElementById('btn-next').addEventListener('click', _handleNext);
  document.getElementById('btn-quit').addEventListener('click', function () {
    _pauseAll();
    showQuitModal(
      function () { _stopAll(); _gameActive = false; _refreshBestScore(); showScreen('home'); },
      _resumeTimers
    );
  });

  document.getElementById('btn-share').addEventListener('click', function () {
    var state = getGameState();
    if (!state) return;
    var total = state.isTimeTrial ? state.attempted : getTotalQuestions();
    shareResult(state.score, total, state.isTimeTrial, state.isDailyChallenge);
  });
  document.getElementById('btn-retry').addEventListener('click', function () {
    resetGameState(); _startGameFromState();
  });
  document.getElementById('btn-review').addEventListener('click', function () {
    var state = getGameState();
    if (!state || !state.wrongList || !state.wrongList.length) return;
    _launchReview(state.wrongList);
  });
  document.getElementById('btn-home').addEventListener('click', function () {
    _gameActive = false; _stopAll(); _refreshBestScore();
    updateDailyCardUI(); _updateDailyStreakUI(); showScreen('home');
  });

  document.getElementById('btn-back-ranking').addEventListener('click', function () { showScreen('home'); });
  document.getElementById('btn-back-achievements').addEventListener('click', function () { showScreen('home'); });
  document.getElementById('btn-back-stats').addEventListener('click', function () { showScreen('home'); });

  /* ★ PGS: Botón para ver logros nativos de Google Play Games ★ */
  var pgsBtn = document.getElementById('btn-pgs-achievements');
  if (pgsBtn) {
    pgsBtn.addEventListener('click', function () {
      PlayGamesService.showAchievements();
    });
  }

  document.addEventListener('keydown', _handleKeyboard);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      hideSettingsModal();
      document.getElementById('modal-quit').style.display = 'none';
    }
  });

  showScreen('home');
  _initContinentSelector();
  _initOnboarding();
});

/* ── Home menu (acordeón) ──────────────────────────────────── */
function _renderHomeMenu() {
  var container = document.getElementById('mode-list');
  if (!container) return;
  container.innerHTML = '';

  /* ── 1. Reto del día (solo, arriba del todo) ── */
  container.appendChild(_buildSoloCard(MODE_SOLO));

  /* ── 2. Grupos colapsables ── */
  MODE_GROUPS.forEach(function (group) {
    container.appendChild(_buildGroupBlock(group));
  });

  _updateHeroVisual(_selectedModeId);
  document.getElementById('btn-play').textContent = t('home_play');
}

/** Construye la tarjeta standalone del Reto del Día */
function _buildSoloCard(mode) {
  var card = document.createElement('button');
  card.className = 'mode-card mode-card--solo' +
    (mode.id === _selectedModeId ? ' mode-card--selected' : '') +
    (!mode.active ? ' mode-card--locked' : '');
  card.dataset.mode = mode.id;

  var keys = MODE_I18N[mode.id] || { name: mode.id, desc: '' };
  card.innerHTML =
    '<span class="mode-card-icon" id="daily-icon">' + mode.visualBig + '</span>' +
    '<div class="mode-card-text">' +
      '<span class="mode-card-name">' + t(keys.name) + '</span>' +
      '<span class="mode-card-desc" id="daily-status">' + t(keys.desc) + '</span>' +
    '</div>' +
    (mode.id === _selectedModeId ? '<span class="mode-card-check">✓</span>' : '');

  if (mode.active) {
    card.addEventListener('click', function () { _selectMode(mode.id); });
  }
  return card;
}

/** Construye un bloque de grupo: header colapsable + lista de hijos */
function _buildGroupBlock(group) {
  var isOpen = !!_groupExpanded[group.id];

  var wrap = document.createElement('div');
  wrap.className = 'mode-group';
  wrap.dataset.group = group.id;

  /* Header del grupo */
  var header = document.createElement('button');
  header.className = 'mode-group-header' + (isOpen ? ' mode-group-header--open' : '');
  header.innerHTML =
    '<span class="mode-group-icon">' + group.icon + '</span>' +
    '<span class="mode-group-name">' + t(group.nameKey) + '</span>' +
    '<span class="mode-group-arrow">' + (isOpen ? '▾' : '▸') + '</span>';

  /* Contenedor de hijos */
  var children = document.createElement('div');
  children.className = 'mode-group-children' + (isOpen ? ' mode-group-children--open' : '');

  group.modes.forEach(function (mode) {
    var card = document.createElement('button');
    card.className = 'mode-card mode-card--child' +
      (mode.id === _selectedModeId ? ' mode-card--selected' : '') +
      (!mode.active ? ' mode-card--locked' : '');
    card.dataset.mode = mode.id;

    var keys = MODE_I18N[mode.id] || { name: mode.id, desc: '' };
    card.innerHTML =
      '<span class="mode-card-icon">' + mode.visualBig + '</span>' +
      '<div class="mode-card-text">' +
        '<span class="mode-card-name">' + t(keys.name) + '</span>' +
        '<span class="mode-card-desc">' + t(keys.desc) + '</span>' +
      '</div>' +
      (!mode.active ? '<span class="mode-card-lock">' + t('home_coming_soon') + '</span>' : '') +
      (mode.id === _selectedModeId ? '<span class="mode-card-check">✓</span>' : '');

    if (mode.active) {
      card.addEventListener('click', function () { _selectMode(mode.id); });
    }
    children.appendChild(card);
  });

  /* Toggle al pulsar el header */
  header.addEventListener('click', function () {
    _groupExpanded[group.id] = !_groupExpanded[group.id];
    var open = _groupExpanded[group.id];
    header.classList.toggle('mode-group-header--open', open);
    children.classList.toggle('mode-group-children--open', open);
    header.querySelector('.mode-group-arrow').textContent = open ? '▾' : '▸';
    vibrateDevice([12], _settings.vibration);
  });

  wrap.appendChild(header);
  wrap.appendChild(children);
  return wrap;
}

function _selectMode(id) {
  _selectedModeId = id; saveLastMode(id); _refreshBestScore();
  document.querySelectorAll('.mode-card').forEach(function (c) {
    var sel = c.dataset.mode === id;
    c.classList.toggle('mode-card--selected', sel);
    var check = c.querySelector('.mode-card-check');
    if (sel && !check) {
      check = document.createElement('span'); check.className = 'mode-card-check'; check.textContent = '✓'; c.appendChild(check);
    } else if (!sel && check) { check.remove(); }
  });
  _updateHeroVisual(id);
  vibrateDevice([18], _settings.vibration);
}

function _updateHeroVisual(id) {
  var heroEl = document.getElementById('hero-visual'); if (!heroEl) return;
  heroEl.classList.remove('hero-anim'); void heroEl.offsetWidth; heroEl.classList.add('hero-anim');
  heroEl.textContent = _getModeVisual(id);
}

/* ── Arranque ─────────────────────────────────────────────── */
function _launchSelected() {
  _settings = loadSettings();
  AudioFX.setEnabled(_settings.soundEnabled);

  /* animación de zoom en hero antes de cambiar pantalla */
  var hero = document.getElementById('hero-visual');
  if (hero) { hero.classList.add('hero-launch'); setTimeout(function(){ hero.classList.remove('hero-launch'); }, 400); }

  if (_selectedModeId === 'daily') {
    if (isDailyCompleted()) { alert(t('daily_already')); return; }
    var dailyCountries = getDailyCountries();
    var dailyQuestions = dailyCountries.map(function (correct) {
      var distractors = getDistractors(correct.code, 3);
      var options     = shuffle([correct].concat(distractors));
      var ci = -1;
      for (var i = 0; i < options.length; i++) { if (options[i].code === correct.code) { ci = i; break; } }
      return { correct: correct, options: options, correctIndex: ci };
    });
    initGame('daily', 15, dailyQuestions, 'all');
  } else {
    initGame(_selectedModeId, _settings.numQuestions, null, _selectedContinent);
  }
  _startGameFromState();
}

function _launchReview(wrongCodes) {
  var pool = wrongCodes.map(function(code){
    return COUNTRIES.filter(function(c){ return c.code===code; })[0];
  }).filter(Boolean);
  if (!pool.length) { alert(t('review_empty')); return; }
  var questions = pool.map(function(correct) {
    var distractors = getDistractors(correct.code, 3);
    var options = shuffle([correct].concat(distractors));
    var ci = -1;
    for (var i=0;i<options.length;i++){ if(options[i].code===correct.code){ci=i;break;} }
    return { correct:correct, options:options, correctIndex:ci };
  });
  initGame('review', pool.length, questions, 'all');
  _startGameFromState();
}

/**
 * FIX: En modo 'review', devolver el modo visual del modo original (_selectedModeId)
 * para que las preguntas y opciones se rendericen con banderas o nombres según corresponda.
 */
function _displayMode() {
  var state = getGameState(); if (!state) return 'guess-country';
  if (state.mode === 'review') {
    return _selectedModeId === 'guess-flag' ? 'guess-flag' : 'guess-country';
  }
  return (state.mode === 'timetrial' || state.mode === 'daily') ?
    'guess-country' : state.mode;
}

function _startGameFromState() {
  _gameActive = true;
  var state = getGameState();
  var isTA  = state && state.isTimeTrial;
  showScreen('game');
  setTimerVisible(!isTA && _settings.timerEnabled);
  setTimeAttackHUD(isTA);
  if (isTA) _startGlobalTimer(60);
  delay(100).then(function () { _renderCurrentQuestion(true); });
}

/* ── Pregunta ─────────────────────────────────────────────── */
function _renderCurrentQuestion(animate) {
  if (!_gameActive) return;
  var state = getGameState();
  var isTA  = state && state.isTimeTrial;

  if (isTA) { updateHUDScoreOnly(state.score, state.streak); }
  else      { updateHUD(state.score, state.streak, state.currentIndex, getTotalQuestions()); }

  renderQuestion(getCurrentQuestion(), _displayMode(), animate, _handleAnswer);

  if (!isTA && _settings.timerEnabled) { _startPerQuestionTimer(_settings.timerDuration); }
}

/* ── Respuesta ────────────────────────────────────────────── */
function _handleAnswer(optionIndex) {
  if (!_gameActive) return;
  _stopPerQuestionTimer();
  if (_autoAdvance) { clearTimeout(_autoAdvance); _autoAdvance = null; }

  var result = answerQuestion(optionIndex);
  if (!result) return;

  vibrateDevice(result.isCorrect ? [40] : [70,30,70], _settings.vibration);

  if (result.isCorrect) {
    AudioFX.correct();
    if (result.state.streak >= 3) AudioFX.streak();
  } else {
    AudioFX.wrong();
  }

  showAnswerFeedback(result.isCorrect, optionIndex, result.correctIndex, getCurrentQuestion().correct);

  var state = getGameState();
  if (state.isTimeTrial) {
    updateHUDScoreOnly(state.score, state.streak);
    _autoAdvance = setTimeout(function () { _autoAdvance = null; _handleNext(); }, 1400);
  } else {
    updateHUD(state.score, state.streak, state.currentIndex, getTotalQuestions());
  }
}

function _handleNext() {
  if (!_gameActive) return;
  if (_autoAdvance) { clearTimeout(_autoAdvance); _autoAdvance = null; }
  var res = advanceQuestion();
  if (res.finished) { _endGame(); }
  else { delay(100).then(function () { _renderCurrentQuestion(true); }); }
}

/* ── Fin ──────────────────────────────────────────────────── */
function _endGame() {
  _gameActive = false; _stopAll();

  var state     = getGameState();
  var isTA      = state.isTimeTrial;
  var isDaily   = state.isDailyChallenge;
  var isReview  = state.isReview;
  var mode      = isReview ? 'review' : _selectedModeId;
  var total     = isTA ? state.attempted : getTotalQuestions();

  /* registrar países fallados en estadísticas globales */
  if (state.wrongList && state.wrongList.length) {
    state.wrongList.forEach(function(code){ recordWrongCountry(code); });
  }

  var isNewRecord = !isReview && saveBestScore(mode, state.score);

  if (!isReview) {
    addRankingEntry({ mode: mode, score: state.score, total: total, maxStreak: state.maxStreak, ts: Date.now() });
  }

  if (isDaily) markDailyCompleted(state.score);

  var newAchs = checkAchievements({
    mode: mode, score: state.score, total: total,
    correct: state.correct, wrong: state.wrong,
    maxStreak: state.maxStreak, isDaily: isDaily
  });

  /* ★ PGS: Enviar logros a Google Play Games Services ★ */
  PlayGamesService.processNewAchievements(newAchs, {
    correct:   state.correct,
    wrong:     state.wrong,
    score:     state.score,
    total:     total,
    mode:      mode,
    isDaily:   isDaily,
    maxStreak: state.maxStreak
  });

  if (isTA) { AudioFX.timeUp(); }
  else { AudioFX.complete(); }

  delay(200).then(function () {
    renderResults(state.score, total, state.correct, state.wrong, state.maxStreak, isNewRecord, isDaily, mode);
    renderResultsAchievements(newAchs);
    ProfilePill.renderResultsPlayerName();
    /* mostrar/ocultar botón de repaso */
    var revBtn = document.getElementById('btn-review');
    if (revBtn) revBtn.style.display = (state.wrongList && state.wrongList.length && !isReview) ? 'flex' : 'none';
    showScreen('results');
    if (state.score / Math.max(total, 1) >= 0.7) {
      delay(400).then(function () { launchConfetti(document.getElementById('confetti-canvas')); });
    }
    if (newAchs.length) { delay(800).then(function () { showNewAchievements(newAchs); }); }
    /* pedir nombre si entra en top 5 */
    if (!isReview && isTopScore(mode, state.score, total)) {
      delay(600).then(function(){ _showNameModal(mode); });
    }
  });
}

/* ── Timers ───────────────────────────────────────────────── */
function _startPerQuestionTimer(secs) {
  _stopPerQuestionTimer(); var rem = secs; updateTimerUI(rem, secs);
  _timerHandle = setInterval(function () {
    rem--; updateTimerUI(rem, secs);
    if (rem <= 0) { _stopPerQuestionTimer(); _handleAnswer(-1); }
  }, 1000);
}
function _stopPerQuestionTimer() { if (_timerHandle) { clearInterval(_timerHandle); _timerHandle = null; } }
function _startGlobalTimer(secs) {
  _stopGlobalTimer(); _globalSecs = secs; updateGlobalTimer(_globalSecs);
  _globalTimer = setInterval(function () {
    _globalSecs--; updateGlobalTimer(_globalSecs);
    if (_globalSecs <= 0) { _stopGlobalTimer(); forceFinishGame(); _endGame(); }
  }, 1000);
}
function _stopGlobalTimer() { if (_globalTimer) { clearInterval(_globalTimer); _globalTimer = null; } }
function _stopAll()     { _stopPerQuestionTimer(); _stopGlobalTimer(); if (_autoAdvance) { clearTimeout(_autoAdvance); _autoAdvance = null; } }
function _pauseAll()    { _stopAll(); }
function _resumeTimers() {
  var state = getGameState(); if (!state) return;
  if (state.isTimeTrial && _globalSecs > 0) { _startGlobalTimer(_globalSecs); }
  else if (!state.isTimeTrial && _settings.timerEnabled && !state.answered) { _startPerQuestionTimer(_settings.timerDuration); }
}

/* ── Misc ─────────────────────────────────────────────────── */
function _refreshBestScore() { renderHomeBestScore(loadBestScore(_selectedModeId)); }

function _handleKeyboard(e) {
  if (!_gameActive) return;
  var state = getGameState(); if (!state) return;
  if (['1','2','3','4'].indexOf(e.key) !== -1 && !state.answered) {
    var b = document.querySelectorAll('.option-btn')[parseInt(e.key,10)-1]; if (b) b.click(); return;
  }
  if ((e.key === 'Enter' || e.key === ' ') && state.answered) {
    e.preventDefault();
    var nb = document.getElementById('btn-next'); if (nb && nb.style.display !== 'none') nb.click();
  }
}

/* ── Onboarding primer uso ─────────────────────────────────── */
function _initOnboarding() {
  if (storageLoad('onboarding_done')) return; /* ya lo vio */

  var overlay  = document.getElementById('onboarding-overlay');
  var slides   = overlay.querySelectorAll('.onboarding-slide');
  var dots     = overlay.querySelectorAll('.ob-dot');
  var btnSkip  = document.getElementById('ob-skip');
  var btnNext  = document.getElementById('ob-next');
  var current  = 0;

  /* i18n del overlay */
  overlay.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  function _showSlide(idx) {
    slides.forEach(function(s, i) { s.classList.toggle('active', i === idx); });
    dots.forEach(function(d, i)   { d.classList.toggle('active', i === idx); });
    var isLast = idx === slides.length - 1;
    btnNext.textContent = isLast ? t('ob_start') : t('ob_next');
  }

  function _close() {
    storageSave('onboarding_done', true);
    overlay.style.display = 'none';
  }

  btnSkip.addEventListener('click', _close);
  btnNext.addEventListener('click', function () {
    if (current < slides.length - 1) { current++; _showSlide(current); }
    else _close();
  });
  dots.forEach(function(d) {
    d.addEventListener('click', function() { current = parseInt(d.dataset.slide); _showSlide(current); });
  });

  overlay.style.display = 'flex';
  _showSlide(0);
}

/* ── Modal nombre para ranking ─────────────────────────────── */
function _showNameModal(mode) {
  var modal = document.getElementById('modal-name');
  if (!modal) return;
  document.getElementById('name-modal-title').textContent = t('ranking_name_title');
  document.getElementById('name-modal-body').textContent  = t('ranking_name_body');
  var input = document.getElementById('name-input');
  if (input) { input.placeholder = t('ranking_name_placeholder'); input.value = storageLoad('player_name',''); }
  modal.style.display = 'flex';

  function _close() { modal.style.display = 'none'; }

  document.getElementById('btn-name-save').onclick = function() {
    var name = (input ? input.value.trim() : '') || t('ranking_name_placeholder');
    name = name.slice(0,20);
    storageSave('player_name', name);
    setLastEntryName(mode, name);
    _close();
  };
  document.getElementById('btn-name-skip').onclick = _close;
}

/* ── Racha de días ─────────────────────────────────────────── */
function _updateDailyStreakUI() {
  var el = document.getElementById('daily-streak-label'); if (!el) return;
  var s = getDailyStreak();
  if (s === 0)      el.textContent = t('daily_streak_0');
  else if (s === 1) el.textContent = t('daily_streak_1');
  else              el.textContent = t('daily_streak_n',{n:s});
  el.style.display = s > 0 ? 'block' : 'none';
}

/* ── Pantalla de estadísticas ──────────────────────────────── */
function renderStatsScreen() {
  var wrap = document.getElementById('stats-body'); if (!wrap) return;
  var data = loadAchievements();
  var stats = data.stats;

  if (!stats || !stats.total_games) {
    wrap.innerHTML = '<p class="empty-state">'+t('stats_no_data')+'</p>'; return;
  }

  var modeNames = {
    'guess-country': t('mode_guess_country'),
    'guess-flag':    t('mode_guess_flag'),
    'timetrial':     t('mode_time_attack'),
    'daily':         t('mode_daily')
  };
  var modeCounts = {};
  loadRanking().forEach(function(e){ modeCounts[e.mode]=(modeCounts[e.mode]||0)+1; });
  var favMode = Object.keys(modeCounts).sort(function(a,b){ return modeCounts[b]-modeCounts[a]; })[0];
  var accuracy = stats.total_games > 0
    ? Math.round((stats.total_correct / Math.max(stats.total_games * 10, 1)) * 100)
    : 0;
  accuracy = Math.min(accuracy, 100);

  var streak = getDailyStreak();
  var wrong  = getTopWrongCountries(5);

  var html = '<div class="stats-grid">';
  function stat(label, val) {
    return '<div class="stat-card card"><span class="stat-val">'+val+'</span><span class="stat-label">'+label+'</span></div>';
  }
  html += stat(t('stats_games'),        stats.total_games || 0);
  html += stat(t('stats_correct'),      stats.total_correct || 0);
  html += stat(t('stats_accuracy'),     accuracy + '%');
  html += stat(t('stats_best_streak'),  (stats.max_streak_ever||0) + ' 🔥');
  html += stat(t('stats_fav_mode'),     modeNames[favMode] || '—');
  html += stat(t('stats_daily_streak'), streak > 0 ? streak + ' 🔥' : '—');
  html += '</div>';

  if (wrong.length) {
    html += '<div class="stats-wrong-section">';
    html += '<p class="stats-section-title">'+t('stats_countries_wrong')+'</p>';
    html += '<div class="stats-wrong-list">';
    wrong.forEach(function(w) {
      var country = COUNTRIES.filter(function(c){ return c.code===w.code; })[0];
      if (!country) return;
      html += '<div class="wrong-country-row"><span class="wrong-flag">'+country.flag+'</span>'+
        '<span class="wrong-name">'+cn(country)+'</span>'+
        '<span class="wrong-count">×'+w.count+'</span></div>';
    });
    html += '</div></div>';
  }

  wrap.innerHTML = html;
}

/* ── Continente selector ───────────────────────────────────── */
function _initContinentSelector() {
  var sel = document.getElementById('continent-select'); if (!sel) return;
  sel.value = _selectedContinent;
  sel.addEventListener('change', function() {
    _selectedContinent = sel.value;
    storageSave('last_continent', _selectedContinent);
  });
}
