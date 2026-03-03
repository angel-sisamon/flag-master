/**
 * js/countries-data.js
 * 195 países con nombres bilingues (es/en) y emoji de bandera.
 *
 * DECISIÓN DE ARQUITECTURA — JSON vs inline JS:
 * ─────────────────────────────────────────────────────────────────
 * ¿Por qué inline JS y no un countries.json?
 *
 *   JSON pros:  Más fácil de editar manualmente, semánticamente "más limpio".
 *   JSON cons:  Requiere fetch() → código asíncrono, manejo de errores de red,
 *               NO funciona con file:// en escritorio, y para Capacitor añade
 *               complejidad de inicialización sin ningún beneficio de tamaño.
 *
 *   CONCLUSIÓN: Para una app mobile empaquetada (Capacitor/WebView) que debe
 *   ser 100% offline, el inline JS es la opción óptima. El dato es inmutable
 *   en runtime y se carga de forma síncrona sin overhead.
 *
 * Para añadir un idioma nuevo (ej. francés):
 *   Añadir la clave 'fr' al objeto 'names' de cada país:
 *   { code:'ES', flag:'🇪🇸', names:{ es:'España', en:'Spain', fr:'Espagne' } }
 * ─────────────────────────────────────────────────────────────────
 */

var COUNTRIES = [

  /* ── Europa ─────────────────────────────────────────── */
  {code:'AD',flag:'🇦🇩',names:{es:'Andorra',         en:'Andorra'}},
  {code:'AL',flag:'🇦🇱',names:{es:'Albania',          en:'Albania'}},
  {code:'AT',flag:'🇦🇹',names:{es:'Austria',          en:'Austria'}},
  {code:'BA',flag:'🇧🇦',names:{es:'Bosnia y Herzegovina', en:'Bosnia and Herzegovina'}},
  {code:'BE',flag:'🇧🇪',names:{es:'Bélgica',          en:'Belgium'}},
  {code:'BG',flag:'🇧🇬',names:{es:'Bulgaria',         en:'Bulgaria'}},
  {code:'BY',flag:'🇧🇾',names:{es:'Bielorrusia',      en:'Belarus'}},
  {code:'CH',flag:'🇨🇭',names:{es:'Suiza',            en:'Switzerland'}},
  {code:'CY',flag:'🇨🇾',names:{es:'Chipre',           en:'Cyprus'}},
  {code:'CZ',flag:'🇨🇿',names:{es:'República Checa',  en:'Czech Republic'}},
  {code:'DE',flag:'🇩🇪',names:{es:'Alemania',         en:'Germany'}},
  {code:'DK',flag:'🇩🇰',names:{es:'Dinamarca',        en:'Denmark'}},
  {code:'EE',flag:'🇪🇪',names:{es:'Estonia',          en:'Estonia'}},
  {code:'ES',flag:'🇪🇸',names:{es:'España',           en:'Spain'}},
  {code:'FI',flag:'🇫🇮',names:{es:'Finlandia',        en:'Finland'}},
  {code:'FR',flag:'🇫🇷',names:{es:'Francia',          en:'France'}},
  {code:'GB',flag:'🇬🇧',names:{es:'Reino Unido',      en:'United Kingdom'}},
  {code:'GR',flag:'🇬🇷',names:{es:'Grecia',           en:'Greece'}},
  {code:'HR',flag:'🇭🇷',names:{es:'Croacia',          en:'Croatia'}},
  {code:'HU',flag:'🇭🇺',names:{es:'Hungría',          en:'Hungary'}},
  {code:'IE',flag:'🇮🇪',names:{es:'Irlanda',          en:'Ireland'}},
  {code:'IS',flag:'🇮🇸',names:{es:'Islandia',         en:'Iceland'}},
  {code:'IT',flag:'🇮🇹',names:{es:'Italia',           en:'Italy'}},
  {code:'LI',flag:'🇱🇮',names:{es:'Liechtenstein',    en:'Liechtenstein'}},
  {code:'LT',flag:'🇱🇹',names:{es:'Lituania',         en:'Lithuania'}},
  {code:'LU',flag:'🇱🇺',names:{es:'Luxemburgo',       en:'Luxembourg'}},
  {code:'LV',flag:'🇱🇻',names:{es:'Letonia',          en:'Latvia'}},
  {code:'MC',flag:'🇲🇨',names:{es:'Mónaco',           en:'Monaco'}},
  {code:'MD',flag:'🇲🇩',names:{es:'Moldavia',         en:'Moldova'}},
  {code:'ME',flag:'🇲🇪',names:{es:'Montenegro',       en:'Montenegro'}},
  {code:'MK',flag:'🇲🇰',names:{es:'Macedonia del Norte', en:'North Macedonia'}},
  {code:'MT',flag:'🇲🇹',names:{es:'Malta',            en:'Malta'}},
  {code:'NL',flag:'🇳🇱',names:{es:'Países Bajos',     en:'Netherlands'}},
  {code:'NO',flag:'🇳🇴',names:{es:'Noruega',          en:'Norway'}},
  {code:'PL',flag:'🇵🇱',names:{es:'Polonia',          en:'Poland'}},
  {code:'PT',flag:'🇵🇹',names:{es:'Portugal',         en:'Portugal'}},
  {code:'RO',flag:'🇷🇴',names:{es:'Rumanía',          en:'Romania'}},
  {code:'RS',flag:'🇷🇸',names:{es:'Serbia',           en:'Serbia'}},
  {code:'RU',flag:'🇷🇺',names:{es:'Rusia',            en:'Russia'}},
  {code:'SE',flag:'🇸🇪',names:{es:'Suecia',           en:'Sweden'}},
  {code:'SI',flag:'🇸🇮',names:{es:'Eslovenia',        en:'Slovenia'}},
  {code:'SK',flag:'🇸🇰',names:{es:'Eslovaquia',       en:'Slovakia'}},
  {code:'SM',flag:'🇸🇲',names:{es:'San Marino',       en:'San Marino'}},
  {code:'TR',flag:'🇹🇷',names:{es:'Turquía',          en:'Turkey'}},
  {code:'UA',flag:'🇺🇦',names:{es:'Ucrania',          en:'Ukraine'}},
  {code:'VA',flag:'🇻🇦',names:{es:'Ciudad del Vaticano', en:'Vatican City'}},
  {code:'XK',flag:'🇽🇰',names:{es:'Kosovo',             en:'Kosovo'}},

  /* ── América del Norte y Central ─────────────────── */
  {code:'AG',flag:'🇦🇬',names:{es:'Antigua y Barbuda',  en:'Antigua and Barbuda'}},
  {code:'BB',flag:'🇧🇧',names:{es:'Barbados',         en:'Barbados'}},
  {code:'BZ',flag:'🇧🇿',names:{es:'Belice',           en:'Belize'}},
  {code:'CA',flag:'🇨🇦',names:{es:'Canadá',           en:'Canada'}},
  {code:'CR',flag:'🇨🇷',names:{es:'Costa Rica',       en:'Costa Rica'}},
  {code:'CU',flag:'🇨🇺',names:{es:'Cuba',             en:'Cuba'}},
  {code:'DM',flag:'🇩🇲',names:{es:'Dominica',          en:'Dominica'}},
  {code:'DO',flag:'🇩🇴',names:{es:'Rep. Dominicana',  en:'Dominican Republic'}},
  {code:'GD',flag:'🇬🇩',names:{es:'Granada',           en:'Grenada'}},
  {code:'GT',flag:'🇬🇹',names:{es:'Guatemala',        en:'Guatemala'}},
  {code:'HN',flag:'🇭🇳',names:{es:'Honduras',         en:'Honduras'}},
  {code:'HT',flag:'🇭🇹',names:{es:'Haití',            en:'Haiti'}},
  {code:'KN',flag:'🇰🇳',names:{es:'San Cristóbal y Nieves', en:'Saint Kitts and Nevis'}},
  {code:'LC',flag:'🇱🇨',names:{es:'Santa Lucía',       en:'Saint Lucia'}},
  {code:'JM',flag:'🇯🇲',names:{es:'Jamaica',          en:'Jamaica'}},
  {code:'MX',flag:'🇲🇽',names:{es:'México',           en:'Mexico'}},
  {code:'NI',flag:'🇳🇮',names:{es:'Nicaragua',        en:'Nicaragua'}},
  {code:'PA',flag:'🇵🇦',names:{es:'Panamá',           en:'Panama'}},
  {code:'SV',flag:'🇸🇻',names:{es:'El Salvador',      en:'El Salvador'}},
  {code:'TT',flag:'🇹🇹',names:{es:'Trinidad y Tobago',en:'Trinidad and Tobago'}},
  {code:'VC',flag:'🇻🇨',names:{es:'San Vicente y las Granadinas', en:'Saint Vincent and the Grenadines'}},
  {code:'US',flag:'🇺🇸',names:{es:'Estados Unidos',   en:'United States'}},

  /* ── América del Sur ──────────────────────────────── */
  {code:'AR',flag:'🇦🇷',names:{es:'Argentina',        en:'Argentina'}},
  {code:'BO',flag:'🇧🇴',names:{es:'Bolivia',          en:'Bolivia'}},
  {code:'BR',flag:'🇧🇷',names:{es:'Brasil',           en:'Brazil'}},
  {code:'CL',flag:'🇨🇱',names:{es:'Chile',            en:'Chile'}},
  {code:'CO',flag:'🇨🇴',names:{es:'Colombia',         en:'Colombia'}},
  {code:'EC',flag:'🇪🇨',names:{es:'Ecuador',          en:'Ecuador'}},
  {code:'GY',flag:'🇬🇾',names:{es:'Guyana',           en:'Guyana'}},
  {code:'PE',flag:'🇵🇪',names:{es:'Perú',             en:'Peru'}},
  {code:'PY',flag:'🇵🇾',names:{es:'Paraguay',         en:'Paraguay'}},
  {code:'SR',flag:'🇸🇷',names:{es:'Surinam',          en:'Suriname'}},
  {code:'UY',flag:'🇺🇾',names:{es:'Uruguay',          en:'Uruguay'}},
  {code:'VE',flag:'🇻🇪',names:{es:'Venezuela',        en:'Venezuela'}},

  /* ── Asia ─────────────────────────────────────────── */
  {code:'AE',flag:'🇦🇪',names:{es:'Emiratos Árabes',  en:'UAE'}},
  {code:'AF',flag:'🇦🇫',names:{es:'Afganistán',       en:'Afghanistan'}},
  {code:'AM',flag:'🇦🇲',names:{es:'Armenia',          en:'Armenia'}},
  {code:'AZ',flag:'🇦🇿',names:{es:'Azerbaiyán',       en:'Azerbaijan'}},
  {code:'BD',flag:'🇧🇩',names:{es:'Bangladés',        en:'Bangladesh'}},
  {code:'BH',flag:'🇧🇭',names:{es:'Baréin',           en:'Bahrain'}},
  {code:'BN',flag:'🇧🇳',names:{es:'Brunéi',           en:'Brunei'}},
  {code:'BT',flag:'🇧🇹',names:{es:'Bután',            en:'Bhutan'}},
  {code:'CN',flag:'🇨🇳',names:{es:'China',            en:'China'}},
  {code:'GE',flag:'🇬🇪',names:{es:'Georgia',          en:'Georgia'}},
  {code:'ID',flag:'🇮🇩',names:{es:'Indonesia',        en:'Indonesia'}},
  {code:'IL',flag:'🇮🇱',names:{es:'Israel',           en:'Israel'}},
  {code:'IN',flag:'🇮🇳',names:{es:'India',            en:'India'}},
  {code:'IQ',flag:'🇮🇶',names:{es:'Irak',             en:'Iraq'}},
  {code:'IR',flag:'🇮🇷',names:{es:'Irán',             en:'Iran'}},
  {code:'JP',flag:'🇯🇵',names:{es:'Japón',            en:'Japan'}},
  {code:'JO',flag:'🇯🇴',names:{es:'Jordania',         en:'Jordan'}},
  {code:'KG',flag:'🇰🇬',names:{es:'Kirguistán',       en:'Kyrgyzstan'}},
  {code:'KH',flag:'🇰🇭',names:{es:'Camboya',          en:'Cambodia'}},
  {code:'KP',flag:'🇰🇵',names:{es:'Corea del Norte',  en:'North Korea'}},
  {code:'KR',flag:'🇰🇷',names:{es:'Corea del Sur',    en:'South Korea'}},
  {code:'KW',flag:'🇰🇼',names:{es:'Kuwait',           en:'Kuwait'}},
  {code:'KZ',flag:'🇰🇿',names:{es:'Kazajistán',       en:'Kazakhstan'}},
  {code:'LA',flag:'🇱🇦',names:{es:'Laos',             en:'Laos'}},
  {code:'LB',flag:'🇱🇧',names:{es:'Líbano',           en:'Lebanon'}},
  {code:'LK',flag:'🇱🇰',names:{es:'Sri Lanka',        en:'Sri Lanka'}},
  {code:'MM',flag:'🇲🇲',names:{es:'Myanmar',          en:'Myanmar'}},
  {code:'MN',flag:'🇲🇳',names:{es:'Mongolia',         en:'Mongolia'}},
  {code:'MY',flag:'🇲🇾',names:{es:'Malasia',          en:'Malaysia'}},
  {code:'NP',flag:'🇳🇵',names:{es:'Nepal',            en:'Nepal'}},
  {code:'OM',flag:'🇴🇲',names:{es:'Omán',             en:'Oman'}},
  {code:'PH',flag:'🇵🇭',names:{es:'Filipinas',        en:'Philippines'}},
  {code:'PK',flag:'🇵🇰',names:{es:'Pakistán',         en:'Pakistan'}},
  {code:'PS',flag:'🇵🇸',names:{es:'Palestina',        en:'Palestine'}},
  {code:'QA',flag:'🇶🇦',names:{es:'Catar',            en:'Qatar'}},
  {code:'SA',flag:'🇸🇦',names:{es:'Arabia Saudita',   en:'Saudi Arabia'}},
  {code:'SG',flag:'🇸🇬',names:{es:'Singapur',         en:'Singapore'}},
  {code:'SY',flag:'🇸🇾',names:{es:'Siria',            en:'Syria'}},
  {code:'TH',flag:'🇹🇭',names:{es:'Tailandia',        en:'Thailand'}},
  {code:'TJ',flag:'🇹🇯',names:{es:'Tayikistán',       en:'Tajikistan'}},
  {code:'TL',flag:'🇹🇱',names:{es:'Timor Oriental',   en:'East Timor'}},
  {code:'TM',flag:'🇹🇲',names:{es:'Turkmenistán',     en:'Turkmenistan'}},
  {code:'TW',flag:'🇹🇼',names:{es:'Taiwán',           en:'Taiwan'}},
  {code:'UZ',flag:'🇺🇿',names:{es:'Uzbekistán',       en:'Uzbekistan'}},
  {code:'VN',flag:'🇻🇳',names:{es:'Vietnam',          en:'Vietnam'}},
  {code:'YE',flag:'🇾🇪',names:{es:'Yemen',            en:'Yemen'}},

  /* ── África ──────────────────────────────────────── */
  {code:'AO',flag:'🇦🇴',names:{es:'Angola',           en:'Angola'}},
  {code:'BF',flag:'🇧🇫',names:{es:'Burkina Faso',     en:'Burkina Faso'}},
  {code:'BI',flag:'🇧🇮',names:{es:'Burundi',          en:'Burundi'}},
  {code:'BJ',flag:'🇧🇯',names:{es:'Benín',            en:'Benin'}},
  {code:'BW',flag:'🇧🇼',names:{es:'Botsuana',         en:'Botswana'}},
  {code:'CD',flag:'🇨🇩',names:{es:'R. D. del Congo',  en:'DR Congo'}},
  {code:'CF',flag:'🇨🇫',names:{es:'Rep. Centroafricana',en:'Central African Republic'}},
  {code:'CG',flag:'🇨🇬',names:{es:'Rep. del Congo',   en:'Republic of the Congo'}},
  {code:'CI',flag:'🇨🇮',names:{es:'Costa de Marfil',  en:'Ivory Coast'}},
  {code:'CM',flag:'🇨🇲',names:{es:'Camerún',          en:'Cameroon'}},
  {code:'CV',flag:'🇨🇻',names:{es:'Cabo Verde',       en:'Cape Verde'}},
  {code:'DJ',flag:'🇩🇯',names:{es:'Yibuti',           en:'Djibouti'}},
  {code:'DZ',flag:'🇩🇿',names:{es:'Argelia',          en:'Algeria'}},
  {code:'EG',flag:'🇪🇬',names:{es:'Egipto',           en:'Egypt'}},
  {code:'ER',flag:'🇪🇷',names:{es:'Eritrea',          en:'Eritrea'}},
  {code:'ET',flag:'🇪🇹',names:{es:'Etiopía',          en:'Ethiopia'}},
  {code:'GA',flag:'🇬🇦',names:{es:'Gabón',            en:'Gabon'}},
  {code:'GH',flag:'🇬🇭',names:{es:'Ghana',            en:'Ghana'}},
  {code:'GM',flag:'🇬🇲',names:{es:'Gambia',           en:'Gambia'}},
  {code:'GN',flag:'🇬🇳',names:{es:'Guinea',           en:'Guinea'}},
  {code:'GQ',flag:'🇬🇶',names:{es:'Guinea Ecuatorial',en:'Equatorial Guinea'}},
  {code:'GW',flag:'🇬🇼',names:{es:'Guinea-Bisáu',     en:'Guinea-Bissau'}},
  {code:'KE',flag:'🇰🇪',names:{es:'Kenia',            en:'Kenya'}},
  {code:'KM',flag:'🇰🇲',names:{es:'Comoras',          en:'Comoros'}},
  {code:'LR',flag:'🇱🇷',names:{es:'Liberia',          en:'Liberia'}},
  {code:'LS',flag:'🇱🇸',names:{es:'Lesoto',           en:'Lesotho'}},
  {code:'LY',flag:'🇱🇾',names:{es:'Libia',            en:'Libya'}},
  {code:'MA',flag:'🇲🇦',names:{es:'Marruecos',        en:'Morocco'}},
  {code:'MG',flag:'🇲🇬',names:{es:'Madagascar',       en:'Madagascar'}},
  {code:'ML',flag:'🇲🇱',names:{es:'Mali',             en:'Mali'}},
  {code:'MR',flag:'🇲🇷',names:{es:'Mauritania',       en:'Mauritania'}},
  {code:'MU',flag:'🇲🇺',names:{es:'Mauricio',         en:'Mauritius'}},
  {code:'MW',flag:'🇲🇼',names:{es:'Malaui',           en:'Malawi'}},
  {code:'MZ',flag:'🇲🇿',names:{es:'Mozambique',       en:'Mozambique'}},
  {code:'NA',flag:'🇳🇦',names:{es:'Namibia',          en:'Namibia'}},
  {code:'NE',flag:'🇳🇪',names:{es:'Níger',            en:'Niger'}},
  {code:'NG',flag:'🇳🇬',names:{es:'Nigeria',          en:'Nigeria'}},
  {code:'RW',flag:'🇷🇼',names:{es:'Ruanda',           en:'Rwanda'}},
  {code:'SC',flag:'🇸🇨',names:{es:'Seychelles',       en:'Seychelles'}},
  {code:'SD',flag:'🇸🇩',names:{es:'Sudán',            en:'Sudan'}},
  {code:'SL',flag:'🇸🇱',names:{es:'Sierra Leona',     en:'Sierra Leone'}},
  {code:'SN',flag:'🇸🇳',names:{es:'Senegal',          en:'Senegal'}},
  {code:'SO',flag:'🇸🇴',names:{es:'Somalia',          en:'Somalia'}},
  {code:'SS',flag:'🇸🇸',names:{es:'Sudán del Sur',    en:'South Sudan'}},
  {code:'ST',flag:'🇸🇹',names:{es:'S. Tomé y Príncipe',en:'São Tomé and Príncipe'}},
  {code:'SZ',flag:'🇸🇿',names:{es:'Suazilandia',      en:'Eswatini'}},
  {code:'TD',flag:'🇹🇩',names:{es:'Chad',             en:'Chad'}},
  {code:'TG',flag:'🇹🇬',names:{es:'Togo',             en:'Togo'}},
  {code:'TN',flag:'🇹🇳',names:{es:'Túnez',            en:'Tunisia'}},
  {code:'TZ',flag:'🇹🇿',names:{es:'Tanzania',         en:'Tanzania'}},
  {code:'UG',flag:'🇺🇬',names:{es:'Uganda',           en:'Uganda'}},
  {code:'ZA',flag:'🇿🇦',names:{es:'Sudáfrica',        en:'South Africa'}},
  {code:'ZM',flag:'🇿🇲',names:{es:'Zambia',           en:'Zambia'}},
  {code:'ZW',flag:'🇿🇼',names:{es:'Zimbabue',         en:'Zimbabwe'}},

  /* ── Oceanía ─────────────────────────────────────── */
  {code:'AU',flag:'🇦🇺',names:{es:'Australia',        en:'Australia'}},
  {code:'FJ',flag:'🇫🇯',names:{es:'Fiyi',             en:'Fiji'}},
  {code:'FM',flag:'🇫🇲',names:{es:'Micronesia',       en:'Micronesia'}},
  {code:'KI',flag:'🇰🇮',names:{es:'Kiribati',         en:'Kiribati'}},
  {code:'MH',flag:'🇲🇭',names:{es:'Islas Marshall',   en:'Marshall Islands'}},
  {code:'NR',flag:'🇳🇷',names:{es:'Nauru',            en:'Nauru'}},
  {code:'NZ',flag:'🇳🇿',names:{es:'Nueva Zelanda',    en:'New Zealand'}},
  {code:'PG',flag:'🇵🇬',names:{es:'Papúa Nueva Guinea',en:'Papua New Guinea'}},
  {code:'PW',flag:'🇵🇼',names:{es:'Palaos',           en:'Palau'}},
  {code:'SB',flag:'🇸🇧',names:{es:'Islas Salomón',    en:'Solomon Islands'}},
  {code:'TO',flag:'🇹🇴',names:{es:'Tonga',            en:'Tonga'}},
  {code:'TV',flag:'🇹🇻',names:{es:'Tuvalu',           en:'Tuvalu'}},
  {code:'VU',flag:'🇻🇺',names:{es:'Vanuatu',          en:'Vanuatu'}},
  {code:'WS',flag:'🇼🇸',names:{es:'Samoa',            en:'Samoa'}},
];

