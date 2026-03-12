/**
 * js/game.js
 * Lógica del juego: preguntas, scoring, racha, modos.
 * Depende de: countries-data.js, utils.js
 *
 * Modos soportados:
 *   'guess-country'  — ver bandera, elegir país (normal)
 *   'guess-flag'     — ver país, elegir bandera  (normal)
 *   'daily'          — igual que guess-country con preguntas fijas del día
 *   'timetrial'      — igual que guess-country, 60s globales, sin límite de preguntas
 */

var _gameState = null;

function _isValidGameStateShape(s) {
  return !!s &&
    typeof s === 'object' &&
    typeof s.mode === 'string' &&
    Array.isArray(s.questions) &&
    typeof s.currentIndex === 'number' &&
    typeof s.score === 'number' &&
    typeof s.streak === 'number' &&
    typeof s.maxStreak === 'number' &&
    typeof s.correct === 'number' &&
    typeof s.wrong === 'number' &&
    typeof s.attempted === 'number' &&
    Array.isArray(s.wrongList) &&
    typeof s.answered === 'boolean' &&
    typeof s.finished === 'boolean' &&
    typeof s.isTimeTrial === 'boolean' &&
    typeof s.isDailyChallenge === 'boolean';
}

/**
 * Inicializa una nueva partida.
 * @param {string} mode
 * @param {number} numQuestions  ignorado para 'timetrial' y 'daily'
 * @param {Array}  prebuiltQuestions  para 'daily' o 'review'
 * @param {string} continent  'eu'|'am'|'as'|'af'|'oc'|'all'|null
 */
function initGame(mode, numQuestions, prebuiltQuestions, continent) {
  var questions;

  if (prebuiltQuestions && prebuiltQuestions.length) {
    questions = prebuiltQuestions;
  } else {
    var pool = continent && continent !== 'all'
      ? getCountriesByContinent(continent)
      : COUNTRIES.slice();

    var count = mode === 'timetrial'
      ? Math.min(60, pool.length)
      : Math.min(numQuestions || 10, pool.length);

    pool = shuffle(pool).slice(0, count);
    questions = pool.map(function (correct) {
      var distractors  = getDistractors(correct.code, 3);
      var options      = shuffle([correct].concat(distractors));
      var correctIndex = -1;
      for (var i = 0; i < options.length; i++) {
        if (options[i].code === correct.code) { correctIndex = i; break; }
      }
      return { correct: correct, options: options, correctIndex: correctIndex };
    });
  }

  _gameState = {
    mode:             mode,
    continent:        continent || 'all',
    questions:        questions,
    originalQuestions:questions.slice(),
    currentIndex:     0,
    score:            0,
    streak:           0,
    maxStreak:        0,
    correct:          0,
    wrong:            0,
    attempted:        0,
    hardCorrectCount: 0,
    wrongList:        [],
    answered:         false,
    finished:         false,
    isTimeTrial:      mode === 'timetrial',
    isDailyChallenge: mode === 'daily',
    isReview:         mode === 'review',
  };
}

/** Copia superficial del estado actual. */
function getGameState() {
  if (!_isValidGameStateShape(_gameState)) return null;
  return {
    mode:             _gameState.mode,
    continent:        _gameState.continent,
    questions:        _gameState.questions,
    currentIndex:     _gameState.currentIndex,
    score:            _gameState.score,
    streak:           _gameState.streak,
    maxStreak:        _gameState.maxStreak,
    correct:          _gameState.correct,
    wrong:            _gameState.wrong,
    hardCorrectCount: _gameState.hardCorrectCount,
    attempted:        _gameState.attempted,
    wrongList:        _gameState.wrongList.slice(),
    answered:         _gameState.answered,
    finished:         _gameState.finished,
    isTimeTrial:      _gameState.isTimeTrial,
    isDailyChallenge: _gameState.isDailyChallenge,
    isReview:         _gameState.isReview,
  };
}

function getCurrentQuestion() {
  if (!_isValidGameStateShape(_gameState)) return null;
  return _gameState.questions[_gameState.currentIndex] || null;
}

function getTotalQuestions() {
  return _isValidGameStateShape(_gameState) ? _gameState.questions.length : 0;
}

/**
 * Registra la respuesta del jugador.
 * @param {number} optionIndex  0-3, o -1 si el tiempo se agotó.
 * @returns {{ isCorrect, correctIndex, state } | null}
 */
function answerQuestion(optionIndex) {
  if (!_gameState || _gameState.answered || _gameState.finished) return null;

  var q         = getCurrentQuestion();
  var isCorrect = optionIndex === q.correctIndex;

  _gameState.answered = true;
  _gameState.attempted++;

  if (isCorrect) {
    _gameState.score++;
    _gameState.streak++;
    _gameState.correct++;
    if (_gameState.streak > _gameState.maxStreak) {
      _gameState.maxStreak = _gameState.streak;
    }
  } else {
    _gameState.streak = 0;
    _gameState.wrong++;
    /* guardar para repaso */
    var wCode = q.correct.code;
    if (_gameState.wrongList.indexOf(wCode) === -1) _gameState.wrongList.push(wCode);
  }

  return {
    isCorrect:    isCorrect,
    correctIndex: q.correctIndex,
    state:        getGameState(),
  };
}

/**
 * Avanza a la siguiente pregunta.
 * @returns {{ finished: boolean, state: object }}
 */
function advanceQuestion() {
  if (!_gameState) return { finished: true, state: null };
  _gameState.currentIndex++;
  _gameState.answered = false;

  if (_gameState.isTimeTrial) {
    /* En timetrial: ciclo infinito, nunca se pone finished (lo hace forceFinishGame) */
    if (_gameState.currentIndex >= _gameState.questions.length) {
      _gameState.currentIndex = 0;
    }
    return { finished: false, state: getGameState() };
  }

  if (_gameState.currentIndex >= _gameState.questions.length) {
    _gameState.finished = true;
  }
  return { finished: _gameState.finished, state: getGameState() };
}

/**
 * Fuerza el final de la partida (usado por el timer del contrarreloj).
 */
function forceFinishGame() {
  if (_gameState) _gameState.finished = true;
}

/** Reinicia con los mismos parámetros. En daily preserva las preguntas originales del reto. */
function resetGameState() {
  if (!_gameState) return;
  var prebuilt = (_gameState.isDailyChallenge || _gameState.isReview) ? _gameState.originalQuestions : null;
  initGame(_gameState.mode, _gameState.questions.length, prebuilt, _gameState.continent);
}
