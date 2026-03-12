# 🌍 FlagMaster

Quiz de banderas del mundo para dispositivos móviles. Desarrollado como webapp mobile-first, empaquetable como app nativa con **Capacitor** (Android / iOS).

---

## ✨ Características

- **195 países** con banderas emoji (100% offline, sin imágenes externas)
- **4 modos de juego** activos + 3 en desarrollo
- **Sistema de logros** con 14 hitos
- **Reto diario** con seed determinista (mismo reto para todos los usuarios cada día)
- **Ranking local** top 10 por modo
- **Internacionalización** ES / EN (extensible a más idiomas)
- **Web Audio API** — efectos de sonido generados por código, sin archivos
- **Animaciones** — flip card 3D al revelar respuesta, confetti, toasts
- **Modo oscuro / claro**
- **Vibración** en respuestas
- Sin dependencias externas. Sin npm. Sin bundler. Vanilla JS.

---

## 📱 Modos de juego

### 🎮 Clásico
| Modo | ID interno | Estado |
|---|---|---|
| Bandera → País | `guess-country` | ✅ Activo |
| País → Bandera | `guess-flag` | ✅ Activo |
| Contrarreloj (60s) | `timetrial` | ✅ Activo |

### 📅 Reto del Día
| Modo | ID interno | Estado |
|---|---|---|
| 15 países, igual para todos | `daily` | ✅ Activo |

### 👥 Multijugador
| Modo | ID interno | Estado |
|---|---|---|
| Partida Rápida | `quick-match` | 🔒 Próximamente |
| Escalada | `escalada` | 🔒 Próximamente |
| Torneo | `tournament` | 🔒 Próximamente |

---

## 🗂️ Estructura del proyecto

```
flagmaster/
├── index.html              — HTML principal. Todas las pantallas (screens)
├── css/
│   ├── styles.css          — Estilos principales, tokens CSS, home, juego, resultados
│   └── animations.css      — Keyframes y clases de animación
├── js/
│   ├── i18n.js             — Sistema de internacionalización (t(), setLang(), initI18N())
│   ├── storage.js          — Abstracción localStorage (scores, ranking, logros, daily, settings)
│   ├── utils.js            — Helpers: shuffle, seededRng, delay, vibrate, confetti, cn()
│   ├── audio.js            — Motor de sonido Web Audio API (AudioFX)
│   ├── countries-data.js   — 195 países: { code, flag emoji, names: {es, en} }
│   ├── daily.js            — Seed diaria Park-Miller LCG, getDailyCountries()
│   ├── achievements.js     — 14 logros, checkAchievements(), toast notifications
│   ├── ranking.js          — Ranking local top 10, renderRankingScreen()
│   ├── game.js             — Lógica de partida: estado, preguntas, scoring, racha
│   ├── ui.js               — Renderizado DOM: preguntas, flip card, resultados, HUD
│   ├── settings.js         — Modal de ajustes, toggles, chip groups
│   └── main.js             — Orquestador: menú acordeón, eventos, timers, flujo completo
└── assets/
    └── README.md
```

> **Orden de carga de scripts** (importante — sin ES Modules):
> `config → i18n → storage → utils → audio → countries-data → daily → achievements → ranking → game → ui → settings → main`

---

## 🧩 Arquitectura

### Pantallas (screens)
Cada pantalla es un `<div class="screen" id="screen-NAME">`. Solo una tiene `class="active"` a la vez. La función `showScreen(name)` gestiona el cambio.

```
screen-home       — Menú principal con acordeón de modos
screen-game       — Partida en curso (HUD + flip card + opciones)
screen-results    — Resultados con stats, logros y acciones
screen-ranking    — Ranking local con filtros por modo
screen-achievements — Cuadrícula de 14 logros
```

### Estado del juego (`game.js`)
`_gameState` es el único objeto mutable de la partida. `getGameState()` devuelve una copia superficial. Campos clave:

