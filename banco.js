/* =========================================================================
   BANCO.JS — Datos del sitio (mapa, cronología, juegos, gráficos, audio)
   Todos los datos salen del informe «Ecuador» (ver Fuentes en la web).
   ========================================================================= */

/* ---------- 1. GEOGRAFÍA: coordenadas [longitud, latitud] ---------------- */
const GEO = {
  // Perfil de la costa (de norte a sur): Mataje → Esmeraldas → Manta → Salinas → golfo de Guayaquil
  costa: [[-78.87,1.43],[-78.95,1.30],[-79.20,1.12],[-79.42,1.05],[-79.65,0.96],[-79.85,0.87],[-80.03,0.62],[-80.06,0.45],[-80.03,0.30],[-80.06,0.07],[-80.25,-0.15],[-80.50,-0.37],[-80.43,-0.60],[-80.55,-0.80],[-80.73,-0.95],[-80.75,-1.15],[-80.82,-1.56],[-80.78,-1.85],[-80.98,-2.20],[-80.75,-2.28],[-80.45,-2.45],[-80.38,-2.63],[-80.25,-2.70],[-80.02,-2.72],[-79.90,-2.55],[-79.68,-2.70],[-79.72,-2.95],[-79.88,-3.18],[-79.99,-3.27],[-80.15,-3.38],[-80.33,-3.40]],
  // Frontera con el Perú, tramo occidental (Zarumilla → Macará)
  perúO: [[-80.33,-3.40],[-80.22,-3.55],[-80.45,-3.90],[-80.52,-4.20],[-80.40,-4.40],[-80.10,-4.45],[-79.80,-4.42],[-79.50,-4.40]],
  // Frontera con el Perú, tramo oriental (Macará → río Putumayo)
  perúE: [[-79.50,-4.40],[-79.30,-4.70],[-79.10,-4.98],[-78.70,-4.65],[-78.45,-4.15],[-78.30,-3.50],[-78.10,-3.05],[-77.80,-2.95],[-77.20,-2.90],[-76.70,-2.55],[-76.25,-2.15],[-75.55,-1.55],[-75.35,-1.05],[-75.25,-0.12]],
  // Frontera con Colombia
  colombia: [[-75.25,-0.12],[-75.90,0.05],[-76.40,0.25],[-77.00,0.35],[-77.40,0.45],[-77.65,0.82],[-78.00,0.95],[-78.40,1.10],[-78.62,1.20],[-78.87,1.43]],
  // Límite Costa–Sierra (flanco occidental de los Andes), de norte a sur
  L1: [[-78.62,1.20],[-78.55,0.90],[-78.65,0.55],[-78.78,0.30],[-79.02,0.00],[-79.20,-0.60],[-79.40,-1.20],[-79.45,-1.80],[-79.45,-2.30],[-79.60,-2.60],[-79.70,-3.00],[-79.85,-3.55],[-80.12,-3.78],[-80.45,-3.90]],
  // Límite Sierra–Amazonía (flanco oriental), de norte a sur
  L2: [[-77.65,0.82],[-77.72,0.55],[-77.82,0.20],[-78.00,-0.20],[-78.15,-0.70],[-78.25,-1.20],[-78.35,-1.80],[-78.50,-2.30],[-78.60,-2.80],[-78.80,-3.40],[-78.95,-3.90],[-79.20,-4.15],[-79.40,-4.30],[-79.50,-4.40]]
};
// Galápagos: [clave, lon, lat, rx, ry, rotación°] (aprox. a escala real, 1° = 111 km)
const ISLAS = [
  ['Fernandina',-91.55,-0.37,.17,.22,0],['Isabela N',-91.10,-0.05,.20,.30,-10],['Isabela C',-91.10,-0.55,.20,.28,-15],['Isabela S',-91.05,-0.95,.22,.20,25],
  ['Santiago',-90.75,-0.25,.26,.20,-20],['Santa Cruz',-90.35,-0.63,.26,.19,0],['San Cristóbal',-89.50,-0.85,.30,.17,-25],['Floreana',-90.45,-1.30,.14,.12,0],
  ['Española',-89.65,-1.38,.12,.08,0],['Genovesa',-89.95,0.32,.10,.09,0],['Marchena',-90.47,0.33,.10,.10,0],['Pinta',-90.75,0.58,.11,.13,0],['Santa Fe',-90.43,-0.82,.07,.06,0],['Baltra',-90.28,-0.45,.07,.05,0]
];

