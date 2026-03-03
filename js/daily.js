/**
 * js/daily.js — Reto diario con seed por fecha (determinista)
 */
var DAILY_COUNT = 15;

function getDailySeed() {
  var d=new Date();
  return parseInt(d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'),10);
}

function getDailyCountries() {
  var rng = seededRng(getDailySeed());
  return seededShuffle(COUNTRIES.slice(), rng).slice(0, DAILY_COUNT);
}

function updateDailyCardUI() {
  var icon=document.getElementById('daily-icon');
  var status=document.getElementById('daily-status');
  if (!icon||!status) return;
  if (isDailyCompleted()) {
    var sc=getDailyCompletedScore();
    icon.textContent='✅';
    status.textContent=t('home_daily_done')+(sc!==null?' · '+sc+'/'+DAILY_COUNT:'');
    if (status.closest('.daily-card')) status.closest('.daily-card').classList.add('daily-done');
  } else {
    icon.textContent='📅';
    status.textContent=t('home_daily_play');
    if (status.closest('.daily-card')) status.closest('.daily-card').classList.remove('daily-done');
  }
}
