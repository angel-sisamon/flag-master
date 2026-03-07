/**
 * js/main.js — FlagMaster v4
 *
 * Nombres internos de modo: 'guess-country' | 'guess-flag' | 'timetrial' | 'daily' | 'review'
 *
 * CAMBIOS v4.1:
 *  - Auto-avance 1.5s en TODOS los modos (sin botón "Siguiente")
 *  - Selector de continente movido a Ajustes (ya no en home)
 *  - Eliminado el pill de récord del topbar
 */

var MODE_GROUPS = [
  {
    id: 'classic', icon: '🎮', nameKey: 'group_classic', expanded: true,
    modes: [
      { id:'guess-country', visualBig:'🌍', active:true },
      { id:'guess-flag',    visualBig:'🚩', active:true },
      { id:'timetrial',     visualBig:'⚡', active:true },
    ]
  },
  {
    id: 'multiplayer', icon: '👥', nameKey: 'group_multiplayer', expanded: false,
    modes: [
      { id:'quick-match', visualBig:'⚡', active:false },
      { id:'escalada',    visualBig:'📈', active:false },
      { id:'tournament',  visualBig:'🏆', active:false },
    ]
  },
];

var MODE_SOLO = { id:'daily', visualBig:'📅', active:true };
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

/* ══════════════════════════════════════════════════════════════
   INICIALIZACIÓN
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  initI18N();
  applyDarkMode(_settings.darkMode);
  AudioFX.setEnabled(_settings.soundEnabled);

  /* ★ Firebase Leaderboard ★ */
  FirebaseLeaderboard.init();

  /* ★ PGS ★ */
  ProfilePill.init();
  PlayGamesService.init().then(function (signedIn) {
    ProfilePill.updateFromPGS(signedIn);
    if (signedIn) {
      console.log('[FlagMaster] PGS conectado, sincronizando...');
      PlayGamesService.syncAllLocal();
      var pgsBtn = document.getElementById('btn-pgs-achievements');
      if (pgsBtn) pgsBtn.style.display = 'block';
    }
    _updatePlayButton();
  });

  initSettingsEvents(function (ns) {
    _settings = ns;
    applyDarkMode(ns.darkMode);
    AudioFX.setEnabled(ns.soundEnabled);
    /* ★ Leer continente desde ajustes ★ */
    _selectedContinent = _readContinentFromSettings();
    _renderHomeMenu();
    _refreshBestScore();
    updateDailyCardUI();
    _updateDailyStreakUI();
  });

  _renderHomeMenu();
  _refreshBestScore();
  updateDailyCardUI();
  _updateDailyStreakUI();
  _updatePlayButton();
  initRankingFilters();

  /* ── Botón JUGAR ── */
  document.getElementById('btn-play').addEventListener('click', function () {
    AudioFX.resume();
    var action = this.dataset.action || 'play';
    if (action === 'leaderboard') {
      LeaderboardUI.open();
    } else if (action === 'done') {
      alert(t('daily_already'));
    } else {
      _launchSelected();
    }
  });

  document.getElementById('btn-settings-home').addEventListener('click', function () { showSettingsModal(_settings); });
  document.getElementById('btn-ranking-home').addEventListener('click', function () {
    renderRankingScreen('all');
    document.querySelectorAll('#ranking-filters .chip').forEach(function (c) {
      c.classList.toggle('active', c.dataset.filter === 'all');
    });
    showScreen('ranking');
  });
  document.getElementById('btn-achievements-home').addEventListener('click', function () { renderAchievementsScreen(); showScreen('achievements'); });
  document.getElementById('btn-stats-home').addEventListener('click', function () { renderStatsScreen(); showScreen('stats'); });

  /* btn-next se mantiene como fallback por si el auto-avance falla */
  document.getElementById('btn-next').addEventListener('click', _handleNext);
  document.getElementById('btn-quit').addEventListener('click', function () {
    _pauseAll();
    showQuitModal(
      function () { _stopAll(); _gameActive = false; _refreshBestScore(); showScreen('home'); },
      _resumeTimers
    );
  });

  document.getElementById('btn-share').addEventListener('click', function () {
    var state = getGameState(); if (!state) return;
    var total = state.isTimeTrial ? state.attempted : getTotalQuestions();
    shareResult(state.score, total, state.isTimeTrial, state.isDailyChallenge);
  });
  document.getElementById('btn-retry').addEventListener('click', function () { resetGameState(); _startGameFromState(); });
  document.getElementById('btn-review').addEventListener('click', function () {
    var state = getGameState();
    if (!state || !state.wrongList || !state.wrongList.length) return;
    _launchReview(state.wrongList);
  });
  document.getElementById('btn-home').addEventListener('click', function () {
    _gameActive = false; _stopAll(); _refreshBestScore();
    updateDailyCardUI(); _updateDailyStreakUI(); _updatePlayButton();
    showScreen('home');
  });

  document.getElementById('btn-back-ranking').addEventListener('click', function () { showScreen('home'); });
  document.getElementById('btn-back-achievements').addEventListener('click', function () { showScreen('home'); });
  document.getElementById('btn-back-stats').addEventListener('click', function () { showScreen('home'); });

  /* ★ PGS: Botón logros nativos ★ */
  var pgsBtn = document.getElementById('btn-pgs-achievements');
  if (pgsBtn) { pgsBtn.addEventListener('click', function () { PlayGamesService.showAchievements(); }); }

  /* ★ Botón leaderboard en resultados ★ */
  var lbBtn = document.getElementById('btn-pgs-leaderboard');
  if (lbBtn) { lbBtn.addEventListener('click', function () { LeaderboardUI.open(); }); }

  document.addEventListener('keydown', _handleKeyboard);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      hideSettingsModal();
      LeaderboardUI.close();
      document.getElementById('modal-quit').style.display = 'none';
    }
  });

  showScreen('home');
  /* ★ Selector de continente ahora está en Ajustes, no en Home ★ */
  _initOnboarding();
});