```js
{
  mode,           // 'guess-country' | 'guess-flag' | 'timetrial' | 'daily'
  score,          // aciertos
  streak,         // racha actual
  maxStreak,      // racha máxima de la partida
  correct,        // total aciertos
  wrong,          // total errores
  attempted,      // total respondidas (usado en timetrial)
  currentIndex,   // índice pregunta actual
  answered,       // bool — ya respondió esta pregunta
  finished,       // bool — partida terminada
  isTimeTrial,    // bool — modo contrarreloj
  isDailyChallenge // bool — modo reto del día
}
```

### AudioFX (`audio.js`)
IIFE que expone métodos sin estado externo. El contexto de audio se crea en el primer gesto del usuario.

```js
AudioFX.correct()      // arpeggio ascendente
AudioFX.wrong()        // descenso sawtooth
AudioFX.streak()       // escala de 5 notas
AudioFX.complete()     // fanfare de fin de partida
AudioFX.achievement()  // 4 notas ascendentes
AudioFX.tick()         // tick del timer crítico
AudioFX.timeUp()       // descenso de 3 notas (fin contrarreloj)
AudioFX.setEnabled(v)  // activa/desactiva sonido
AudioFX.resume()       // inicializa el AudioContext (llamar en primer gesto)
```

### i18n (`i18n.js`)
```js
t('key')                    // devuelve string traducido
t('key', {pct: 80})        // con variables: 'Acertaste el {pct}%'
setLang('en')              // cambia idioma, re-renderiza data-i18n
getLang()                  // idioma activo
initI18N()                 // detecta idioma guardado o del navegador
```
Para añadir un idioma nuevo: añadir bloque `fr: { ...keys }` en `I18N_STRINGS` y un botón `<button class="lang-btn" data-lang="fr">FR</button>` en el HTML.

### Países (`countries-data.js`)
```js
// Estructura de cada país:
{ code: 'ES', flag: '🇪🇸', names: { es: 'España', en: 'Spain' } }

// Para añadir idioma nuevo:
{ code: 'ES', flag: '🇪🇸', names: { es: 'España', en: 'Spain', fr: 'Espagne' } }
```
Regiones cubiertas: Europa · América del Norte y Central · América del Sur · Asia · África · Oceanía

### Reto diario (`daily.js`)
Usa un generador Park-Miller LCG con semilla `YYYYMMDD` como entero. Garantiza que todos los usuarios reciben los mismos 15 países el mismo día, sin servidor.

```js
getDailyCountries()     // → array de 15 países del día
isDailyCompleted()      // → bool
markDailyCompleted(score)
```

### Menú acordeón (`main.js`)
```js
MODE_GROUPS   // array de grupos (Clásico, Multijugador) con sus modos hijos
MODE_SOLO     // modo standalone (Reto del Día)
_groupExpanded // { classic: true, multiplayer: false } — estado de colapso
```

---

## 🏅 Logros (14)

| ID | Nombre | Condición |
|---|---|---|
| `first_correct` | Primer Acierto | 1 respuesta correcta |
| `streak_3` | En Racha | Racha de 3 |
| `streak_5` | Imparable | Racha de 5 |
| `streak_10` | Legendario | Racha de 10 |
| `perfect_game` | Partida Perfecta | 100% en una partida |
| `no_mistakes` | Sin Errores | 20+ preguntas sin fallar |
| `daily_first` | Retador Diario | Completar el reto del día |
| `daily_3` | Constante | Reto del día 3 veces |
| `time_attack_10` | Velocista | 10 aciertos en contrarreloj |
| `time_attack_20` | Supersónico | 20 aciertos en contrarreloj |
| `play_5_games` | Jugador | 5 partidas jugadas |
| `play_all_modes` | Explorador | Jugar los 3 modos principales |
| `score_50` | Medio Centenar | 50 puntos acumulados |
| `score_100` | Centurión | 100 puntos acumulados |

---

## 💾 localStorage

Todas las claves tienen prefijo `flagmaster_`.

