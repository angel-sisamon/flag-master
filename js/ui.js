/**
 * js/ui.js — Renderizado DOM. Emojis 100% offline. i18n integrado.
 *
 * CAMBIOS v4.1:
 *  - showAnswerFeedback ya NO muestra el btn-next (auto-avance en main.js)
 *  - country-display forzado a flex-direction:column para alineación vertical
 */
var OPTION_BADGES=['A','B','C','D'];
var _CIRC=2*Math.PI*18;

/* ── Screens ──────────────────────────────────────── */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(function(s) {
    var isT=s.id==='screen-'+name;
    s.classList.toggle('active',isT);
    if (isT){ s.classList.add('entering'); setTimeout(function(){s.classList.remove('entering');},450); }
  });
}

/* ── HUD ──────────────────────────────────────────── */
function updateHUD(score, streak, currentIndex, total) {
  var se=document.getElementById('hud-score');
  var st=document.getElementById('hud-streak');
  var pt=document.getElementById('hud-progress-text');
  var pb=document.getElementById('progress-bar');
  if (se){se.textContent=score;addTempClass(se,'pop',400);}
  if (st){st.textContent=streak;if(streak>=3)addTempClass(st.closest('.hud-stat'),'burst',500);}
  if (pt) pt.textContent=(currentIndex+1)+'/'+total;
  if (pb) pb.style.width=(((currentIndex+1)/total)*100)+'%';
}
function setTimeAttackHUD(enabled) {
  var gt=document.getElementById('hud-global-timer');
  var pt=document.getElementById('hud-progress-text');
  if (gt) gt.style.display=enabled?'flex':'none';
  if (pt) pt.style.display=enabled?'none':'block';
}
function updateGlobalTimer(secs) {
  var el=document.getElementById('hud-global-timer-val'); if (!el) return;
  el.textContent=secs;
  el.classList.toggle('timer-critical',secs<=10);
  if (secs<=10) AudioFX.tick();
}
function updateHUDScoreOnly(score, streak) {
  var se=document.getElementById('hud-score');
  var st=document.getElementById('hud-streak');
  var pb=document.getElementById('progress-bar');
  if (se){se.textContent=score;addTempClass(se,'pop',400);}
  if (st){st.textContent=streak;if(streak>=3)addTempClass(st.closest('.hud-stat'),'burst',500);}
  if (pb) pb.style.width=Math.min(100,((score%10)/10)*100)+'%';
}

/* ── Pregunta ─────────────────────────────────────── */
function renderQuestion(question, mode, animate, onAnswer) {
  var flipper=document.getElementById('card-flipper');
  var flagDisp=document.getElementById('flag-display');
  var flagWrap=document.getElementById('flag-img-wrap');
  var cntryDisp=document.getElementById('country-display');
  var cntryLbl=document.getElementById('country-name-label');
  var optGrid=document.getElementById('options-grid');
  var card=document.getElementById('question-card');

  if (flipper) flipper.classList.remove('flipped');
  document.getElementById('feedback-bar').style.display='none';
  document.getElementById('btn-next').style.display='none';
  document.getElementById('btn-next').textContent=t('game_next');

  if (animate&&card){ card.classList.remove('slide-in'); void card.offsetWidth; card.classList.add('slide-in'); }

  if (mode==='guess-country'||mode==='timetrial'||mode==='daily') {
    if(flagDisp) flagDisp.style.display='flex';
    if(cntryDisp) cntryDisp.style.display='none';
    if(flagWrap) flagWrap.innerHTML='<span class="flag-emoji-lg">'+question.correct.flag+'</span>';
  } else {
    /* ★ Modo guess-flag: alineación vertical (pregunta arriba, país debajo) ★ */
    if(flagDisp) flagDisp.style.display='none';
    if(cntryDisp) {
      cntryDisp.style.display='flex';
      cntryDisp.style.flexDirection='column';
      cntryDisp.style.alignItems='center';
    }
    if(cntryLbl) cntryLbl.textContent=cn(question.correct);
    var prompt=document.getElementById('country-prompt-label');
    if(prompt) prompt.textContent=t('game_flag_prompt');
  }

  optGrid.innerHTML='';
  for (var i=0;i<question.options.length;i++) optGrid.appendChild(_optBtn(question.options[i],i,mode,onAnswer));
}