/* Lugares del mapa. tipo: ciudad | volcan | sitio */
const LUGARES = {
  quito:      {n:'Quito',            lon:-78.47, lat:-0.18, tipo:'ciudad', region:'sierra', foto:'🏛️',
               t:'Capital constitucional y sede de las cinco Funciones del Estado. Su Centro Histórico fue de los primeros declarados Patrimonio de la Humanidad (1978).'},
  guayaquil:  {n:'Guayaquil',        lon:-79.89, lat:-2.19, tipo:'ciudad', region:'costa',  foto:'⚓',
               t:'Principal puerto y motor comercial del país. Su proclamación de independencia del 9 de octubre de 1820 abrió el frente militar hacia los Andes.'},
  cuenca:     {n:'Cuenca',           lon:-79.00, lat:-2.90, tipo:'ciudad', region:'sierra', foto:'⛪',
               t:'Patrimonio Cultural de la Humanidad (1999). Cuna del campeón olímpico Jefferson Pérez y sede del Pase del Niño Viajero, el 24 de diciembre.'},
  loja:       {n:'Loja',             lon:-79.20, lat:-3.99, tipo:'ciudad', region:'sierra', foto:'🌿',
               t:'De sus bosques viene la corteza de la quina, con la que se trató la malaria desde el siglo XVII. En 1936 la «cascarilla» fue declarada Planta Nacional.'},
  esmeraldas: {n:'Esmeraldas',       lon:-79.65, lat:0.96,  tipo:'ciudad', region:'costa',  foto:'🥁',
               t:'Núcleo histórico afroecuatoriano y tierra de la marimba esmeraldeña, música reconocida por la UNESCO.'},
  manta:      {n:'Manta',            lon:-80.73, lat:-0.95, tipo:'ciudad', region:'costa',  foto:'🐟',
               t:'Puerto atunero del Pacífico. Cerca está Montecristi, donde se teje el sombrero de paja toquilla y donde se redactó la Constitución de 2008.'},
  tena:       {n:'Tena',             lon:-77.81, lat:-0.99, tipo:'ciudad', region:'amazonia', foto:'🛶',
               t:'Puerta de entrada a la Amazonía kichwa, a los pies de la cordillera de Napo-Galeras.'},
  chimborazo: {n:'Chimborazo',       lon:-78.82, lat:-1.47, tipo:'volcan', region:'sierra', foto:'🏔️', alt:'6.263,47 m s. n. m.',
               t:'Su cumbre es el punto de la superficie terrestre más alejado del centro de la Tierra: 6.384,416 km. Supera al Everest por 2.168 m (IGM/IRD, 2016).'},
  cotopaxi:   {n:'Cotopaxi',         lon:-78.44, lat:-0.68, tipo:'volcan', region:'sierra', foto:'🌋', alt:'5.897 m s. n. m.',
               t:'Volcán activo de cono casi perfecto, en el corazón de la «Avenida de los Volcanes».'},
  cayambe:    {n:'Cayambe',          lon:-77.99, lat:0.03,  tipo:'volcan', region:'sierra', foto:'🌋', alt:'Sobre la línea ecuatorial',
               t:'La línea equinoccial cruza sus laderas. Allí se celebra el Inti Raymi, la fiesta del Sol y la cosecha.'},
  tungurahua: {n:'Tungurahua',       lon:-78.44, lat:-1.47, tipo:'volcan', region:'sierra', foto:'🌋', alt:'Activo',
               t:'Domina Baños de Agua Santa, puerta de entrada a la Amazonía y centro de turismo de aventura.'},
  sumaco:     {n:'Sumaco',           lon:-77.63, lat:-0.54, tipo:'volcan', region:'amazonia', foto:'🌋', alt:'3.732 m s. n. m.',
               t:'Volcán aislado de la Alta Amazonía, en la cordillera de Napo-Galeras.'},
  yasuni:     {n:'Parque Nacional Yasuní', lon:-76.20, lat:-0.95, tipo:'sitio', region:'amazonia', foto:'🐆',
               t:'Epicentro de megabiodiversidad y territorio de pueblos originarios. En 2023, el 59 % votó por detener la explotación petrolera del Bloque 43 (ITT).'},
  palanda:    {n:'Palanda (Santa Ana-La Florida)', lon:-79.10, lat:-4.60, tipo:'sitio', region:'amazonia', foto:'🍫',
               t:'Aquí la cultura Mayo-Chinchipe domesticó el cacao hace 5.500 años (ca. 3500 a. C.): el uso más antiguo conocido en el mundo.'},
  mitad:      {n:'Mitad del Mundo',  lon:-78.455,lat:0.0,   tipo:'sitio', region:'sierra', foto:'🌐',
               t:'Monumento a la Misión Geodésica de 1736, que midió el arco del meridiano y popularizó el nombre «Ecuador».'}
};
const GALAPAGOS_LUGAR = {n:'Galápagos', region:'galapagos', foto:'🐢',
  t:'Archipiélago a 972 km del continente. Primer Patrimonio Natural de la Humanidad (UNESCO, 1978) y laboratorio natural que inspiró a Darwin (1835).'};
