/**
 * js/firebase-leaderboard.js — Ranking global con Firebase Firestore
 *
 * Gestiona el leaderboard del Reto del Día usando Firestore como backend.
 * Soporta consultar ranking de cualquier fecha (navegación entre días).
 *
 * ORDEN DE CARGA: después de play-games.js, antes de leaderboard-ui.js y main.js
 * Depende de: storage.js, play-games.js
 */

var FirebaseLeaderboard = (function () {

  var _db       = null;
  var _isReady  = false;
  var _playerId = null;
  var _lastError = null;
  var COLLECTION = 'daily_scores';

  /* ── Cache para no repetir requests ────────────────── */
  var _cache = {}; /* { 'YYYY-MM-DD': { data: [...], ts: timestamp } } */
  var CACHE_TTL = 30000; /* 30 segundos */

  function init() {
    try {
      if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.log('[Leaderboard] Firebase no disponible');
        return false;
      }
      _db = firebase.firestore();
      _playerId = _getOrCreatePlayerId();
      _isReady = true;
      console.log('[Leaderboard] ✓ Init OK, player:', _playerId);
      return true;
    } catch (e) {
      _lastError = e.message || String(e);
      console.warn('[Leaderboard] ✗ Init error:', e);
      return false;
    }
  }

  function _getOrCreatePlayerId() {
    var stored = storageLoad('firebase_player_id', null);
    if (stored) return stored;
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    storageSave('firebase_player_id', id);
    return id;
  }

  function _getPlayerName() {
    if (typeof PlayGamesService !== 'undefined' && PlayGamesService.isSignedIn()) {
      var info = PlayGamesService.getPlayerInfo();
      if (info && info.displayName) return info.displayName;
    }
    var local = storageLoad('player_name', null);
    if (local) return local;
    return typeof t === 'function' ? t('profile_guest') : 'Jugador';
  }

  function formatDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function getTodayKey() {
    return formatDate(new Date());
  }

  /* ══════════════════════════════════════════════════════
   * ENVIAR PUNTUACIÓN
   * ══════════════════════════════════════════════════════ */

  function submitDailyScore(score) {
    if (!_isReady || !_db) return Promise.resolve(false);

    var today = getTodayKey();
    var docId = _playerId + '_' + today;

    return _db.collection(COLLECTION).doc(docId).get()
      .then(function (doc) {
        if (doc.exists && doc.data().score >= score) {
          console.log('[Leaderboard] Score existente mejor o igual');
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
          /* Invalidar cache de hoy */
          delete _cache[today];
          _lastError = null;
          return true;
        });
      })
      .catch(function (err) {
        _lastError = err.message || String(err);
        console.error('[Leaderboard] ✗ Error submit:', err.code, err.message);
        return false;
      });
  }

  /* ══════════════════════════════════════════════════════
   * LEER RANKING (cualquier fecha)
   * ══════════════════════════════════════════════════════ */

  /**
   * @param {string} dateKey — 'YYYY-MM-DD'
   * @param {number} [limit=50]
   * @returns {Promise<Array<{playerId, playerName, score, isMe, position}>>}
   */
  function getRanking(dateKey, limit) {
    if (!_isReady || !_db) return Promise.reject(new Error('Firebase no inicializado'));

    limit = limit || 50;

    /* Cache check */
    var cached = _cache[dateKey];
    if (cached && (Date.now() - cached.ts < CACHE_TTL)) {
      console.log('[Leaderboard] Cache hit:', dateKey);
      return Promise.resolve(cached.data.slice(0, limit));
    }

    return _db.collection(COLLECTION)
      .where('date', '==', dateKey)
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

        results.sort(function (a, b) {
          if (b.score !== a.score) return b.score - a.score;
          return a.playerName.localeCompare(b.playerName);
        });

        /* Añadir posición */
        results.forEach(function (r, i) { r.position = i + 1; });

        /* Guardar en cache */
        _cache[dateKey] = { data: results, ts: Date.now() };

        return results.slice(0, limit);
      })
      .catch(function (err) {
        _lastError = err.message || String(err);
        console.error('[Leaderboard] ✗ Error read:', err.code, err.message);
        throw err;
      });
  }

  /**
   * Busca la posición del jugador actual en un día concreto.
   * @returns {Promise<{position, score, total}|null>}
   */
  function getMyPosition(dateKey) {
    return getRanking(dateKey, 200).then(function (entries) {
      var total = entries.length;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isMe) {
          return { position: entries[i].position, score: entries[i].score, total: total };
        }
      }
      return null;
    });
  }

  return {
    init:              init,
    submitDailyScore:  submitDailyScore,
    getRanking:        getRanking,
    getMyPosition:     getMyPosition,
    getTodayKey:       getTodayKey,
    formatDate:        formatDate,
    isReady:           function () { return _isReady; },
    getPlayerId:       function () { return _playerId; },
    getLastError:      function () { return _lastError; }
  };
})();
