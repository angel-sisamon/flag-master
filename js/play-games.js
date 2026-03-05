/**
 * js/play-games.js — Integración con Google Play Games Services
 *
 * Puente entre achievements.js (logros locales) y PGS (logros de Google).
 * Usa plugin personalizado PlayGamesPlugin (sin dependencia npm externa).
 * Solo funciona dentro de Capacitor (Android nativo).
 * En navegador web, todas las funciones son no-op (no hacen nada).
 *
 * ORDEN DE CARGA: después de achievements.js, antes de main.js
 */

var PlayGamesService = (function () {

  /* ── Estado interno ───────────────────────────────── */
  var _isAvailable = false;
  var _isSignedIn  = false;

  /* ──────────────────────────────────────────────────────────────
   * MAPEO: ID interno de FlagMaster → ID de Google Play Games
   *
   * ⚠️  REEMPLAZA cada valor 'CgkI_REEMPLAZA_...' con el ID real
   *     generado por Google Play Console al crear cada logro.
   * ────────────────────────────────────────────────────────────── */
  var ACHIEVEMENT_MAP = {
    'first_correct':   'CgkIx-P40Z4ZEAIQAQ',
    'streak_3':        'CgkIx-P40Z4ZEAIQAg',
    'streak_5':        'CgkIx-P40Z4ZEAIQAw',
    'streak_10':       'CgkIx-P40Z4ZEAIQBA',
    'perfect_game':    'CgkIx-P40Z4ZEAIQBQ',
    'no_mistakes':     'CgkIx-P40Z4ZEAIQBg',
    'daily_first':     'CgkIx-P40Z4ZEAIQBw',
    'daily_3':         'CgkIx-P40Z4ZEAIQCA',
    'time_attack_10':  'CgkIx-P40Z4ZEAIQCQ',
    'time_attack_20':  'CgkIx-P40Z4ZEAIQCg',
    'play_5_games':    'CgkIx-P40Z4ZEAIQCw',
    'play_all_modes':  'CgkIx-P40Z4ZEAIQDA',
    'score_50':        'CgkIx-P40Z4ZEAIQDQ',
    'score_100':       'CgkIx-P40Z4ZEAIQDg'
  };

  /* ── Logros incrementales ──────────────────────────── */
  var INCREMENTAL_ACHIEVEMENTS = {
    'daily_3':      true,
    'play_5_games': true,
    'score_50':     true,
    'score_100':    true
  };

  /* ── Referencia al plugin personalizado ────────────── */
  var _plugin = null;

  function _getPlugin() {
    if (_plugin) return _plugin;
    try {
      if (window.Capacitor && window.Capacitor.Plugins) {
        _plugin = window.Capacitor.Plugins.PlayGamesPlugin;
      }
    } catch (e) {
      console.warn('[PlayGames] Plugin no disponible:', e);
    }
    return _plugin;
  }

  /* ── Inicialización ────────────────────────────────── */

  function init() {
    var plugin = _getPlugin();
    if (!plugin) {
      console.log('[PlayGames] No estamos en Capacitor, PGS desactivado');
      _isAvailable = false;
      return Promise.resolve(false);
    }

    _isAvailable = true;
    console.log('[PlayGames] Plugin detectado, intentando sign-in...');

    return plugin.signIn()
      .then(function (result) {
        _isSignedIn = !!(result && result.isSignedIn);
        console.log('[PlayGames] Sign-in resultado:', _isSignedIn);
        return _isSignedIn;
      })
      .catch(function (err) {
        _isSignedIn = false;
        console.warn('[PlayGames] Sign-in falló:', err);
        return false;
      });
  }

  /* ── Desbloquear logro estándar ────────────────────── */

  function unlockAchievement(localId) {
    if (!_isAvailable || !_isSignedIn) return Promise.resolve();

    var googleId = ACHIEVEMENT_MAP[localId];
    if (!googleId || googleId.indexOf('REEMPLAZA') !== -1) return Promise.resolve();
    if (INCREMENTAL_ACHIEVEMENTS[localId]) return Promise.resolve();

    var plugin = _getPlugin();
    if (!plugin) return Promise.resolve();

    console.log('[PlayGames] Desbloqueando:', localId);
    return plugin.unlockAchievement({ id: googleId })
      .then(function () { console.log('[PlayGames] ✓', localId); })
      .catch(function (err) { console.warn('[PlayGames] ✗', localId, err); });
  }

  /* ── Incrementar logro incremental ─────────────────── */

  function incrementAchievement(localId, steps) {
    if (!_isAvailable || !_isSignedIn) return Promise.resolve();

    var googleId = ACHIEVEMENT_MAP[localId];
    if (!googleId || googleId.indexOf('REEMPLAZA') !== -1) return Promise.resolve();

    var plugin = _getPlugin();
    if (!plugin) return Promise.resolve();

    steps = steps || 1;

    console.log('[PlayGames] Incrementando:', localId, '+' + steps);
    return plugin.incrementAchievement({ id: googleId, count: steps })
      .then(function () { console.log('[PlayGames] ✓', localId); })
      .catch(function (err) { console.warn('[PlayGames] ✗', localId, err); });
  }

  /* ── Mostrar pantalla nativa de logros ─────────────── */

  function showAchievements() {
    if (!_isAvailable || !_isSignedIn) return Promise.resolve();
    var plugin = _getPlugin();
    if (!plugin) return Promise.resolve();
    return plugin.showAchievements()
      .catch(function (err) { console.warn('[PlayGames] Error UI logros:', err); });
  }

  /* ── Sincronizar logros locales existentes con PGS ─── */

  function syncAllLocal() {
    if (!_isAvailable || !_isSignedIn) return Promise.resolve();

    var data = loadAchievements();
    var unlocked = data.unlocked;
    var stats = data.stats;
    var promises = [];

    unlocked.forEach(function (localId) {
      if (INCREMENTAL_ACHIEVEMENTS[localId]) {
        var totalSteps = 0;
        if (localId === 'daily_3')      totalSteps = stats.daily_completed || 0;
        if (localId === 'play_5_games') totalSteps = stats.total_games || 0;
        if (localId === 'score_50')     totalSteps = Math.min(stats.total_correct || 0, 50);
        if (localId === 'score_100')    totalSteps = Math.min(stats.total_correct || 0, 100);
        if (totalSteps > 0) promises.push(incrementAchievement(localId, totalSteps));
      } else {
        promises.push(unlockAchievement(localId));
      }
    });

    return Promise.all(promises).then(function () {
      console.log('[PlayGames] Sync completado:', unlocked.length, 'logros');
    });
  }

  /* ── Procesar logros nuevos de una partida ─────────── */

  function processNewAchievements(newIds, result) {
    if (!_isAvailable || !_isSignedIn) return Promise.resolve();

    var promises = [];

    if (newIds && newIds.length) {
      newIds.forEach(function (id) {
        if (!INCREMENTAL_ACHIEVEMENTS[id]) {
          promises.push(unlockAchievement(id));
        }
      });
    }

    promises.push(_updateIncrementals(result));
    return Promise.all(promises);
  }

  function _updateIncrementals(result) {
    if (!result) return Promise.resolve();
    var promises = [];

    if (result.correct && result.correct > 0) {
      promises.push(incrementAchievement('score_50', result.correct));
      promises.push(incrementAchievement('score_100', result.correct));
    }
    promises.push(incrementAchievement('play_5_games', 1));
    if (result.isDaily) {
      promises.push(incrementAchievement('daily_3', 1));
    }

    return Promise.all(promises);
  }

  /* ── API pública ───────────────────────────────────── */
  return {
    init:                   init,
    unlockAchievement:      unlockAchievement,
    incrementAchievement:   incrementAchievement,
    showAchievements:       showAchievements,
    syncAllLocal:           syncAllLocal,
    processNewAchievements: processNewAchievements,
    isAvailable:  function () { return _isAvailable; },
    isSignedIn:   function () { return _isSignedIn; }
  };
})();