function getDistractors(excludeCode, n) {
  var pool=COUNTRIES.filter(function(c){return c.code!==excludeCode;});
  var result=[];
  for (var i=0;i<Math.min(n,pool.length);i++) {
    var idx=Math.floor(Math.random()*pool.length);
    result.push(pool.splice(idx,1)[0]);
  }
  return result;
}

/* ── Mapa de continentes ─────────────────────────────────── */
var CONTINENT_MAP = {
  eu: ['AD','AL','AT','BA','BE','BG','BY','CH','CY','CZ','DE','DK','EE','ES','FI','FR','GB','GR',
       'HR','HU','IE','IS','IT','LI','LT','LU','LV','MC','MD','ME','MK','MT','NL','NO','PL','PT',
       'RO','RS','RU','SE','SI','SK','SM','TR','UA','VA','XK'],
  am: ['AG','BB','BZ','CA','CR','CU','DM','DO','GD','GT','HN','HT','KN','LC','JM','MX','NI','PA',
       'SV','TT','VC','US','AR','BO','BR','CL','CO','EC','GY','PE','PY','SR','UY','VE'],
  as: ['AE','AF','AM','AZ','BD','BH','BN','BT','CN','GE','ID','IL','IN','IQ','IR','JP','JO','KG',
       'KH','KP','KR','KW','KZ','LA','LB','LK','MM','MN','MY','NP','OM','PH','PK','PS','QA','SA',
       'SG','SY','TH','TJ','TL','TM','TW','UZ','VN','YE'],
  af: ['AO','BF','BI','BJ','BW','CD','CF','CG','CI','CM','CV','DJ','DZ','EG','ER','ET','GA','GH',
       'GM','GN','GQ','GW','KE','KM','LR','LS','LY','MA','MG','ML','MR','MU','MW','MZ','NA','NE',
       'NG','RW','SC','SD','SL','SN','SO','SS','ST','SZ','TD','TG','TN','TZ','UG','ZA','ZM','ZW'],
  oc: ['AU','FJ','FM','KI','MH','NR','NZ','PG','PW','SB','TO','TV','VU','WS']
};

function getCountriesByContinent(continent) {
  if (!continent || continent === 'all') return COUNTRIES.slice();
  var codes = CONTINENT_MAP[continent] || [];
  return COUNTRIES.filter(function(c){ return codes.indexOf(c.code) !== -1; });
}
