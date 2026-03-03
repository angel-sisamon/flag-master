/**
 * js/storage.js — localStorage abstraction
 */
var STORE_PREFIX = 'flagmaster_';

function storageSave(key, value) {
  try { localStorage.setItem(STORE_PREFIX+key, JSON.stringify(value)); } catch(e) {}
}
function storageLoad(key, def) {
  try {
    var raw = localStorage.getItem(STORE_PREFIX+key);
    return raw === null ? (def !== undefined ? def : null) : JSON.parse(raw);
  } catch(e) { return def !== undefined ? def : null; }
}

function storeSaveLang(lang) { storageSave('lang', lang); }

function loadSettings() {
  var defaults = {numQuestions:10,timerEnabled:false,timerDuration:15,soundEnabled:true,vibration:true,darkMode:null};
  var saved = storageLoad('settings', defaults);
  /* darkMode null = nunca se ha guardado preferencia → usar sistema */
  if (saved.darkMode === null || saved.darkMode === undefined) {
    saved.darkMode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  return saved;
}
function saveSettings(s) { storageSave('settings', s); }

function loadBestScore(mode)  { return (storageLoad('best_scores',{})[mode])||0; }
function saveBestScore(mode, score) {
  var scores = storageLoad('best_scores',{});
  if (score > (scores[mode]||0)) { scores[mode]=score; storageSave('best_scores',scores); return true; }
  return false;
}

function loadLastMode()      { return storageLoad('last_mode','guess-country'); }
function saveLastMode(mode)  { storageSave('last_mode', mode); }

function loadRanking()       { return storageLoad('ranking',[]); }
function saveRanking(list)   { storageSave('ranking', list); }
function addRankingEntry(entry) {
  var list = loadRanking();
  list.push(entry);
  list.sort(function(a,b) {
    var pa = a.mode==='timetrial' ? a.score : (a.score/(a.total||1));
    var pb = b.mode==='timetrial' ? b.score : (b.score/(b.total||1));
    return pb - pa;
  });
  saveRanking(list.slice(0,50));
}

/** Devuelve true si la puntuación entraría en el top 5 del modo */
function isTopScore(mode, score, total) {
  var all = loadRanking().filter(function(e){ return e.mode===mode; });
  if (all.length < 5) return true;
  var rank = function(e){ return mode==='timetrial' ? e.score : (e.score/(e.total||1)); };
  var newRank = mode==='timetrial' ? score : (score/(total||1));
  all.sort(function(a,b){ return rank(b)-rank(a); });
  return newRank >= rank(all[4]);
}

/** Actualiza el nombre de la última entrada del modo */
function setLastEntryName(mode, name) {
  var list = loadRanking();
  /* busca la entrada más reciente de este modo sin nombre */
  for (var i = list.length-1; i >= 0; i--) {
    if (list[i].mode === mode && !list[i].name) { list[i].name = name; break; }
  }
  saveRanking(list);
}

function loadAchievements() {
  return storageLoad('achievements',{unlocked:[],stats:{total_correct:0,total_games:0,modes_played:[],daily_completed:0,max_time_attack:0,max_streak_ever:0}});
}
function saveAchievements(d) { storageSave('achievements', d); }

function loadDailyStatus()   { return storageLoad('daily',{}); }
function saveDailyStatus(d)  { storageSave('daily', d); }
function getDailyKey() {
  var d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function isDailyCompleted() { return !!(loadDailyStatus()[getDailyKey()]); }
function markDailyCompleted(score) {
  var st=loadDailyStatus(); st[getDailyKey()]={score:score,ts:Date.now()}; saveDailyStatus(st);
}
function getDailyCompletedScore() { var d=loadDailyStatus()[getDailyKey()]; return d?d.score:null; }

/** Calcula racha de días consecutivos completando el reto */
function getDailyStreak() {
  var status = loadDailyStatus();
  var streak = 0;
  var d = new Date();
  /* empieza desde ayer si hoy no está completado, o desde hoy si sí */
  if (!status[getDailyKey()]) { d.setDate(d.getDate()-1); }
  for (var i = 0; i < 365; i++) {
    var key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if (status[key]) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

/* ── Estadísticas y países fallados ──────────────────────── */
function loadWrongCountries() { return storageLoad('wrong_countries', {}); }
function saveWrongCountries(d) { storageSave('wrong_countries', d); }
function recordWrongCountry(code) {
  var d = loadWrongCountries();
  d[code] = (d[code]||0) + 1;
  saveWrongCountries(d);
}
function getTopWrongCountries(n) {
  var d = loadWrongCountries();
  var arr = Object.keys(d).map(function(k){ return {code:k, count:d[k]}; });
  arr.sort(function(a,b){ return b.count-a.count; });
  return arr.slice(0, n||5);
}