const RIOS = {
  Napo:[[-77.85,-1.05],[-77.2,-0.95],[-76.6,-0.62],[-76.0,-0.70],[-75.40,-0.95]],
  Aguarico:[[-77.30,0.05],[-76.7,-0.25],[-76.2,-0.45],[-75.5,-0.35]],
  Pastaza:[[-78.3,-1.45],[-77.6,-1.85],[-77.0,-2.30],[-76.6,-2.65]],
  Guayas:[[-79.80,-1.40],[-79.88,-1.85],[-79.90,-2.30],[-79.93,-2.58]],
  Esmeraldas:[[-78.75,0.20],[-79.10,0.55],[-79.50,0.80],[-79.65,0.96]]
};

/* ---------- 2. REGIONES: color y orden ---------------------------------- */
const REG = {
  costa:    {fill:'#e9a23b', dark:'#9a6212', nombre:'Costa',    emoji:'🌊'},
  sierra:   {fill:'#8a5ca8', dark:'#53306d', nombre:'Sierra',   emoji:'🏔️'},
  amazonia: {fill:'#2f9d73', dark:'#145a41', nombre:'Amazonía', emoji:'🌿'},
  galapagos:{fill:'#2ba3c9', dark:'#0f5d78', nombre:'Galápagos',emoji:'🐢'}
};

/* ---------- 3. CRONOLOGÍA (hechos del informe, capítulo de Historia) ---- */
const CRONOLOGIA = [
  {a:'3500 a. C.', y:-3500, t:'Cacao en Palanda', d:'La cultura Mayo-Chinchipe domestica el cacao en Santa Ana-La Florida: el uso más antiguo conocido del mundo.', ic:'🍫', reg:'amazonia'},
  {a:'1534', y:1534, t:'Fundación de Quito', d:'El 6 de diciembre se funda San Francisco de Quito. Guayaquil y Portoviejo (1535) y Cuenca (1557) siguen después.', ic:'🏛️', reg:'sierra'},
  {a:'1563', y:1563, t:'Real Audiencia de Quito', d:'Felipe II crea la Audiencia por Cédula Real del 29 de agosto. Más tarde destaca en el arte la Escuela Quiteña.', ic:'📜', reg:'sierra'},
  {a:'1736', y:1736, t:'Misión Geodésica', d:'La Condamine, Bouguer, Godin y Pedro Vicente Maldonado miden el meridiano. De ahí se difunde el nombre «Ecuador».', ic:'📐', reg:'sierra'},
  {a:'1809', y:1809, t:'Primera Junta de Quito', d:'El 10 de agosto, los criollos quiteños deponen al presidente de la Audiencia y abren el camino a la independencia.', ic:'🔔', reg:'sierra'},
  {a:'1820', y:1820, t:'Guayaquil y Cuenca', d:'Guayaquil proclama su independencia el 9 de octubre; Cuenca lo hace el 3 de noviembre.', ic:'⚓', reg:'costa'},
  {a:'1822', y:1822, t:'Batalla de Pichincha', d:'El 24 de mayo, Sucre derrota a los realistas y sella la libertad del territorio quiteño.', ic:'⚔️', reg:'sierra'},
  {a:'1830', y:1830, t:'Nace la República', d:'Tras separarse de la Gran Colombia (13 de mayo), el Congreso de Riobamba dicta la primera Constitución el 23 de septiembre.', ic:'🇪🇨', reg:'sierra'},
  {a:'1895', y:1895, t:'Revolución Liberal', d:'Eloy Alfaro llega al poder el 5 de junio. Las constituciones de 1897 y 1906 separan Iglesia y Estado.', ic:'🔥', reg:'costa'},
  {a:'1929', y:1929, t:'Voto femenino', d:'Ecuador es pionero latinoamericano en reconocer el voto de las mujeres.', ic:'🗳️', reg:'sierra'},
  {a:'1942', y:1942, t:'Protocolo de Río', d:'Tras la invasión peruana de 1941, se firma el Protocolo del 29 de enero. La paz definitiva llega con Brasilia en 1998.', ic:'🕊️', reg:'amazonia'},
  {a:'1972', y:1972, t:'Era petrolera', d:'Empieza la exportación de crudo amazónico por el oleoducto SOTE y cambian las finanzas del Estado.', ic:'🛢️', reg:'amazonia'},
  {a:'1979', y:1979, t:'Vuelve la democracia', d:'Jaime Roldós Aguilera asume en agosto y se inicia el período democrático actual.', ic:'🗽', reg:'sierra'},
  {a:'2000', y:2000, t:'Dolarización', d:'El 9 de enero se decreta la dolarización a 25.000 sucres por dólar, tras la crisis bancaria de 1999.', ic:'💵', reg:'costa'},
  {a:'2008', y:2008, t:'Constitución de Montecristi', d:'La vigésima Constitución crea el Estado de derechos y reconoce por primera vez en el mundo los Derechos de la Naturaleza (Arts. 71–74).', ic:'🌱', reg:'costa'},
  {a:'2023', y:2023, t:'Bono Azul y consulta del Yasuní', d:'Galápagos protagoniza el mayor canje de deuda por conservación marina, y el 20 de agosto el 59 % vota por frenar el petróleo del Bloque 43.', ic:'🌊', reg:'galapagos'},
  {a:'2024', y:2024, t:'Oro en París', d:'Brian Pintado gana el oro en 20 km marcha. Ecuador suma 10 medallas olímpicas en su historia (4 de oro).', ic:'🥇', reg:'sierra'}
];