function _optBtn(option, idx, mode, onAnswer) {
  var btn=document.createElement('button');
  btn.className='option-btn';
  btn.dataset.index=idx;
  var badge='<span class="option-badge">'+OPTION_BADGES[idx]+'</span>';
  if (mode==='guess-flag') {
    btn.innerHTML=badge+'<span class="option-flag-emoji">'+option.flag+'</span>';
  } else {
    btn.innerHTML=badge+'<span class="option-text">'+cn(option)+'</span>';
  }
  btn.addEventListener('click',(function(ci){return function(){onAnswer(ci);};})(idx),{once:true});
  return btn;
}

/* ── Feedback + flip card ─────────────────────────── */
function showAnswerFeedback(isCorrect, selectedIndex, correctIndex, correctCountry) {
  document.querySelectorAll('.option-btn').forEach(function(btn,i) {
    btn.disabled=true;
    if (i===correctIndex) btn.classList.add('correct');
    else if (i===selectedIndex&&!isCorrect) btn.classList.add('wrong');
    else btn.classList.add('dimmed');
  });
  var fb=document.getElementById('feedback-bar');
  var fi=document.getElementById('feedback-icon');
  var ft=document.getElementById('feedback-text');
  fb.style.display='flex'; fb.className='feedback-bar';
  if (isCorrect) {
    fb.classList.add('correct-feedback'); fi.textContent='✅';
    ft.textContent=t('correct_'+(Math.floor(Math.random()*7)+1));
  } else {
    fb.classList.add('wrong-feedback'); fi.textContent='❌';
    ft.textContent=t('wrong_was')+correctCountry.flag+' '+cn(correctCountry);
  }
  /* Flip card reveal */
  var revealEl=document.getElementById('reveal-content');
  if (revealEl) {
    revealEl.innerHTML='<span class="flag-emoji-reveal">'+correctCountry.flag+'</span>'+
      '<div class="reveal-name">'+cn(correctCountry)+'</div>';
  }
  setTimeout(function(){
    var flipper=document.getElementById('card-flipper');
    if (flipper) flipper.classList.add('flipped');
  },320);

  /* ★ CAMBIO v4.1: Ya NO mostramos btn-next. El auto-avance en main.js se encarga. ★ */
  /* var next=document.getElementById('btn-next');
     if (next) { next.textContent=t('game_next'); next.style.display='flex'; } */
}

/* ── Timer ────────────────────────────────────────── */
function updateTimerUI(remaining, total) {
  var circle=document.getElementById('timer-circle');
  var text=document.getElementById('timer-text');
  var cont=document.getElementById('timer-container');
  var urgent=remaining<=5;
  if (circle){circle.style.strokeDashoffset=_CIRC-(remaining/total)*_CIRC;circle.classList.toggle('urgent',urgent);}
  if (text) text.textContent=remaining;
  if (cont) cont.classList.toggle('urgent',urgent);
}
function setTimerVisible(v) { var el=document.getElementById('timer-container'); if(el) el.style.display=v?'flex':'none'; }