| Clave | Contenido |
|---|---|
| `flagmaster_settings` | `{ numQuestions, timerEnabled, timerDuration, soundEnabled, vibration, darkMode }` |
| `flagmaster_best_scores` | `{ 'guess-country': N, 'guess-flag': N, 'timetrial': N, 'daily': N }` |
| `flagmaster_last_mode` | ID del último modo seleccionado |
| `flagmaster_ranking` | Array de hasta 30 entradas `{ mode, score, total, maxStreak, ts }` |
| `flagmaster_achievements` | `{ unlocked: [...ids], stats: { total_correct, total_games, ... } }` |
| `flagmaster_daily` | `{ 'YYYY-MM-DD': { score, ts } }` |
| `flagmaster_lang` | `'es'` \| `'en'` |

---

## 🚀 Desarrollo local

### Opción A — Servidor local (recomendado para Chrome)
```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```
Abrir `http://localhost:8080`

### Opción B — Firefox
Firefox permite abrir `index.html` directamente desde `file://` sin restricciones CORS.

### Opción C — Capacitor (app nativa)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init FlagMaster com.tudominio.flagmaster
npx cap add android
npx cap sync
npx cap open android   # abre Android Studio
```

---

## 🗺️ Roadmap

- [ ] Multijugador — Partida Rápida (matchmaking P2P o WebSocket)
- [ ] Multijugador — Escalada (sistema de ligas)
- [ ] Multijugador — Torneo (eliminatorias)
- [ ] Modo Continentes (filtrar países por región)
- [ ] Modo Difícil (sin nombres, sin pistas)
- [ ] PWA (manifest + service worker para instalar desde navegador)
- [ ] Más idiomas (FR, DE, PT...)
- [ ] Sonidos adicionales por racha máxima histórica
- [ ] Compartir resultado como imagen

---

## 🛠️ Convenciones de código

- **Sin ES Modules** (`import`/`export`) — compatibilidad con `file://` y Capacitor WebView
- **Orden de carga** estricto en `index.html` — cada archivo puede usar los globales de los anteriores
- **Funciones privadas de `main.js`** — prefijo `_` (ej. `_handleAnswer`, `_startGlobalTimer`)
- **Nombres de modo internos** — siempre usar los IDs de `game.js`: `'guess-country'`, `'guess-flag'`, `'timetrial'`, `'daily'`
- **i18n** — nunca strings hardcodeados en JS/HTML; siempre `t('clave')`  o `data-i18n="clave"`
- **Países** — nombres siempre a través de `cn(country)` (resuelve el idioma activo automáticamente)

---

## 🧱 Propuestas de robustez y escalabilidad (sin alterar funcionamiento)

Estas mejoras están planteadas para fortalecer mantenibilidad y escalado sin cambiar reglas de juego, UX ni contratos actuales:

### Prioridad alta (impacto alto / riesgo bajo)

1. **Centralizar configuración externa en `js/config.js`**
   - Mover IDs y constantes de integración (Firebase, Play Games, notificaciones) a un único punto.
   - Reduce errores de despliegue y facilita configuración por entorno.

2. **Agregar validaciones defensivas de estado y storage**
   - Validar forma mínima de `_gameState` y objetos cargados desde `localStorage`.
   - Si hay datos corruptos, aplicar fallback seguro sin romper flujo de partida.

3. **Validar secuencia de carga de scripts en arranque**
   - Añadir chequeo liviano para detectar dependencias globales faltantes.
   - Mantiene el modelo actual sin módulos, pero con detección temprana de fallos.

### Prioridad media (impacto alto / esfuerzo moderado)

4. **Desacoplar `main.js` por responsabilidad**
   - Separar inicialización, eventos de juego y navegación de pantallas en archivos dedicados.
   - Mantener APIs públicas actuales para no romper integración existente.

5. **Centralizar gestión de timers**
   - Unificar inicio/parada/limpieza de timers en un manager único.
   - Evita condiciones de carrera entre modos y simplifica depuración.

6. **Crear capa mínima de acceso al DOM**
   - Envolver selectores y actualizaciones frecuentes en utilidades comunes.
   - Reduce acoplamiento entre HTML y lógica de aplicación.

### Prioridad baja (alto retorno operativo)

7. **Checklist de release**
   - Lista de verificación antes de publicar (IDs reales, orden de scripts, traducciones, fallbacks).