/* ---------- 4. GRÁFICOS (cifras del informe) ---------------------------- */
const GRAFICOS = {
  etnias: {titulo:'¿Cómo se identifican los ecuatorianos?', nota:'Autoidentificación étnica, Censo 2022 (INEC).',
    datos:[['Mestizo',77.5,'#e9a23b'],['Montubio',7.7,'#2f9d73'],['Indígena',7.7,'#8a5ca8'],['Afroecuatoriano',4.8,'#2ba3c9'],['Blanco y otros',2.3,'#d6402b']]},
  territorio: {titulo:'Cuánto ocupa cada región', nota:'Porcentaje del territorio nacional.',
    datos:[['Amazonía',45.7,'#2f9d73'],['Costa',26.4,'#e9a23b'],['Sierra',24.8,'#8a5ca8'],['Galápagos',3.1,'#2ba3c9']]},
  pib: {titulo:'De qué vive la economía', nota:'Valor agregado por sector, % del PIB (punto medio de cada rango del BCE).',
    datos:[['Servicios',57,'#1f4fa0','56–58 %'],['Industria',23.5,'#e9a23b','23–24 %'],['Primario',19,'#2f9d73','18–20 %']]},
  medallas: {titulo:'Medallero olímpico histórico', nota:'COI, 1996–2024: 10 medallas.',
    datos:[['Oro',4,'#f2b705','Pérez 1996 · Carapaz 2021 · Dajomes 2021 · Pintado 2024'],['Plata',4,'#aeb7c2','Pérez 2008 · Salazar 2021 · Yépez 2024 · Pintado/Morejón 2024'],['Bronce',2,'#b8733a','Dajomes 2024 · Palacios 2024']]},
  exportaciones: {titulo:'Exportaciones principales', nota:'USD miles de millones por año (rango BCE).',
    datos:[['Petróleo',7.8,9.0,'#4a2c1a'],['Camarón',6.3,7.2,'#d6402b'],['Oro y cobre',3.1,3.3,'#f2b705']]},
  poblacion: {titulo:'La población crece cada vez más despacio', nota:'Tasa de crecimiento anual (%).',
    datos:[['2001–2010',1.95],['Intercensal',1.26],['2026 (est.)',0.95]]}
};