/* ── Resultados ───────────────────────────────────── */
function renderResults(score, total, correct, wrong, maxStreak, isNewRecord, isDaily, mode) {
  var isTA=mode==='timetrial';
  var pct=total>0?(score/total)*100:0;
  var trophy=document.getElementById('results-trophy');
  var title=document.getElementById('results-title');
  var sub=document.getElementById('results-subtitle');
  if (trophy) trophy.textContent=pct===100?'🏆':pct>=80?'🥇':pct>=60?'🥈':pct>=40?'🥉':'🎮';
  if (title) {
    if (isTA) title.textContent=score>=20?t('results_ta_super'):score>=10?t('results_ta_great'):t('results_ta_ok');
    else title.textContent=pct===100?t('results_perfect_title'):pct>=80?t('results_great_title'):pct>=60?t('results_good_title'):pct>=40?t('results_ok_title'):t('results_bad_title');
  }
  if (sub) {
    if (isTA) sub.textContent=t('results_ta_sub');
    else sub.textContent=pct===100?t('results_perfect_sub'):t('results_pct_sub',{pct:Math.round(pct)});
  }
  document.getElementById('results-score-num').textContent=score;
  document.getElementById('results-score-denom').textContent=isTA?t('ranking_hits'):'/'+(total||'?');
  document.getElementById('res-correct').textContent=correct;
  document.getElementById('res-correct-label').textContent=t('results_correct');
  document.getElementById('res-wrong').textContent=wrong;
  document.getElementById('res-wrong-label').textContent=t('results_wrong');
  document.getElementById('res-streak').textContent=maxStreak;
  document.getElementById('res-streak-label').textContent=t('results_streak');
  var rec=document.getElementById('results-new-record');
  if (rec) rec.style.display=isNewRecord?'block':'none';
  if (rec) rec.textContent=t('results_new_record');
  var db=document.getElementById('results-daily-badge');
  if (db) db.style.display=isDaily?'block':'none';
  if (db) db.textContent=t('results_daily_done');
  var retryBtn=document.getElementById('btn-retry');
  if (retryBtn) { retryBtn.textContent=t('btn_retry'); retryBtn.style.display=isDaily?'none':'flex'; }
  document.getElementById('btn-home').textContent=t('btn_home');
}

function renderResultsAchievements(ids) {
  var wrap=document.getElementById('results-achievements');
  var list=document.getElementById('results-achievements-list');
  if (!wrap||!list) return;
  if (!ids||!ids.length){wrap.style.display='none';return;}
  list.innerHTML='';
  var keys=ACHIEVEMENT_I18N_KEYS;
  ids.forEach(function(id) {
    if (!keys[id]) return;
    var span=document.createElement('span');
    span.className='result-ach-badge';
    span.textContent=(ACHIEVEMENT_ICONS[id]||'🏅')+' '+t(keys[id].n);
    list.appendChild(span);
  });
  document.querySelector('#results-achievements .results-achievements-title').textContent=t('results_ach_title');
  wrap.style.display='block';
}

function renderHomeBestScore(score) {
  var el=document.getElementById('home-best-score');
  if (el) el.textContent=score>0?score:'—';
}

/* ── Compartir resultado ──────────────────────────────────── */
function shareResult(score, total, isTA, isDaily) {
  var emoji = isTA
    ? (score>=20?'🚀':score>=10?'⚡':'🎮')
    : (score===total?'🏆':score/total>=0.8?'🥇':score/total>=0.6?'🥈':'🥉');
  var modeStr = isTA ? t('mode_time_attack') : isDaily ? t('mode_daily') : '';
  var scoreStr = isTA ? (score+t('ranking_hits')) : (score+'/'+total);
  var lang = getLang();
  var title = 'FlagMaster ' + emoji;
  var text = lang==='en'
    ? scoreStr+(modeStr?' — '+modeStr:'')+'\nCan you beat me? 🌍 flagmaster.app'
    : scoreStr+(modeStr?' — '+modeStr:'')+'\n¿Puedes superarme? 🌍 flagmaster.app';

  /* 1. Capacitor Share plugin — nativo Android/iOS, abre share sheet real */
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share) {
    window.Capacitor.Plugins.Share.share({
      title: title,
      text:  title + '\n' + text,
      dialogTitle: lang==='en' ? 'Share your result' : 'Comparte tu resultado'
    }).catch(function(){});
    return;
  }

  /* 2. Fallback — copiar al portapapeles + toast (por si el plugin no está instalado) */
  var toastMsg = lang==='en' ? 'Result copied!' : '¡Resultado copiado!';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(title + '\n' + text).then(function () {
      var toastEl = document.getElementById('achievement-toast');
      var icon    = document.getElementById('achievement-toast-icon');
      var name    = document.getElementById('achievement-toast-name');
      var label   = document.getElementById('achievement-toast-label');
      if (toastEl) {
        if (icon)  icon.textContent  = '📋';
        if (name)  name.textContent  = toastMsg;
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
    }).catch(function(){});
  }
}
