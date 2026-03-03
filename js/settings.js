/**
 * js/settings.js
 */
function getChipValue(id) { var a=document.querySelector('#'+id+' .chip.active'); return a?a.dataset.value:null; }
function setChipActive(id, v) { document.querySelectorAll('#'+id+' .chip').forEach(function(c){c.classList.toggle('active',c.dataset.value===v);}); }
function applyDarkMode(dark) {
  document.body.classList.toggle('dark',!!dark);
  document.body.classList.toggle('light',!dark);
}

/** Devuelve el tema del sistema: true = oscuro */
function getSystemDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function syncSettingsUI(s) {
  setChipActive('chips-questions',String(s.numQuestions));
  setChipActive('chips-timer',String(s.timerDuration));
  var tt=document.getElementById('toggle-timer'),ts=document.getElementById('toggle-sound'),
      tv=document.getElementById('toggle-vibration'),td=document.getElementById('toggle-dark');
  if(tt)tt.checked=!!s.timerEnabled; if(ts)ts.checked=!!s.soundEnabled;
  if(tv)tv.checked=!!s.vibration;    if(td)td.checked=!!s.darkMode;
  var g=document.getElementById('group-timer-duration');
  if(g)g.style.display=s.timerEnabled?'flex':'none';
  /* lang chips */
  setChipActive('chips-lang', getLang ? getLang() : 'es');
}

function readSettingsUI() {
  return {
    numQuestions:  Number(getChipValue('chips-questions')||10),
    timerEnabled:  !!(document.getElementById('toggle-timer')||{}).checked,
    timerDuration: Number(getChipValue('chips-timer')||15),
    soundEnabled:  !!(document.getElementById('toggle-sound')||{}).checked,
    vibration:     !!(document.getElementById('toggle-vibration')||{}).checked,
    darkMode:      !!(document.getElementById('toggle-dark')||{}).checked,
  };
}

function showSettingsModal(s) { syncSettingsUI(s); document.getElementById('modal-settings').style.display='flex'; }
function hideSettingsModal()   { document.getElementById('modal-settings').style.display='none'; }

function initSettingsEvents(onSaved) {
  if(!supportsVibration()){ var gv=document.getElementById('group-vibration'); if(gv)gv.style.display='none'; }

  document.querySelectorAll('.chip-group').forEach(function(g){
    g.querySelectorAll('.chip').forEach(function(c){
      c.addEventListener('click',function(){
        g.querySelectorAll('.chip').forEach(function(x){x.classList.remove('active');});
        c.classList.add('active');
      });
    });
  });

  /* lang chips dentro de ajustes */
  var langGroup = document.getElementById('chips-lang');
  if (langGroup) {
    langGroup.querySelectorAll('.chip').forEach(function(c){
      c.addEventListener('click', function(){
        langGroup.querySelectorAll('.chip').forEach(function(x){x.classList.remove('active');});
        c.classList.add('active');
      });
    });
  }

  var tt=document.getElementById('toggle-timer');
  if(tt)tt.addEventListener('change',function(){
    var gd=document.getElementById('group-timer-duration');
    if(gd)gd.style.display=this.checked?'flex':'none';
  });

  document.getElementById('btn-save-settings').addEventListener('click',function(){
    var s=readSettingsUI(); saveSettings(s); hideSettingsModal();
    /* aplicar idioma si cambió */
    var langChip = document.querySelector('#chips-lang .chip.active');
    if (langChip && typeof setLang === 'function') setLang(langChip.dataset.lang);
    if(typeof onSaved==='function')onSaved(s);
  });
  document.getElementById('btn-close-settings').addEventListener('click',hideSettingsModal);
  document.getElementById('modal-settings').addEventListener('click',function(e){ if(e.target===this)hideSettingsModal(); });
}