/* ---------- 5. TRIVIA: banco de 30 preguntas ---------------------------- */
// c = índice de la opción correcta (antes de mezclar). cat = categoría.
const TRIVIA = [
 {id:'t01',cat:'Historia',q:'¿Qué hito mundial ocurrió hace 5.500 años en Santa Ana-La Florida (Palanda, Zamora Chinchipe)?',o:['La cultura Mayo-Chinchipe domesticó el cacao: el uso más antiguo conocido en el mundo','Se construyó el primer observatorio inca','Llegaron las primeras semillas de plátano desde Asia','Se firmó el primer tratado comercial con Mesoamérica'],c:0,e:'Estudios del IRD y del INPC, publicados en Nature Ecology & Evolution (2018), mostraron cacao domesticado hacia 3500 a. C.'},
 {id:'t02',cat:'Geografía',q:'¿Por qué la cumbre del Chimborazo (6.263,47 m s. n. m.) tiene un récord mundial frente al Everest?',o:['Tiene el cráter activo más ancho del continente','Por el abultamiento ecuatorial, es el punto más alejado del centro de la Tierra: 6.384,416 km','Es el único glaciar a nivel del mar','Fue medido con radares submarinos'],c:1,e:'La medición del IGM y el IRD (2016) lo ubica 2.168 m más lejos del centro terrestre que el Everest.'},
 {id:'t03',cat:'Identidad',q:'Según el Artículo 2 de la Constitución de 2008, ¿cuáles son los idiomas oficiales de relación intercultural?',o:['Solo el castellano y el inglés','El castellano, el kichwa y el shuar','El quechua cuzqueño, el guaraní y el aimara','El castellano y el latín'],c:1,e:'El castellano es el idioma oficial; castellano, kichwa y shuar lo son de relación intercultural.'},
 {id:'t04',cat:'Gastronomía',q:'En los patacones, ¿para qué sirve la primera fritura a 155 °C?',o:['Dorar la corteza al máximo','Gelatinizar el almidón para poder majar el plátano en caliente sin que se quiebre','Quitar el sabor del plátano','Derretir la cáscara'],c:1,e:'Después se maja en caliente (>65 °C) y una segunda fritura a 185 °C crea la corteza crujiente.'},
 {id:'t05',cat:'Gastronomía',q:'En el morocho, ¿por qué el grano se hierve primero solo en agua con especias, antes de añadir la leche?',o:['Porque el calcio y las proteínas de la leche, desde el inicio, impermeabilizan el grano e impiden que se ablande','Para que el maíz se vuelva morado','Porque la leche se evapora a 40 °C','Para no usar canela'],c:0,e:'El grano debe gelatinizarse primero en medio acuoso; la leche se incorpora después.'},
 {id:'t06',cat:'Gastronomía',q:'En el jugo de maracuyá, ¿por qué se licúa con pulsos breves de 2 segundos?',o:['Para ahorrar electricidad','Para calentar el jugo','Para separar el arilo sin triturar las semillas, y así evitar amargor','Para pulverizar la cáscara'],c:2,e:'Triturar la semilla libera compuestos amargos y lípidos que se oxidan.'},
 {id:'t07',cat:'Economía',q:'¿Qué hizo la Ley Orgánica para Enfrentar el Conflicto Armado Interno (marzo de 2024) con el IVA?',o:['Lo eliminó','Lo subió de 12 % a 13 % y dio al Presidente la facultad de llevarlo hasta 15 %','Lo fijó en 50 % para alimentos','Lo prohibió para la exportación'],c:1,e:'El Presidente usó esa facultad y fijó el IVA en 15 %. La ley también creó contribuciones temporales de bancos y cooperativas.'},
 {id:'t08',cat:'Deporte',q:'¿Cuántas medallas olímpicas tiene el Ecuador hasta París 2024?',o:['5, todas en natación','10: 4 de oro, 4 de plata y 2 de bronce','2, ambas de fútbol','15 en deportes de invierno'],c:1,e:'Los oros son de Jefferson Pérez (1996), Richard Carapaz y Neisi Dajomes (2021) y Brian Pintado (2024).'},
 {id:'t09',cat:'Ciencia',q:'¿Qué empresa ecuatoriana de pagos fue el primer «unicornio» del país, con valor superior a USD 1.500 millones en 2022?',o:['Kushki','Petroecuador','Banco del Pacífico','Corporación Favorita'],c:0,e:'Kushki, fundada por Aron Schwarzkopf y Sebastián Castro, recaudó USD 186 millones en su Serie B.'},
 {id:'t10',cat:'Derecho',q:'¿Por qué la Constitución de 2008 es un referente mundial en materia ambiental?',o:['Privatizó los parques nacionales','Fue la primera del mundo en reconocer los Derechos de la Naturaleza (Arts. 71–74)','Autorizó la pesca industrial en Galápagos','Eliminó el Ministerio del Ambiente'],c:1,e:'Es el llamado constitucionalismo biocéntrico, ligado al Sumak Kawsay o buen vivir.'},
 {id:'t11',cat:'Historia',q:'¿Cuándo se fundó San Francisco de Quito?',o:['6 de diciembre de 1534','24 de mayo de 1822','9 de octubre de 1820','10 de agosto de 1809'],c:0,e:'Las otras fechas son la Batalla de Pichincha, la independencia de Guayaquil y la Primera Junta de Quito.'},
 {id:'t12',cat:'Historia',q:'¿Quién derrotó a los realistas en la Batalla de Pichincha del 24 de mayo de 1822?',o:['Eloy Alfaro','Gabriel García Moreno','El mariscal Antonio José de Sucre','Juan José Flores'],c:2,e:'La victoria selló la libertad del territorio quiteño, que luego se integró a la Gran Colombia.'},
 {id:'t13',cat:'Historia',q:'¿En qué año fue el Ecuador pionero latinoamericano en reconocer el voto femenino?',o:['1830','1895','1929','1979'],c:2,e:'En 1830 solo votaban varones propietarios que supieran leer; el voto se amplió con el tiempo.'},
 {id:'t14',cat:'Historia',q:'¿Cuántas constituciones tuvo el Ecuador entre 1830 y 2008?',o:['Tres','Siete','Veinte','Cincuenta'],c:2,e:'El país suele resolver sus crisis políticas con nuevas constituciones; la de Montecristi es la vigésima.'},
 {id:'t15',cat:'Sociedad',q:'¿Cuántos habitantes contó el Censo de 2022?',o:['9.200.000','16.938.986','25.400.000','41.000.000'],c:1,e:'La proyección del INEC para 2026 es de cerca de 18,45 millones. El 63,1 % vive en áreas urbanas.'},
 {id:'t16',cat:'Deporte',q:'¿Cómo se juega el ecuavóley?',o:['Seis contra seis, con red baja','Tres contra tres, con red de 2,85 m y balón pesado (el de fútbol n.º 5)','Uno contra uno, sin red','Cuatro contra cuatro, con raquetas'],c:1,e:'Es un deporte de masas, practicado también por los migrantes ecuatorianos en España y Estados Unidos.'},
 {id:'t17',cat:'Deporte',q:'¿Quién es el máximo goleador histórico de la Copa Libertadores, con 54 goles?',o:['Alberto Spencer','Enner Valencia','Agustín Delgado','Álex Aguinaga'],c:0,e:'Spencer, «Cabeza Mágica», nació en Ancón y fue campeón intercontinental con Peñarol.'},
 {id:'t18',cat:'Deporte',q:'¿A qué tenista famoso venció Andrés Gómez para ganar Roland Garros en 1990?',o:['Pete Sampras','Andre Agassi','Rafael Nadal','Boris Becker'],c:1,e:'El «Zurdo de Oro» de Guayaquil llegó a ser número 4 en individuales y número 1 en dobles.'},
 {id:'t19',cat:'Ciencia',q:'¿Qué planta de Loja fue declarada Planta Nacional en 1936 por su uso contra la malaria?',o:['El cacao','La quina o cascarilla','El maíz morocho','La paja toquilla'],c:1,e:'La corteza de la quina dio al mundo la quinina, primer medicamento eficaz contra el paludismo.'},
 {id:'t20',cat:'Economía',q:'¿Cuántos sucres equivalían a un dólar cuando se decretó la dolarización el 9 de enero de 2000?',o:['100','2.500','25.000','250.000'],c:2,e:'La crisis bancaria de 1999 había llevado el dólar de 7.000 a 25.000 sucres en solo un año.'},
 {id:'t21',cat:'Geografía',q:'¿Qué porcentaje del territorio nacional ocupa la Amazonía?',o:['3,1 %','24,8 %','26,4 %','45,7 %'],c:3,e:'Es la región más extensa: 116.588 km² y seis provincias.'},
 {id:'t22',cat:'Economía',q:'¿Qué parte de la oferta mundial de cacao fino de aroma (variedad Nacional Arriba) produce el Ecuador?',o:['Menos del 5 %','Cerca del 20 %','Más del 60 %','El 100 %'],c:2,e:'Es el primer exportador mundial de cacao fino de aroma.'},
 {id:'t23',cat:'Ciencia',q:'¿Cuánto invierte el Ecuador en investigación y desarrollo?',o:['Entre 0,40 % y 0,44 % del PIB','Entre 4 % y 4,4 % del PIB','Más del 10 % del PIB','No invierte nada'],c:0,e:'El promedio de la OCDE supera el 2,4 %. Aun así, la producción científica creció con fuerza.'},
 {id:'t24',cat:'Geografía',q:'¿A qué distancia del continente están las islas Galápagos?',o:['972 km','97 km','9.720 km','Están pegadas a la costa'],c:0,e:'Son Patrimonio Natural de la Humanidad desde 1978 y están sobre el punto caliente de la placa de Nazca.'},
 {id:'t25',cat:'Deporte',q:'¿Qué logró Jefferson Pérez en Atlanta 1996?',o:['Plata en ciclismo','Oro en 20 km marcha, la primera medalla de oro olímpica del país','Bronce en boxeo','Oro en natación'],c:1,e:'Después fue tricampeón mundial (2003, 2005 y 2007) y plata en Beijing 2008.'},
 {id:'t26',cat:'Cultura',q:'¿Cuándo se celebra el Pase del Niño Viajero en Cuenca?',o:['El 1 de enero','El 24 de diciembre','El 24 de junio','El 10 de agosto'],c:1,e:'Es la procesión religiosa y cultural más grande del país.'},
 {id:'t27',cat:'Cultura',q:'¿De qué fiesta es la «toma de la plaza», con danzas y ofrendas a la Pachamama en junio?',o:['Diablada de Píllaro','Inti Raymi','Carnaval de Guaranda','Mama Negra'],c:1,e:'El Inti Raymi agradece a la Madre Tierra por los frutos; se celebra en Otavalo, Cayambe y Cañar.'},
 {id:'t28',cat:'Historia',q:'¿Qué ciclo económico se conoce como la «Pepa de Oro» (1880–1920)?',o:['El petróleo','El banano','El cacao','El camarón'],c:2,e:'El cacao impulsó la banca de Guayaquil y financió el ferrocarril.'},
 {id:'t29',cat:'Geografía',q:'¿Cómo se llama el conjunto de volcanes que flanquean la Sierra?',o:['Ruta del Sol','Avenida de los Volcanes','Cinturón del Fuego Azul','Valle de los Reyes'],c:1,e:'Incluye el Chimborazo y el Cotopaxi (5.897 m s. n. m.), este último activo.'},
 {id:'t30',cat:'Economía',q:'¿Cuál es la principal exportación no petrolera del Ecuador?',o:['El camarón','El petróleo refinado','Los automóviles','La quinua'],c:0,e:'Vende entre USD 6.300 y 7.200 millones al año y es el primer exportador mundial.'}
];

