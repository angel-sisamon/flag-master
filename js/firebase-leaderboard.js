/**
 * js/firebase-leaderboard.js — Ranking global con Firebase Firestore
 *
 * Gestiona el leaderboard del Reto del Día usando Firestore como backend.
 * Cada jugador tiene un documento único por día (evita duplicados).
 * Si Firebase no está disponible (offline, config no puesta), todo es no-op.
 *
 * ORDEN DE CARGA: después de play-games.js, antes de main.js
 * Depende de: storage.js (storageLoad/storageSave), play-games.js (getPlayerInfo)
 */

var FirebaseLeaderboard = (function () {

  /* ── Estado interno ───────────────────────────────── */
  var _db       = null;
  var _isReady  = false;
  var _playerId = null;

  var COLLECTION = 'daily_scores';

  /* ── Inicialización ────────────────────────────────── */

  function init() {
    try {
      if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.log('[Leaderboard] Firebase no cargado, ranking desactivado');
        return false;
      }
      _db = firebase.firestore();
      _playerId = _getOrCreatePlayerId();
      _isReady = true;
      console.log('[Leaderboard] Inicializado OK, playerId:', _playerId);
      return true;
    } catch (e) {
      console.warn('[Leaderboard] Error al inicializar:', e);
      return false;
    }
  }

  /* ── ID único de jugador (persistente en localStorage) ── */

  function _getOrCreatePlayerId() {
    var stored = storageLoad('firebase_player_id', null);
    if (stored) return stored;

    /* Generar UUID v4 */
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    storageSave('firebase_player_id', id);
    return id;
  }

  /* ── Nombre del jugador (PGS > local > Invitado) ───── */

  function _getPlayerName() {
    /* 1. Nombre de PGS si está conectado */
    if (typeof PlayGamesService !== 'undefined' && PlayGamesService.isSignedIn()) {
      var info = PlayGamesService.getPlayerInfo();
      if (info && info.displayName) return info.displayName;
    }
    /* 2. Nombre local guardado (del modal de ranking) */
    var local = storageLoad('player_name', null);
    if (local) return local;
    /* 3. Fallback */
    return typeof t === 'function' ? t('profile_guest') : 'Jugador';
  }

  /* ── Fecha de hoy como string YYYY-MM-DD ───────────── */

  function _getTodayKey() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /* ══════════════════════════════════════════════════════
   * ENVIAR PUNTUACIÓN
   * ══════════════════════════════════════════════════════ */

  /**
   * Envía la puntuación del daily de hoy.
   * Usa set() con merge → si ya existe, actualiza solo si mejora.
   * docId = playerId_fecha → garantiza un doc por jugador por día.
   *
   * @param {number} score — aciertos (0-15)
   * @returns {Promise<boolean>}
   */
  function submitDailyScore(score) {
    if (!_isReady || !_db) return Promise.resolve(false);

    var today = _getTodayKey();
    var docId = _playerId + '_' + today;

    /* Leer primero para no sobrescribir un score mejor */
    return _db.collection(COLLECTION).doc(docId).get()
      .then(function (doc) {
        if (doc.exists && doc.data().score >= score) {
          console.log('[Leaderboard] Score existente es mejor o igual, no actualizo');
          return true;
        }

        return _db.collection(COLLECTION).doc(docId).set({
          date:       today,
          playerId:   _playerId,
          playerName: _getPlayerName(),
          score:      score,
          timestamp:  firebase.firestore.FieldValue.serverTimestamp()
        }).then(function () {
          console.log('[Leaderboard] ✓ Score enviado:', score);
          return true;
        });
      })
      .catch(function (err) {
        console.warn('[Leaderboard] ✗ Error enviando score:', err);
        return false;
      });
  }

  /* ══════════════════════════════════════════════════════
   * LEER RANKING
   * ══════════════════════════════════════════════════════ */

  /**
   * Obtiene el ranking del día actual.
   * Ordenado por score descendente, luego por timestamp ascendente (desempate: quien lo hizo antes).
   *
   * @param {number} [limit=50]
   * @returns {Promise<Array<{playerId, playerName, score, isMe}>>}
   */
  function getDailyRanking(limit) {
    if (!_isReady || !_db) return Promise.resolve([]);

    limit = limit || 50;
    var today = _getTodayKey();

    return _db.collection(COLLECTION)
      .where('date', '==', today)
      .orderBy('score', 'desc')
      .orderBy('timestamp', 'asc')
      .limit(limit)
      .get()
      .then(function (snapshot) {
        var results = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          results.push({
            playerId:   data.playerId,
            playerName: data.playerName || 'Jugador',
            score:      data.score,
            isMe:       data.playerId === _playerId
          });
        });
        console.log('[Leaderboard] Ranking cargado:', results.length, 'entradas');
        return results;
      })
      .catch(function (err) {
        console.warn('[Leaderboard] Error leyendo ranking:', err);
        /* Si el error es por índice faltante, logeamos la URL */
        if (err.message && err.message.indexOf('index') !== -1) {
          console.error('[Leaderboard] Necesitas crear un índice compuesto en Firestore. Mira la consola del navegador para el enlace.');
        }
        return [];
      });
  }

  /* ── API pública ───────────────────────────────────── */

  return {
    init:              init,
    submitDailyScore:  submitDailyScore,
    getDailyRanking:   getDailyRanking,
    isReady:           function () { return _isReady; },
    getPlayerId:       function () { return _playerId; }
  };
})();