/* ══════════════════════════════════════════════════════════════
   LEER CONTINENTE DESDE AJUSTES
   ══════════════════════════════════════════════════════════════ */
function _readContinentFromSettings() {
  var sel = document.getElementById('continent-select');
  if (sel) {
    storageSave('last_continent', sel.value);
    return sel.value;
  }
  return storageLoad('last_continent', 'all') || 'all';
}

/* ══════════════════════════════════════════════════════════════
   BOTÓN JUGAR
   ══════════════════════════════════════════════════════════════ */

function _updatePlayButton() {
  var btn = document.getElementById('btn-play'); if (!btn) return;

  var isDaily = _selectedModeId === 'daily';
  var done    = isDaily && isDailyCompleted();
  var hasLb   = FirebaseLeaderboard.isReady() || PlayGamesService.isSignedIn();

  if (done && hasLb) {
    btn.textContent    = '🏆 ' + t('leaderboard_daily');
    btn.dataset.action = 'leaderboard';
    btn.classList.add('btn-play-main--leaderboard');
  } else if (done) {
    btn.textContent    = '📅 ' + t('home_daily_done');
    btn.dataset.action = 'done';
    btn.classList.remove('btn-play-main--leaderboard');
  } else {
    btn.textContent    = t('home_play');
    btn.dataset.action = 'play';
    btn.classList.remove('btn-play-main--leaderboard');
  }
}

/* ── Home menu ───────────────────────────────────────────── */
function _renderHomeMenu() {
  var container = document.getElementById('mode-list'); if (!container) return;
  container.innerHTML = '';
  container.appendChild(_buildSoloCard(MODE_SOLO));
  MODE_GROUPS.forEach(function (group) { container.appendChild(_buildGroupBlock(group)); });
  _updateHeroVisual(_selectedModeId);
  _updatePlayButton();
}

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
  if (mode.active) { card.addEventListener('click', function () { _selectMode(mode.id); }); }
  return card;
}

