/**
 * js/ranking.js — Ranking local top 5 por modo, con nombre de jugador
 */
var RANK_MEDALS=['🥇','🥈','🥉','4º','5º'];

function renderRankingScreen(filter) {
  var list=document.getElementById('ranking-list'); if (!list) return;
  var all=loadRanking();
  var data=(filter&&filter!=='all') ? all.filter(function(e){return e.mode===filter;}) : all;
  /* top 5 por modo cuando filtramos, top 5 global cuando "todos" */
  data=data.slice(0,5);
  if (!data.length) {
    list.innerHTML='<p class="empty-state">'+t('ranking_empty').replace('\n','<br>')+'</p>'; return;
  }
  list.innerHTML='';
  var modeKey={'guess-country':'mode_guess_country','guess-flag':'mode_guess_flag','timetrial':'mode_time_attack','daily':'mode_daily'};
  data.forEach(function(entry,idx) {
    var div=document.createElement('div'); div.className='ranking-entry card';
    var medal=RANK_MEDALS[idx]||('#'+(idx+1));
    var isTA=entry.mode==='timetrial';
    var scoreText=isTA ? entry.score+t('ranking_hits') : entry.score+'/'+(entry.total||'?');
    var pct=isTA?'':Math.round((entry.score/(entry.total||1))*100)+'%';
    var modeLabel=t(modeKey[entry.mode]||'mode_guess_country');
    var playerName=entry.name ? '<span class="ranking-name">'+_escHtml(entry.name)+'</span>' : '';
    div.innerHTML='<span class="ranking-medal">'+medal+'</span>'+
      '<div class="ranking-info">'+
        '<div class="ranking-score-row">'+
          '<span class="ranking-score">'+scoreText+'</span>'+
          playerName+
        '</div>'+
        '<span class="ranking-meta">'+(pct?'<span class="ranking-pct">'+pct+'</span> · ':'')+
        '🔥'+(entry.maxStreak||0)+' · '+modeLabel+'</span>'+
      '</div>'+
      '<span class="ranking-date">'+dateLabel(entry.ts)+'</span>';
    list.appendChild(div);
  });
}

function _escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function initRankingFilters() {
  var filtersEl=document.getElementById('ranking-filters'); if (!filtersEl) return;
  filtersEl.querySelectorAll('.chip').forEach(function(chip) {
    chip.addEventListener('click',function() {
      filtersEl.querySelectorAll('.chip').forEach(function(c){c.classList.remove('active');});
      chip.classList.add('active');
      renderRankingScreen(chip.dataset.filter);
    });
  });
}