/* ---------- 6. MEMORAMA: 10 pares (cada partida usa 6) ------------------ */
const PARES = [
 {id:'m1', a:['🏔️','Volcán Chimborazo'],            b:['🌍','6.384,4 km del centro de la Tierra'], e:'Es el punto de la superficie más alejado del centro del planeta.'},
 {id:'m2', a:['🏺','Cultura Mayo-Chinchipe'],        b:['🍫','Cacao hace 5.500 años (Palanda)'],    e:'El uso del cacao más antiguo conocido del mundo.'},
 {id:'m3', a:['👟','Brian Pintado'],                 b:['🥇','Oro en 20 km marcha, París 2024'],    e:'Su oro es el cuarto en la historia olímpica del país.'},
 {id:'m4', a:['💻','Kushki'],                        b:['🦄','Primer unicornio: más de USD 1.500 M'],e:'Una empresa de pagos que opera en varios países de la región.'},
 {id:'m5', a:['🌿','Quina de Loja'],                 b:['⚕️','Planta Nacional (1936) y origen de la quinina'], e:'Con su corteza se trató la malaria desde el siglo XVII.'},
 {id:'m6', a:['⚖️','Artículos 71 a 74'],             b:['🌱','Derechos de la Naturaleza (2008)'],   e:'Ecuador fue el primer país en reconocerlos en su Constitución.'},
 {id:'m7', a:['🚶','Jefferson Pérez'],               b:['🏅','Oro en Atlanta 1996'],                e:'La primera medalla de oro olímpica del Ecuador.'},
 {id:'m8', a:['⚽','Alberto Spencer'],               b:['🏆','54 goles en la Libertadores'],        e:'Es el máximo goleador histórico del torneo.'},
 {id:'m9', a:['⚔️','Sucre'],                         b:['📅','Batalla de Pichincha, 24 de mayo de 1822'], e:'La victoria selló la libertad del territorio quiteño.'},
 {id:'m10',a:['🏐','Ecuavóley'],                     b:['📏','3 contra 3 y red de 2,85 m'],         e:'Una variante local del voleibol, jugada en todo el país.'}
];