function _buildGroupBlock(group) {
  var isOpen = !!_groupExpanded[group.id];
  var wrap = document.createElement('div'); wrap.className = 'mode-group';

  var header = document.createElement('button');
  header.className = 'mode-group-header' + (isOpen ? ' mode-group-header--open' : '');
  header.innerHTML = '<span class="mode-group-icon">' + group.icon + '</span>' +
    '<span class="mode-group-name">' + t(group.nameKey) + '</span>' +
    '<span class="mode-group-arrow">' + (isOpen ? '▾' : '▸') + '</span>';

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
        '<span class="mode-card-desc">' + t(keys.desc) +
          (!mode.active ? ' <span class="mode-card-badge">' + t('home_coming_soon') + '</span>' : '') +
        '</span>' +
      '</div>' +
      (mode.id === _selectedModeId ? '<span class="mode-card-check">✓</span>' : '');
    if (mode.active) { card.addEventListener('click', function () { _selectMode(mode.id); }); }
    children.appendChild(card);
  });

  header.addEventListener('click', function () {
    _groupExpanded[group.id] = !_groupExpanded[group.id];
    var open = _groupExpanded[group.id];
    header.classList.toggle('mode-group-header--open', open);
    children.classList.toggle('mode-group-children--open', open);
    header.querySelector('.mode-group-arrow').textContent = open ? '▾' : '▸';
    vibrateDevice([12], _settings.vibration);
  });

  wrap.appendChild(header); wrap.appendChild(children); return wrap;
}

function _selectMode(id) {
  _selectedModeId = id; saveLastMode(id); _refreshBestScore();
  document.querySelectorAll('.mode-card').forEach(function (c) {
    var sel = c.dataset.mode === id;
    c.classList.toggle('mode-card--selected', sel);
    var check = c.querySelector('.mode-card-check');
    if (sel && !check) { check = document.createElement('span'); check.className = 'mode-card-check'; check.textContent = '✓'; c.appendChild(check); }
    else if (!sel && check) { check.remove(); }
  });
  _updateHeroVisual(id);
  _updatePlayButton();
  vibrateDevice([18], _settings.vibration);
}

function _updateHeroVisual(id) {
  var heroEl = document.getElementById('hero-visual'); if (!heroEl) return;
  heroEl.classList.remove('hero-anim'); void heroEl.offsetWidth; heroEl.classList.add('hero-anim');
  heroEl.textContent = _getModeVisual(id);
}

