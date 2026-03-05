/**
 * js/i18n.js — Sistema de internacionalización ligero y extensible.
 *
 * ¿Cómo añadir un idioma nuevo?
 *   1. Añade una clave al objeto I18N_STRINGS con todas las claves del idioma base.
 *   2. Añade <button class="lang-btn" data-lang="fr">FR</button> en index.html.
 *   3. El sistema lo detecta solo. Sin tocar más código.
 */

var I18N_STRINGS = {

  es: {
    app_subtitle:'Quiz de Banderas del Mundo',
    home_record:'Récord', home_play:'JUGAR', home_ranking:'Ranking',
    home_achievements:'Logros', home_settings:'Ajustes',
    home_coming_soon:'Próximamente', home_daily_play:'¡Jugar!', home_daily_done:'Completado',
    mode_guess_country:'País',             mode_guess_country_desc:'Bandera → País',
    mode_guess_flag:'Banderas',           mode_guess_flag_desc:'País → Bandera',
    mode_time_attack:'Contrarreloj',      mode_time_attack_desc:'Máx. en 60 segundos',
    mode_daily:'Reto del Día',            mode_daily_desc:'15 países • igual para todos',
    mode_multiplayer:'Multijugador',      mode_multiplayer_desc:'Compite con amigos',
    mode_continents:'Continentes',        mode_continents_desc:'Filtra por región',
    mode_hard:'Difícil',                  mode_hard_desc:'Sin nombres ni pistas',
    mode_tournament:'Torneo',             mode_tournament_desc:'Eliminatorias en vivo',
    group_classic:'Clásico',
    group_multiplayer:'Multijugador',
    mode_quick_match:'Partida Rápida',    mode_quick_match_desc:'Encuentra rival en segundos',
    mode_escalada:'Escalada',             mode_escalada_desc:'Sube de liga ganando',
    game_next:'Siguiente →', game_flag_prompt:'¿Cuál es la bandera de este país?',
    correct_1:'¡Correcto! 🎉', correct_2:'¡Exacto! 🌟', correct_3:'¡Brillante! ✨',
    correct_4:'¡Muy bien! 👏', correct_5:'¡Perfecto! 🏆', correct_6:'¡Lo sabías! 🎯', correct_7:'¡Excelente! 🚀',
    wrong_was:'Era: ',
    results_perfect_title:'¡Perfecto! Increíble', results_great_title:'¡Muy bien hecho!',
    results_good_title:'¡Buen trabajo!', results_ok_title:'Sigue practicando', results_bad_title:'Hay que estudiar más',
    results_ta_super:'¡Supersónico! 🚀', results_ta_great:'¡Gran marca! ⚡', results_ta_ok:'¡A seguir entrenando!',
    results_perfect_sub:'¡Todas correctas! 🎊', results_pct_sub:'Acertaste el {pct}%', results_ta_sub:'Aciertos en 60 segundos',
    results_correct:'Aciertos', results_wrong:'Errores', results_streak:'Racha',
    results_new_record:'🎉 ¡Nuevo récord!', results_daily_done:'📅 ¡Reto del día completado!',
    results_ach_title:'🏅 Logros desbloqueados',
    btn_retry:'🔄 Reintentar', btn_home:'🏠 Inicio',
    ranking_title:'🏆 Ranking Local', ranking_all:'Todos', ranking_ta:'Contrarreloj', ranking_empty:'Sin partidas aún.\n¡Juega la primera!',
    ranking_hits:' aciertos',
    ach_title:'🏅 Logros', ach_progress:'{n} / {total} desbloqueados',
    ach_1_name:'Primer Acierto',    ach_1_desc:'Responde correctamente por primera vez',
    ach_2_name:'En Racha',          ach_2_desc:'Racha de 3 aciertos',
    ach_3_name:'Imparable',         ach_3_desc:'Racha de 5 aciertos',
    ach_4_name:'Legendario',        ach_4_desc:'Racha de 10 aciertos',
    ach_5_name:'Partida Perfecta',  ach_5_desc:'100% en una partida',
    ach_6_name:'Sin Errores',       ach_6_desc:'20+ preguntas sin fallar',
    ach_7_name:'Retador Diario',    ach_7_desc:'Completa el Reto del Día',
    ach_8_name:'Constante',         ach_8_desc:'Reto del Día 3 veces',
    ach_9_name:'Velocista',         ach_9_desc:'10 aciertos en Contrarreloj',
    ach_10_name:'Supersónico',      ach_10_desc:'20 aciertos en Contrarreloj',
    ach_11_name:'Jugador',          ach_11_desc:'Juega 5 partidas',
    ach_12_name:'Explorador',       ach_12_desc:'Juega los 3 modos principales',
    ach_13_name:'Medio Centenar',   ach_13_desc:'50 puntos acumulados',
    ach_14_name:'Centurión',        ach_14_desc:'100 puntos acumulados',
    settings_title:'⚙️ Ajustes', settings_questions:'Número de preguntas',
    settings_timer_on:'Activar temporizador', settings_timer_dur:'Tiempo por pregunta',
    settings_sound_on:'Efectos de sonido', settings_vib_on:'Vibrar al responder',
    settings_dark:'Modo oscuro', settings_save:'Guardar ajustes',
    quit_title:'¿Abandonar partida?', quit_body:'Se perderá el progreso actual.',
    btn_cancel:'Cancelar', btn_quit:'Salir',
    toast_ach:'¡Logro desbloqueado!',
    date_today:'Hoy', date_yesterday:'Ayer',
    daily_already:'¡Ya completaste el reto de hoy!\nVuelve mañana 📅',
    /* v4 — ranking nombre */
    ranking_name_title:'🏆 ¡Top 5!', ranking_name_body:'Introduce tu nombre para el ranking:',
    ranking_name_placeholder:'Tu nombre...', ranking_name_save:'Guardar', ranking_name_skip:'Omitir',
    ranking_top5:'Top 5',
    /* v4 — ajustes idioma */
    settings_lang:'Idioma',
    /* v4 — estadísticas */
    stats_title:'📊 Tus estadísticas', stats_games:'Partidas jugadas', stats_correct:'Aciertos totales',
    stats_accuracy:'Precisión global', stats_best_streak:'Mejor racha', stats_fav_mode:'Modo favorito',
    stats_daily_streak:'Racha de días', stats_countries_wrong:'Países más fallados',
    stats_no_data:'Juega tu primera partida para ver estadísticas.',
    /* v4 — repaso errores */
    btn_review:'📖 Repasar errores', review_title:'Repaso de errores',
    review_empty:'¡Sin errores que repasar!',
    /* v4 — racha diaria */
    daily_streak_0:'Sin racha', daily_streak_1:'🔥 1 día seguido', daily_streak_n:'🔥 {n} días seguidos',
    /* v4 — continentes */
    settings_continent:'Continente', continent_all:'Todos',
    continent_eu:'Europa', continent_am:'América', continent_as:'Asia',
    continent_af:'África', continent_oc:'Oceanía',
    ob_title_1:'¡Bienvenido a FlagMaster!', ob_desc_1:'Pon a prueba tu conocimiento de banderas y países del mundo.',
    ob_title_2:'Reto del Día',              ob_desc_2:'Cada día, 15 países iguales para todos. ¡Solo una oportunidad!',
    ob_skip:'Omitir', ob_next:'Siguiente →', ob_start:'¡Empezar!',
    profile_guest:'Invitado',
    profile_connected_toast:'Conectado como {name}',
  },

  en: {
    app_subtitle:'World Flags Quiz',
    home_record:'Best', home_play:'PLAY', home_ranking:'Ranking',
    home_achievements:'Badges', home_settings:'Settings',
    home_coming_soon:'Coming Soon', home_daily_play:'Play!', home_daily_done:'Done',
    mode_guess_country:'Country',         mode_guess_country_desc:'Flag → Country',
    mode_guess_flag:'Flags',              mode_guess_flag_desc:'Country → Flag',
    mode_time_attack:'Time Attack',       mode_time_attack_desc:'Max in 60 seconds',
    mode_daily:'Daily Challenge',         mode_daily_desc:'15 countries • same for all',
    mode_multiplayer:'Multiplayer',       mode_multiplayer_desc:'Compete with friends',
    mode_continents:'Continents',         mode_continents_desc:'Filter by region',
    mode_hard:'Hard Mode',                mode_hard_desc:'No names, no hints',
    mode_tournament:'Tournament',         mode_tournament_desc:'Live elimination rounds',
    group_classic:'Classic',
    group_multiplayer:'Multiplayer',
    mode_quick_match:'Quick Match',       mode_quick_match_desc:'Find a rival in seconds',
    mode_escalada:'Ranked',               mode_escalada_desc:'Climb the league by winning',
    game_next:'Next →', game_flag_prompt:'What is the flag of this country?',
    correct_1:'Correct! 🎉', correct_2:'Exactly! 🌟', correct_3:'Brilliant! ✨',
    correct_4:'Well done! 👏', correct_5:'Perfect! 🏆', correct_6:'You knew it! 🎯', correct_7:'Excellent! 🚀',
    wrong_was:'It was: ',
    results_perfect_title:'Perfect! Incredible', results_great_title:'Well done!',
    results_good_title:'Good job!', results_ok_title:'Keep practicing', results_bad_title:'Need more study',
    results_ta_super:'Supersonic! 🚀', results_ta_great:'Great score! ⚡', results_ta_ok:'Keep training!',
    results_perfect_sub:'All correct! 🎊', results_pct_sub:'You got {pct}% right', results_ta_sub:'Correct answers in 60s',
    results_correct:'Correct', results_wrong:'Wrong', results_streak:'Streak',
    results_new_record:'🎉 New personal record!', results_daily_done:'📅 Daily Challenge complete!',
    results_ach_title:'🏅 Achievements unlocked',
    btn_retry:'🔄 Play Again', btn_home:'🏠 Home',
    ranking_title:'🏆 Local Ranking', ranking_all:'All', ranking_ta:'Time Attack', ranking_empty:'No games yet.\nPlay your first!',
    ranking_hits:' correct',
    ach_title:'🏅 Achievements', ach_progress:'{n} / {total} unlocked',
    ach_1_name:'First Correct',    ach_1_desc:'Answer correctly for the first time',
    ach_2_name:'On a Roll',        ach_2_desc:'3 correct in a row',
    ach_3_name:'Unstoppable',      ach_3_desc:'5 correct in a row',
    ach_4_name:'Legendary',        ach_4_desc:'10 correct in a row',
    ach_5_name:'Perfect Game',     ach_5_desc:'100% in one game',
    ach_6_name:'No Mistakes',      ach_6_desc:'20+ questions without errors',
    ach_7_name:'Daily Challenger', ach_7_desc:'Complete the Daily Challenge',
    ach_8_name:'Consistent',       ach_8_desc:'Daily Challenge 3 times',
    ach_9_name:'Speed Runner',     ach_9_desc:'10 correct in Time Attack',
    ach_10_name:'Supersonic',      ach_10_desc:'20 correct in Time Attack',
    ach_11_name:'Player',          ach_11_desc:'Play 5 games',
    ach_12_name:'Explorer',        ach_12_desc:'Play all 3 main modes',
    ach_13_name:'Half Century',    ach_13_desc:'50 total points',
    ach_14_name:'Centurion',       ach_14_desc:'100 total points',
    settings_title:'⚙️ Settings', settings_questions:'Number of questions',
    settings_timer_on:'Enable timer', settings_timer_dur:'Time per question',
    settings_sound_on:'Sound effects', settings_vib_on:'Vibrate on answer',
    settings_dark:'Dark mode', settings_save:'Save settings',
    quit_title:'Abandon game?', quit_body:'Your current progress will be lost.',
    btn_cancel:'Cancel', btn_quit:'Quit',
    toast_ach:'Achievement unlocked!',
    date_today:'Today', date_yesterday:'Yesterday',
    daily_already:'You already completed today\'s challenge!\nCome back tomorrow 📅',
    /* v4 — ranking name */
    ranking_name_title:'🏆 Top 5!', ranking_name_body:'Enter your name for the ranking:',
    ranking_name_placeholder:'Your name...', ranking_name_save:'Save', ranking_name_skip:'Skip',
    ranking_top5:'Top 5',
    /* v4 — settings language */
    settings_lang:'Language',
    /* v4 — stats */
    stats_title:'📊 Your stats', stats_games:'Games played', stats_correct:'Total correct',
    stats_accuracy:'Global accuracy', stats_best_streak:'Best streak', stats_fav_mode:'Favourite mode',
    stats_daily_streak:'Day streak', stats_countries_wrong:'Most missed countries',
    stats_no_data:'Play your first game to see stats.',
    /* v4 — review */
    btn_review:'📖 Review errors', review_title:'Error review',
    review_empty:'No errors to review!',
    /* v4 — daily streak */
    daily_streak_0:'No streak', daily_streak_1:'🔥 1 day in a row', daily_streak_n:'🔥 {n} days in a row',
    /* v4 — continents */
    settings_continent:'Continent', continent_all:'All',
    continent_eu:'Europe', continent_am:'Americas', continent_as:'Asia',
    continent_af:'Africa', continent_oc:'Oceania',
    ob_title_1:'Welcome to FlagMaster!',   ob_desc_1:'Test your knowledge of world flags and countries.',
    ob_title_2:'Daily Challenge',           ob_desc_2:'Every day, 15 countries — the same for everyone. One shot only!',
    ob_skip:'Skip', ob_next:'Next →', ob_start:'Let\'s go!',
    profile_guest:'Guest',
    profile_connected_toast:'Connected as {name}',
  }
};

var _currentLang = 'es';

/** Devuelve string traducido, con soporte de variables {key}. */
function t(key, vars) {
  var lang = I18N_STRINGS[_currentLang] || I18N_STRINGS.es;
  var str  = (lang[key] !== undefined) ? lang[key] : (I18N_STRINGS.es[key] || key);
  if (vars) {
    for (var k in vars) str = str.replace('{' + k + '}', vars[k]);
  }
  return str;
}

/** Cambia el idioma y re-renderiza los elementos data-i18n. */
function setLang(lang) {
  if (!I18N_STRINGS[lang]) return;
  _currentLang = lang;
  storeSaveLang(lang);
  _applyI18N();
}

function getLang()           { return _currentLang; }
function getAvailableLangs() { return Object.keys(I18N_STRINGS); }

function _applyI18N() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === _currentLang);
  });
}

function initI18N() {
  var saved = storageLoad('lang', null);
  var nav   = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
  _currentLang = saved || (I18N_STRINGS[nav] ? nav : 'es');
  _applyI18N();
}