/* ---------- 7. RUTA EQUINOCCIAL: ordenar eventos en el tiempo ----------- */
// Se eligen 5 al azar; hay que ordenarlos del más antiguo al más reciente.
const RUTA = [
 ['Fundación de San Francisco de Quito',1534],['Creación de la Real Audiencia de Quito',1563],['Misión Geodésica y nombre «Ecuador»',1736],
 ['Primera Junta Soberana de Quito',1809],['Batalla de Pichincha',1822],['Primera Constitución en Riobamba',1830],
 ['Revolución Liberal de Eloy Alfaro',1895],['Voto femenino',1929],['Protocolo de Río de Janeiro',1942],['Inicio de la era petrolera',1972],
 ['Retorno a la democracia',1979],['Dolarización',2000],['Constitución de Montecristi',2008],['Consulta popular del Yasuní',2023]
];

/* ---------- 8. REGIONES: clasificador (18 elementos) -------------------- */
const REGIONES_ITEMS = [
 {n:'Primer exportador mundial de camarón y de banano',r:'costa',p:'Guayas, Manabí, El Oro y Esmeraldas'},
 {n:'Tejido del sombrero de paja toquilla en Montecristi',r:'costa',p:'Patrimonio cultural del litoral'},
 {n:'Marimba esmeraldeña',r:'costa',p:'Música del norte del litoral'},
 {n:'Guayaquil y su puerto, motor agroexportador',r:'costa',p:'Junto al golfo del Pacífico'},
 {n:'Plátano barraganete de los patacones',r:'costa',p:'Triángulo de oro de Santo Domingo y Los Ríos'},
 {n:'Cacao fino de aroma «Nacional Arriba»',r:'costa',p:'Cuenca del Guayas'},
 {n:'Volcán Chimborazo y la Avenida de los Volcanes',r:'sierra',p:'Entre dos ramales de los Andes'},
 {n:'Centro Histórico de Quito (1978)',r:'sierra',p:'Capital a 2.850 m de altura'},
 {n:'Cuenca, Patrimonio de la Humanidad (1999)',r:'sierra',p:'Valle del Austro'},
 {n:'Complejo inca-cañari de Ingapirca',r:'sierra',p:'Provincia de Cañar'},
 {n:'Diablada de Píllaro, del 1 al 6 de enero',r:'sierra',p:'Provincia de Tungurahua'},
 {n:'Quina o cascarilla, Planta Nacional',r:'sierra',p:'Bosques de Loja'},
 {n:'Parque Nacional Yasuní',r:'amazonia',p:'Megabiodiversidad en el oriente'},
 {n:'Santa Ana-La Florida: cacao de hace 5.500 años',r:'amazonia',p:'Palanda, Zamora Chinchipe'},
 {n:'Pueblos shuar, achuar, waorani y sápara',r:'amazonia',p:'Nacionalidades originarias del oriente'},
 {n:'Volcán Sumaco (3.732 m)',r:'amazonia',p:'Cordillera de Napo-Galeras'},
 {n:'Bono Azul de conservación (2023)',r:'galapagos',p:'Archipiélago a 972 km del continente'},
 {n:'Isla Isabela y el volcán Wolf',r:'galapagos',p:'Isla más grande del archipiélago'}
];