/* ── Arranque ─────────────────────────────────────────────── */
function _launchSelected() {
  _settings = loadSettings(); AudioFX.setEnabled(_settings.soundEnabled);
  /* ★ Releer continente desde ajustes ★ */
  _selectedContinent = storageLoad('last_continent', 'all') || 'all';
  var hero = document.getElementById('hero-visual');
  if (hero) { hero.classList.add('hero-launch'); setTimeout(function(){ hero.classList.remove('hero-launch'); }, 400); }

  if (_selectedModeId === 'daily') {
    if (isDailyCompleted()) { alert(t('daily_already')); return; }
    var dailyCountries = getDailyCountries();
    var dailyQuestions = dailyCountries.map(function (correct) {
      var distractors = getDistractors(correct.code, 3);
      var options = shuffle([correct].concat(distractors));
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
  var pool = wrongCodes.map(function(code){ return COUNTRIES.filter(function(c){ return c.code===code; })[0]; }).filter(Boolean);
  if (!pool.length) return;
  var questions = pool.map(function(correct) {
    var distractors = getDistractors(correct.code, 3); var options = shuffle([correct].concat(distractors));
    var ci = -1; for (var i=0;i<options.length;i++){ if(options[i].code===correct.code){ci=i;break;} }
    return { correct:correct, options:options, correctIndex:ci };
  });
  initGame('review', pool.length, questions, 'all');
  _startGameFromState();
}

function _displayMode() {
  var state = getGameState(); if (!state) return 'guess-country';
  if (state.mode === 'review') return _selectedModeId === 'guess-flag' ? 'guess-flag' : 'guess-country';
  return (state.mode === 'timetrial' || state.mode === 'daily') ? 'guess-country' : state.mode;
}

function _startGameFromState() {
  _gameActive = true; var state = getGameState(); var isTA = state && state.isTimeTrial;
  showScreen('game'); setTimerVisible(!isTA && _settings.timerEnabled); setTimeAttackHUD(isTA);
  if (isTA) _startGlobalTimer(60);
  delay(100).then(function () { _renderCurrentQuestion(true); });
}

function _renderCurrentQuestion(animate) {
  if (!_gameActive) return; var state = getGameState(); var isTA = state && state.isTimeTrial;
  if (isTA) { updateHUDScoreOnly(state.score, state.streak); }
  else      { updateHUD(state.score, state.streak, state.currentIndex, getTotalQuestions()); }
  renderQuestion(getCurrentQuestion(), _displayMode(), animate, _handleAnswer);
  if (!isTA && _settings.timerEnabled) { _startPerQuestionTimer(_settings.timerDuration); }
}

/* ══════════════════════════════════════════════════════════════
   ★ RESPUESTA + AUTO-AVANCE (1.5s en TODOS los modos) ★
   ══════════════════════════════════════════════════════════════ */
function _handleAnswer(optionIndex) {
  if (!_gameActive) return; _stopPerQuestionTimer();
  if (_autoAdvance) { clearTimeout(_autoAdvance); _autoAdvance = null; }
  var result = answerQuestion(optionIndex); if (!result) return;
  vibrateDevice(result.isCorrect ? [40] : [70,30,70], _settings.vibration);
  if (result.isCorrect) { AudioFX.correct(); if (result.state.streak >= 3) AudioFX.streak(); }
  else { AudioFX.wrong(); }
  showAnswerFeedback(result.isCorrect, optionIndex, result.correctIndex, getCurrentQuestion().correct);
  var state = getGameState();
  if (state.isTimeTrial) { updateHUDScoreOnly(state.score, state.streak); }
  else { updateHUD(state.score, state.streak, state.currentIndex, getTotalQuestions()); }

  /* ★ Auto-avance: 1.5s para TODOS los modos (era solo timetrial antes) ★ */
  /* El botón "Siguiente" permanece oculto; el btn-next se mantiene en HTML como fallback */
  var btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.style.display = 'none';

  _autoAdvance = setTimeout(function () {
    _autoAdvance = null;
    _handleNext();
  }, 1500);
}

function _handleNext() {
  if (!_gameActive) return;
  if (_autoAdvance) { clearTimeout(_autoAdvance); _autoAdvance = null; }
  var res = advanceQuestion();
  if (res.finished) { _endGame(); }
  else { delay(100).then(function () { _renderCurrentQuestion(true); }); }
}

/* ── Fin de partida ──────────────────────────────────────── */
function _endGame() {
  _gameActive = false; _stopAll();

  var state    = getGameState();
  var isTA     = state.isTimeTrial;
  var isDaily  = state.isDailyChallenge;
  var isReview = state.isReview;
  var mode     = isReview ? 'review' : _selectedModeId;
  var total    = isTA ? state.attempted : getTotalQuestions();

  if (state.wrongList && state.wrongList.length) {
    state.wrongList.forEach(function(code){ recordWrongCountry(code); });
  }

  var isNewRecord = !isReview && saveBestScore(mode, state.score);
  if (!isReview) { addRankingEntry({ mode: mode, score: state.score, total: total, maxStreak: state.maxStreak, ts: Date.now() }); }

  if (isDaily) markDailyCompleted(state.score);

  /* ★ Firebase + PGS: Enviar puntuación ★ */
  if (isDaily) {
    FirebaseLeaderboard.submitDailyScore(state.score);
    PlayGamesService.submitScore('daily_challenge', state.score);
  }

  var newAchs = checkAchievements({
    mode: mode, score: state.score, total: total,
    correct: state.correct, wrong: state.wrong,
    maxStreak: state.maxStreak, isDaily: isDaily
  });

  PlayGamesService.processNewAchievements(newAchs, {
    correct: state.correct, wrong: state.wrong, score: state.score,
    total: total, mode: mode, isDaily: isDaily, maxStreak: state.maxStreak
  });

  if (isTA) { AudioFX.timeUp(); } else { AudioFX.complete(); }

  delay(200).then(function () {
    renderResults(state.score, total, state.correct, state.wrong, state.maxStreak, isNewRecord, isDaily, mode);
    renderResultsAchievements(newAchs);
    ProfilePill.renderResultsPlayerName();

    var revBtn = document.getElementById('btn-review');
    if (revBtn) revBtn.style.display = (state.wrongList && state.wrongList.length && !isReview) ? 'flex' : 'none';

    /* ★ Botón ranking en resultados ★ */
    var lbBtn = document.getElementById('btn-pgs-leaderboard');
    if (lbBtn) {
      var showLb = isDaily && (FirebaseLeaderboard.isReady() || PlayGamesService.isSignedIn());
      lbBtn.style.display = showLb ? 'flex' : 'none';
    }

    showScreen('results');
    if (state.score / Math.max(total, 1) >= 0.7) {
      delay(400).then(function () { launchConfetti(document.getElementById('confetti-canvas')); });
    }
    if (newAchs.length) { delay(800).then(function () { showNewAchievements(newAchs); }); }
    if (!isReview && isTopScore(mode, state.score, total)) {
      delay(600).then(function(){ _showNameModal(mode); });
    }
  });
}

/* ── Timers ───────────────────────────────────────────────── */
function _startPerQuestionTimer(secs) {
  _stopPerQuestionTimer(); var rem = secs; updateTimerUI(rem, secs);
  _timerHandle = setInterval(function () { rem--; updateTimerUI(rem, secs); if (rem <= 0) { _stopPerQuestionTimer(); _handleAnswer(-1); } }, 1000);
}
function _stopPerQuestionTimer() { if (_timerHandle) { clearInterval(_timerHandle); _timerHandle = null; } }
function _startGlobalTimer(secs) {
  _stopGlobalTimer(); _globalSecs = secs; updateGlobalTimer(_globalSecs);
  _globalTimer = setInterval(function () { _globalSecs--; updateGlobalTimer(_globalSecs); if (_globalSecs <= 0) { _stopGlobalTimer(); forceFinishGame(); _endGame(); } }, 1000);
}
function _stopGlobalTimer() { if (_globalTimer) { clearInterval(_globalTimer); _globalTimer = null; } }
function _stopAll()  { _stopPerQuestionTimer(); _stopGlobalTimer(); if (_autoAdvance) { clearTimeout(_autoAdvance); _autoAdvance = null; } }
function _pauseAll() { _stopAll(); }
function _resumeTimers() {
  var state = getGameState(); if (!state) return;
  if (state.isTimeTrial && _globalSecs > 0) { _startGlobalTimer(_globalSecs); }
  else if (!state.isTimeTrial && _settings.timerEnabled && !state.answered) { _startPerQuestionTimer(_settings.timerDuration); }
}

function _refreshBestScore() { renderHomeBestScore(loadBestScore(_selectedModeId)); }

function _handleKeyboard(e) {
  if (!_gameActive) return; var state = getGameState(); if (!state) return;
  if (['1','2','3','4'].indexOf(e.key) !== -1 && !state.answered) { var b = document.querySelectorAll('.option-btn')[parseInt(e.key,10)-1]; if (b) b.click(); return; }
  /* ★ Ya no se necesita Enter/Espacio para avanzar (auto-avance) ★ */
}

/* ── Onboarding ──────────────────────────────────────────── */
function _initOnboarding() {
  if (storageLoad('onboarding_done')) return;
  var overlay = document.getElementById('onboarding-overlay');
  var slides = overlay.querySelectorAll('.onboarding-slide');
  var dots = overlay.querySelectorAll('.ob-dot');
  var btnSkip = document.getElementById('ob-skip');
  var btnNext = document.getElementById('ob-next');
  var current = 0;
  overlay.querySelectorAll('[data-i18n]').forEach(function(el) { el.textContent = t(el.getAttribute('data-i18n')); });
  function _showSlide(idx) {
    slides.forEach(function(s,i){s.classList.toggle('active',i===idx);});
    dots.forEach(function(d,i){d.classList.toggle('active',i===idx);});
    btnNext.textContent = idx===slides.length-1 ? t('ob_start') : t('ob_next');
  }
  function _close() { storageSave('onboarding_done',true); overlay.style.display='none'; }
  btnSkip.addEventListener('click', _close);
  btnNext.addEventListener('click', function(){ if(current<slides.length-1){current++;_showSlide(current);}else _close(); });
  dots.forEach(function(d){ d.addEventListener('click',function(){current=parseInt(d.dataset.slide);_showSlide(current);}); });
  overlay.style.display='flex'; _showSlide(0);
}

/* ── Modal nombre ────────────────────────────────────────── */
function _showNameModal(mode) {
  var modal = document.getElementById('modal-name'); if (!modal) return;
  document.getElementById('name-modal-title').textContent = t('ranking_name_title');
  document.getElementById('name-modal-body').textContent  = t('ranking_name_body');
  var input = document.getElementById('name-input');
  if (input) { input.placeholder = t('ranking_name_placeholder'); input.value = storageLoad('player_name',''); }
  modal.style.display = 'flex';
  function _close() { modal.style.display = 'none'; }
  document.getElementById('btn-name-save').onclick = function() {
    var name = (input ? input.value.trim() : '') || t('ranking_name_placeholder');
    storageSave('player_name', name.slice(0,20)); setLastEntryName(mode, name.slice(0,20)); _close();
  };
  document.getElementById('btn-name-skip').onclick = _close;
}

/* ── Racha ────────────────────────────────────────────────── */
function _updateDailyStreakUI() {
  var el = document.getElementById('daily-streak-label'); if (!el) return;
  var s = getDailyStreak();
  if (s===0) el.textContent=t('daily_streak_0');
  else if (s===1) el.textContent=t('daily_streak_1');
  else el.textContent=t('daily_streak_n',{n:s});
  el.style.display = s > 0 ? 'block' : 'none';
}

/* ── Estadísticas ────────────────────────────────────────── */
function renderStatsScreen() {
  var wrap = document.getElementById('stats-body'); if (!wrap) return;
  var data = loadAchievements(); var stats = data.stats;
  if (!stats || !stats.total_games) { wrap.innerHTML='<p class="empty-state">'+t('stats_no_data')+'</p>'; return; }
  var modeNames = {'guess-country':t('mode_guess_country'),'guess-flag':t('mode_guess_flag'),'timetrial':t('mode_time_attack'),'daily':t('mode_daily')};
  var modeCounts = {}; loadRanking().forEach(function(e){modeCounts[e.mode]=(modeCounts[e.mode]||0)+1;});
  var favMode = Object.keys(modeCounts).sort(function(a,b){return modeCounts[b]-modeCounts[a];})[0];
  var accuracy = stats.total_games > 0 ?
    Math.min(Math.round((stats.total_correct/Math.max(stats.total_games*10,1))*100),100) : 0;
  var streak = getDailyStreak(); var wrong = getTopWrongCountries(5);
  var html = '<div class="stats-grid">';
  function stat(l,v){return '<div class="stat-card card"><span class="stat-val">'+v+'</span><span class="stat-label">'+l+'</span></div>';}
  html+=stat(t('stats_games'),stats.total_games||0);
  html+=stat(t('stats_correct'),stats.total_correct||0);
  html+=stat(t('stats_accuracy'),accuracy+'%');
  html+=stat(t('stats_best_streak'),(stats.max_streak_ever||0)+' 🔥');
  html+=stat(t('stats_fav_mode'),modeNames[favMode]||'—');
  html+=stat(t('stats_daily_streak'),streak>0?streak+' 🔥':'—');
  html+='</div>';
  if (wrong.length) {
    html+='<div class="stats-wrong-section"><p class="stats-section-title">'+t('stats_countries_wrong')+'</p><div class="stats-wrong-list">';
    wrong.forEach(function(w){
      var c=COUNTRIES.filter(function(x){return x.code===w.code;})[0]; if(!c)return;
      html+='<div class="wrong-country-row"><span class="wrong-flag">'+c.flag+'</span><span class="wrong-name">'+cn(c)+'</span><span class="wrong-count">×'+w.count+'</span></div>';
    });
    html+='</div></div>';
  }
  wrap.innerHTML=html;
}