/* ---------- 9. PUNTOS: topes por actividad ------------------------------ */
const TOPES = {trivia:450, memorama:150, ruta:100, regiones:120, mapa:60, explorar:60};
const META = 600;
const RANGOS = [
  {min:0,   nombre:'Visitante',        ic:'🧭'},
  {min:100, nombre:'Investigador Andino', ic:'🔎'},
  {min:300, nombre:'Sabio Geodésico',  ic:'📐'},
  {min:600, nombre:'Gran Cóndor',      ic:'🦅'}
];

/* ---------- 10. TOUR EN 60 s: escenas del mini-documental ------------- */
const TOUR = [
  {seg:7, t:'La mitad del mundo', d:'Una línea imaginaria cruza el país: el Ecuador lleva el nombre de la latitud 0°.', foco:'mitad', zoom:'norte', paisaje:'andes'},
  {seg:9, t:'El punto más lejano de la Tierra', d:'La cumbre del Chimborazo está a 6.384,416 km del centro del planeta: más lejos que el Everest.', foco:'chimborazo', zoom:'sierra', paisaje:'andes'},
  {seg:8, t:'Costa: mar, puertos y cacao', d:'Primer exportador mundial de camarón y banano. Aquí nacen los patacones.', foco:'guayaquil', zoom:'costa', paisaje:'costa'},
  {seg:8, t:'Sierra: volcanes y ciudades patrimonio', d:'Quito y Cuenca son Patrimonio de la Humanidad y los Andes guardan la Avenida de los Volcanes.', foco:'quito', zoom:'sierra', paisaje:'andes'},
  {seg:9, t:'Amazonía: la cuna del cacao', d:'En Palanda se domesticó el cacao hace 5.500 años. El Yasuní guarda una biodiversidad única.', foco:'yasuni', zoom:'amazonia', paisaje:'selva'},
  {seg:9, t:'Galápagos: el laboratorio de Darwin', d:'A 972 km del continente, fueron el primer Patrimonio Natural de la Humanidad (1978).', foco:'galapagos', zoom:'galapagos', paisaje:'costa'},
  {seg:8, t:'Un país con derechos para la naturaleza', d:'En 2008 fue el primero en reconocer los Derechos de la Naturaleza en su Constitución.', foco:'todo', zoom:'todo', paisaje:'andes'}
];

/* ---------- 11. AUDIO: paisajes sonoros --------------------------------- */
// Los sonidos se sintetizan en el navegador. Para usar grabaciones reales,
// agrega una carpeta «audio/» y escribe el nombre en «src» (ej.: 'audio/pasillo.mp3').
const AUDIOS = [
  {id:'andes',    t:'Andes',     d:'Quena y viento de páramo', ic:'🏔️', col:'#8a5ca8', src:''},
  {id:'costa',    t:'Costa',     d:'Oleaje del Pacífico y gaviotas', ic:'🌊', col:'#e9a23b', src:''},
  {id:'selva',    t:'Amazonía',  d:'Lluvia, ranas y aves', ic:'🌿', col:'#2f9d73', src:''},
  {id:'islas',    t:'Galápagos', d:'Mar abierto y brisa', ic:'🐢', col:'#2ba3c9', src:''}
];
/* Video externo opcional: pega aquí el identificador de un video de YouTube
   (lo que va después de «v=») y aparecerá en la sección Multimedia. */
const VIDEO_YOUTUBE = '';

/* ---------- 12. FUENTES (resumen de la bibliografía del informe) -------- */
const FUENTES = [
  'Constitución de la República del Ecuador (2008), Registro Oficial N.º 449.',
  'INEC: Censo de Población y Vivienda 2022 y proyecciones; ENEMDU.',
  'Banco Central del Ecuador (BCE), FMI, CEPAL y Banco Mundial: indicadores económicos 2024–2026.',
  'Instituto Geográfico Militar (IGM) e IRD (Francia): Misión Geodésica y medición del Chimborazo (2016).',
  'INPC e IRD; Zarrillo et al. (2018), Nature Ecology & Evolution: cacao de la cultura Mayo-Chinchipe.',
  'PNUD: Índice de Desarrollo Humano; UNESCO: patrimonio cultural y natural.',
  'Comité Olímpico Internacional y Comité Olímpico Ecuatoriano: medallero.',
  'Ley Orgánica para Enfrentar el Conflicto Armado Interno (R. O. Suplemento 516, 12 de marzo de 2024).',
  'RICYT y UNESCO: inversión en ciencia y tecnología.',
  'ICCO, MAG y CNA: producción de cacao fino y camarón.'
];
