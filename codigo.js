/* ========================================================================
           A. GESTIÓN DE ESTADO GLOBAL Y MOTOR DE SONIDO SINTETIZADO (WEB AUDIO API)
           ======================================================================== */
        let puntajeGlobal = 0;
        let audioHabilitado = true;
        let audioCtx = null;

        let interaccionUsuario = false;
        document.addEventListener('pointerdown', () => { interaccionUsuario = true; }, { once: true });

        function reproducirSonido(tipo) {
            if (!audioHabilitado || !interaccionUsuario) return;
            try {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                const ahora = audioCtx.currentTime;
                if (tipo === 'acierto') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(523.25, ahora); // C5
                    osc.frequency.setValueAtTime(659.25, ahora + 0.08); // E5
                    osc.frequency.setValueAtTime(783.99, ahora + 0.16); // G5
                    gain.gain.setValueAtTime(0.18, ahora);
                    gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.35);
                    osc.start(ahora);
                    osc.stop(ahora + 0.35);
                } else if (tipo === 'error') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, ahora);
                    osc.frequency.linearRampToValueAtTime(130, ahora + 0.25);
                    gain.gain.setValueAtTime(0.15, ahora);
                    gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.28);
                    osc.start(ahora);
                    osc.stop(ahora + 0.28);
                } else if (tipo === 'clic') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, ahora);
                    gain.gain.setValueAtTime(0.08, ahora);
                    gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.06);
                    osc.start(ahora);
                    osc.stop(ahora + 0.06);
                } else if (tipo === 'victoria') {
                    const notas = [523.25, 659.25, 783.99, 1046.50];
                    notas.forEach((frec, idx) => {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.type = 'triangle';
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.frequency.setValueAtTime(frec, ahora + idx * 0.1);
                        g.gain.setValueAtTime(0.18, ahora + idx * 0.1);
                        g.gain.exponentialRampToValueAtTime(0.001, ahora + idx * 0.1 + 0.25);
                        o.start(ahora + idx * 0.1);
                        o.stop(ahora + idx * 0.1 + 0.25);
                    });
                }
            } catch (e) {
                // Silencioso si el navegador bloquea Web Audio antes de interacción
            }
        }

        function alternarAudio() {
            audioHabilitado = !audioHabilitado;
            const icono = document.getElementById('icono-audio');
            const btn = document.getElementById('btn-audio');
            icono.className = audioHabilitado ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark text-slate-400';
            if (btn) {
                btn.setAttribute('aria-pressed', audioHabilitado ? 'true' : 'false');
                btn.setAttribute('aria-label', audioHabilitado ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido');
            }
            if (audioHabilitado) reproducirSonido('clic');
        }

        function sumarPuntosGlobales(cantidad) {
            puntajeGlobal += cantidad;
            const scoreEl = document.getElementById('score');
            const rangoEl = document.getElementById('rango-visitante');
            scoreEl.textContent = puntajeGlobal;
            scoreEl.classList.remove('score-bump');
            void scoreEl.offsetWidth;
            scoreEl.classList.add('score-bump');

            if (puntajeGlobal >= 600) {
                rangoEl.textContent = 'Gran Cóndor 🇪🇨';
                rangoEl.className = 'text-[10px] text-yellow-400 font-bold uppercase block leading-none';
            } else if (puntajeGlobal >= 300) {
                rangoEl.textContent = 'Sabio Geodésico';
                rangoEl.className = 'text-[10px] text-emerald-400 font-bold uppercase block leading-none';
            } else if (puntajeGlobal >= 100) {
                rangoEl.textContent = 'Investigador Andino';
                rangoEl.className = 'text-[10px] text-blue-400 font-bold uppercase block leading-none';
            }
        }

        /* ========================================================================
           B. DATOS DEL MAPA INTERACTIVO (LAS 4 REGIONES GEOGRÁFICAS) Y 10 DATOS
           ======================================================================== */
        const datosRegiones = {
            costa: {
                nombre: "1. Región Litoral o Costa",
                porcentaje: "26,4% del territorio nacional (7 Provincias)",
                colorBadge: "bg-amber-100 text-amber-900 border-amber-300",
                provincias: "Esmeraldas, Manabí, Santo Domingo de los Tsáchilas, Los Ríos, Guayas, Santa Elena y El Oro.",
                relieveClima: "Llanuras aluviales fértiles (<1.000 m s. n. m.) y cordilleras costeras bajas (Chongón-Colonche, Mache-Chindul). Clima tropical húmedo al norte y seco al sur, regulado por las corrientes de Humboldt (fría) y El Niño (cálida). Hidrografía dominada por la cuenca del río Guayas (34.500 km², la mayor de la vertiente pacífica sudamericana) y el río Esmeraldas.",
                economiaCultura: "Motor agroexportador, acuícola y portuario del país (Guayaquil, Posorja, Manta, Esmeraldas y Puerto Bolívar). Primer exportador mundial de camarón blanco, banano fresco y cacao fino de aroma (variedad Nacional Arriba). Cuna del pueblo Montubio, del pueblo Afroesmeraldeño (Marimba UNESCO 2015), del tejido del Sombrero de Paja Toquilla en Montecristi (UNESCO 2012) y de los Patacones de plátano Barraganete.",
                hitoClave: "Guayas y Pichincha generan conjuntamente más del 53% del Valor Agregado Bruto no petrolero nacional."
            },
            sierra: {
                nombre: "2. Región Interandina o Sierra",
                porcentaje: "24,8% del territorio nacional (10 Provincias)",
                colorBadge: "bg-purple-100 text-purple-900 border-purple-300",
                provincias: "Carchi, Imbabura, Pichincha, Cotopaxi, Tungurahua, Bolívar, Chimborazo, Cañar, Azuay y Loja.",
                relieveClima: "Conformada por dos ramales paralelos de los Andes (Cordillera Occidental y Cordillera Real) unidos por nudos transversales que forman hoyas interandinas entre 1.800 y 3.200 m s. n. m. Alberga la «Avenida de los Volcanes», presidida por el volcán Chimborazo (6.263,47 m s. n. m., punto más alejado del centro de la Tierra a 6.384,416 km) y el volcán Cotopaxi (5.897 m s. n. m.).",
                economiaCultura: "Sede de la capital constitucional (Quito) y de los centros históricos Patrimonio de la Humanidad de Quito (1978) y Cuenca (1999), además del complejo inca-cañari de Ingapirca. Concentra la producción de soberanía alimentaria (más de 300 variedades de papa, maíz morocho y suave, lácteos), floricultura de exportación (rosas de altitud), manufactura y el Árbol Nacional de la Quina o Cascarilla en Loja.",
                hitoClave: "Cuna del entrenamiento en hipoxia de altitud de los campeones olímpicos Jefferson Pérez, Richard Carapaz y Brian Pintado."
            },
            amazonia: {
                nombre: "3. Región Amazónica u Oriente",
                porcentaje: "45,7% del territorio nacional (6 Provincias — 116.588 km²)",
                colorBadge: "bg-emerald-100 text-emerald-900 border-emerald-300",
                provincias: "Sucumbíos, Orellana, Napo, Pastaza, Morona Santiago y Zamora Chinchipe.",
                relieveClima: "Dividida entre la Alta Amazonía (cordilleras subandinas de Napo-Galeras con el volcán Sumaco a 3.732 m s. n. m., Cutucú y del Cóndor) y la llanura aluvial amazónica (<300 m s. n. m.). Clima ecuatorial cálido superhúmedo (>3.000 mm de lluvia) irrigado por caudalosos ríos tributarios del Amazonas: Putumayo, Aguarico, Napo, Curaray, Pastaza, Morona, Santiago y Mayo-Chinchipe.",
                economiaCultura: "Epicentro mundial de megabiodiversidad (Parque Nacional Yasuní) y territorio de nacionalidades originarias (Kichwa, Shuar, Achuar, Shiwiar, Waorani, Cofán, Siona, Siekopai, Sápara y Andoa). Sostén energético y fiscal del Estado: concentra la extracción petrolera, los proyectos mineros de cobre y oro (Mirador y Fruta del Norte) y los grandes complejos hidroeléctricos.",
                hitoClave: "En Santa Ana-La Florida (Palanda, Zamora Chinchipe), la cultura Mayo-Chinchipe domesticó el cacao hace 5.500 años (3500 a. C.)."
            },
            galapagos: {
                nombre: "4. Región Insular o Archipiélago de Galápagos",
                porcentaje: "3,1% del territorio terrestre (8.010 km² + Reserva Marina)",
                colorBadge: "bg-sky-100 text-sky-900 border-sky-300",
                provincias: "Provincia de Galápagos (Capital: Puerto Baquerizo Moreno en la isla San Cristóbal).",
                relieveClima: "Situada en el océano Pacífico a 972 km al oeste del continente sobre el punto caliente de la placa de Nazca. Integrada por 13 islas mayores volcánicas (Isabela, Santa Cruz, Fernandina, Santiago, San Cristóbal, etc.), 17 islotes y más de 200 rocas. Punto más alto: volcán Wolf (1.707 m s. n. m.). Clima regulado por las corrientes de Humboldt, Cromwell y Panamá.",
                economiaCultura: "Primer Patrimonio Natural de la Humanidad declarado por la UNESCO (1978) y laboratorio natural que inspiró la teoría de la evolución por selección natural de Charles Darwin (1835). Gobernada bajo Régimen Especial constitucional (Art. 258), su economía se sustenta en el ecoturismo científico regulado y la conservación marina.",
                hitoClave: "En 2023 protagonizó el mayor Canje de Deuda por Naturaleza de la historia mundial («Bono Azul de Galápagos»), ahorrando más de USD 1.100 millones al país."
            }
        };

        const diezDatosImpactantes = [
            { num: "01", titulo: "Población Oficial", cifra: "18,45 M hab.", sub: "Proyección 2026 (Censo 2022: 16,93 M)", detalle: "Crecimiento anual de 1,26% intercensal; 63,1% urbana y edad mediana de 29 años (INEC).", icono: "fa-users" },
            { num: "02", titulo: "Superficie Total", cifra: "256.370 km²", sub: "+1.092.140 km² marítimos (CONVEMAR)", detalle: "Su jurisdicción oceánica multiplica por 4,26 veces su territorio terrestre continental e insular (IGM).", icono: "fa-earth-americas" },
            { num: "03", titulo: "PIB Dolarizado", cifra: "USD 121.800 M", sub: "Per cápita: USD 6.620 (PPA: $14.580)", detalle: "Séptima economía sudamericana con inflación anual de apenas 1,35%–2,60% (BCE / FMI).", icono: "fa-sack-dollar" },
            { num: "04", titulo: "Esperanza de Vida", cifra: "77,9 Años", sub: "80,6 mujeres | 75,2 hombres", detalle: "Supera por más de dos años el promedio de América Latina (75,6 años) (PNUD / INEC).", icono: "fa-heart-pulse" },
            { num: "05", titulo: "Alfabetización", cifra: "94,4% Adulta", sub: "99,1% en jóvenes de 15 a 24 años", detalle: "Cobertura neta de 93,2% en Educación Básica y Educación Intercultural Bilingüe en 14 lenguas.", icono: "fa-book-open-reader" },
            { num: "06", titulo: "Desarrollo Humano", cifra: "IDH 0,765", sub: "Categoría Alto (Puesto 83 mundial)", detalle: "Coeficiente de Gini de 0,458 y reto prioritario contra la desnutrición crónica infantil (>25%).", icono: "fa-chart-line" },
            { num: "07", titulo: "Líder Agroindustrial", cifra: "62% Cacao Fino", sub: "N.º 1 mundial en Cacao Fino y Camarón", detalle: "Exporta más de 1,21 millones de toneladas de camarón y lidera el banano global (ICCO / CNA).", icono: "fa-seedling" },
            { num: "08", titulo: "Ranking Olímpico", cifra: "10 Medallas", sub: "4 Oros, 4 Platas y 2 Bronces JJ.OO.", detalle: "5 medallas en París 2024 y 5 clasificaciones a Copas Mundiales de la FIFA (COI / COE).", icono: "fa-medal" },
            { num: "09", titulo: "Top Exportaciones", cifra: "USD 31.500 M", sub: "1.º Petróleo, 2.º Camarón, 3.º Banano/Cacao", detalle: "Sostienen una balanza comercial superavitaria >USD 3.500 millones anuales (BCE).", icono: "fa-ship" },
            { num: "10", titulo: "Récord Planetario", cifra: "6.384,416 km", sub: "Volcán Chimborazo al centro terrestre", detalle: "Supera por 2.168 m al Everest desde el centro de la Tierra (IGM/IRD) y 1.er país con Derechos de la Naturaleza.", icono: "fa-mountain-sun" }
        ];


        const regionesVisitadas = new Set();
        let pestanaRegion = 'resumen';
        let regionActual = 'costa';
        let datosExpandido = false;
        let indiceDatoCarrusel = 0;

        const hotspotsMapa = {
            quito: { region: 'sierra', titulo: 'Quito', texto: 'Capital constitucional y sede de los 5 poderes del Estado.' },
            chimborazo: { region: 'sierra', titulo: 'Chimborazo', texto: 'Punto más alejado del centro de la Tierra: 6.384,416 km.' },
            guayaquil: { region: 'costa', titulo: 'Guayaquil', texto: 'Principal puerto y motor agroexportador del litoral.' },
            yasuni: { region: 'amazonia', titulo: 'Yasuní', texto: 'Parque Nacional: megabiodiversidad y pueblos originarios.' },
            palanda: { region: 'amazonia', titulo: 'Palanda', texto: 'Santa Ana-La Florida: cacao domesticado hace 5.500 años.' },
            cuenca: { region: 'sierra', titulo: 'Cuenca', texto: 'Centro histórico Patrimonio de la Humanidad (UNESCO 1999).' },
            galapagos: { region: 'galapagos', titulo: 'Galápagos', texto: 'Archipiélago volcánico y laboratorio vivo de la evolución.' }
        };

        function resumenCorto(texto, max = 160) {
            if (!texto) return '';
            if (texto.length <= max) return texto;
            return texto.slice(0, max).replace(/\s+\S*$/, '') + '…';
        }

        function actualizarProgresoMapa() {
            const total = 4;
            const n = regionesVisitadas.size;
            const fill = document.getElementById('map-progress-fill');
            const label = document.getElementById('map-progress-label');
            if (fill) fill.style.width = ((n / total) * 100) + '%';
            if (label) label.textContent = n + ' / ' + total + ' regiones exploradas';
        }

        function seleccionarRegionMapa(claveRegion, opts = {}) {
            if (!opts.silencio) reproducirSonido('clic');
            const info = datosRegiones[claveRegion];
            if (!info) return;
            regionActual = claveRegion;
            regionesVisitadas.add(claveRegion);
            actualizarProgresoMapa();

            ['costa', 'sierra', 'amazonia', 'galapagos'].forEach(reg => {
                const svgEl = document.getElementById(`svg-${reg}`);
                const btnEl = document.getElementById(`btn-reg-${reg}`);
                if (svgEl) {
                    svgEl.classList.toggle('activa', reg === claveRegion);
                    svgEl.classList.toggle('visitada', regionesVisitadas.has(reg));
                }
                if (btnEl) {
                    btnEl.className = reg === claveRegion ? 'region-chip region-chip-activa' : 'region-chip';
                    btnEl.setAttribute('aria-pressed', reg === claveRegion ? 'true' : 'false');
                }
            });

            document.querySelectorAll('.prov-svg').forEach(p => {
                const reg = p.getAttribute('data-region');
                p.classList.toggle('prov-activa', reg === claveRegion);
                p.classList.toggle('prov-visitada', regionesVisitadas.has(reg) && reg !== claveRegion);
                p.classList.toggle('prov-atenuada', reg !== claveRegion);
            });

            renderizarPanelRegion();
        }

        function cambiarPestanaRegion(id) {
            pestanaRegion = id;
            renderizarPanelRegion();
        }

        function renderizarPanelRegion() {
            const info = datosRegiones[regionActual];
            const panel = document.getElementById('panel-region-detalle');
            if (!panel || !info) return;
            const tabs = [
                { id: 'resumen', label: 'Resumen' },
                { id: 'provincias', label: 'Provincias' },
                { id: 'clima', label: 'Clima' },
                { id: 'economia', label: 'Economía' }
            ];
            panel.innerHTML = `
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <span class="px-3 py-1 rounded-full text-xs font-extrabold border ${info.colorBadge}">${info.porcentaje}</span>
                        <h3 class="font-titulo text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">${info.nombre.replace(/^\d+\.\s*/, '')}</h3>
                    </div>
                    <span class="w-10 h-10 rounded-xl bg-slate-900 text-yellow-400 grid place-items-center"><i class="fa-solid fa-location-dot" aria-hidden="true"></i></span>
                </div>
                <div class="panel-tabs" role="tablist">
                    ${tabs.map(t => `<button type="button" role="tab" class="panel-tab ${pestanaRegion === t.id ? 'is-on' : ''}" aria-selected="${pestanaRegion === t.id}" onclick="cambiarPestanaRegion('${t.id}')">${t.label}</button>`).join('')}
                </div>
                <div class="panel-pane" ${pestanaRegion !== 'resumen' ? 'hidden' : ''}>
                    <p>${resumenCorto(info.hitoClave, 220)}</p>
                    <p class="mt-3 text-sm text-slate-500">Cambia de pestaña para ver provincias, clima o economía.</p>
                </div>
                <div class="panel-pane" ${pestanaRegion !== 'provincias' ? 'hidden' : ''}>
                    <p><strong class="text-slate-900">Provincias:</strong> ${info.provincias}</p>
                </div>
                <div class="panel-pane" ${pestanaRegion !== 'clima' ? 'hidden' : ''}>
                    <p>${info.relieveClima}</p>
                </div>
                <div class="panel-pane" ${pestanaRegion !== 'economia' ? 'hidden' : ''}>
                    <p>${info.economiaCultura}</p>
                </div>
                <div class="mt-5 bg-slate-950 text-white p-4 rounded-xl border-l-4 border-yellow-400 text-sm">
                    <strong class="text-yellow-400 uppercase tracking-wider block text-xs mb-1">Dato para el jurado</strong>
                    <p>${info.hitoClave}</p>
                </div>
            `;
        }

        function mostrarTooltipMapa(texto, evt) {
            const tip = document.getElementById('map-tooltip');
            const canvas = document.querySelector('.map-canvas');
            if (!tip || !canvas) return;
            tip.hidden = false;
            tip.textContent = texto;
            const rect = canvas.getBoundingClientRect();
            const x = (evt.clientX || rect.left + rect.width / 2) - rect.left + 12;
            const y = (evt.clientY || rect.top + 40) - rect.top + 12;
            tip.style.left = Math.min(x, rect.width - 160) + 'px';
            tip.style.top = Math.min(y, rect.height - 48) + 'px';
        }

        function ocultarTooltipMapa() {
            const tip = document.getElementById('map-tooltip');
            if (tip) tip.hidden = true;
        }

        function abrirHotspot(id) {
            const h = hotspotsMapa[id];
            if (!h) return;
            seleccionarRegionMapa(h.region);
            pestanaRegion = 'resumen';
            const panel = document.getElementById('panel-region-detalle');
            if (panel) {
                const nota = document.createElement('div');
                nota.className = 'mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950';
                nota.innerHTML = `<strong>${h.titulo}:</strong> ${h.texto}`;
                const vieja = panel.querySelector('[data-hotspot-note]');
                if (vieja) vieja.remove();
                nota.setAttribute('data-hotspot-note', '1');
                panel.appendChild(nota);
            }
        }

        function seleccionarProvinciaMapa(el) {
            const reg = el.getAttribute('data-region');
            const nombre = el.getAttribute('data-provincia') || 'Provincia';
            if (!reg) return;
            seleccionarRegionMapa(reg);
            const panel = document.getElementById('panel-region-detalle');
            if (!panel) return;
            const vieja = panel.querySelector('[data-hotspot-note]');
            if (vieja) vieja.remove();
            const nota = document.createElement('div');
            nota.className = 'mt-3 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sm text-sky-950';
            nota.setAttribute('data-hotspot-note', '1');
            nota.innerHTML = `<strong>Provincia:</strong> ${nombre}`;
            panel.appendChild(nota);
        }

        function iniciarMapaInteractivo() {
            document.querySelectorAll('.prov-svg').forEach(el => {
                const activar = () => seleccionarProvinciaMapa(el);
                el.addEventListener('click', activar);
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        activar();
                    }
                });
                el.addEventListener('mouseenter', (e) => {
                    mostrarTooltipMapa(el.getAttribute('data-provincia') || 'Provincia', e);
                });
                el.addEventListener('mousemove', (e) => {
                    mostrarTooltipMapa(el.getAttribute('data-provincia') || 'Provincia', e);
                });
                el.addEventListener('mouseleave', ocultarTooltipMapa);
            });
            document.querySelectorAll('.region-svg').forEach(el => {
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const id = (el.id || '').replace('svg-', '');
                        seleccionarRegionMapa(id);
                    }
                });
            });
            document.querySelectorAll('.hotspot').forEach(el => {
                const id = el.getAttribute('data-hotspot');
                const open = () => abrirHotspot(id);
                el.addEventListener('click', open);
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
                });
            });
        }

        const catalogoVideos = [
            { id: 'U8zQmhU5iBU', titulo: 'Ecuador potencia turística', texto: 'Documental informativo de las 4 regiones.', tag: 'Documental' },
            { id: 'rFPYYfEHxbA', titulo: 'De Ecuador a Galápagos', texto: 'Documental completo: Quito, Amazonía e islas.', tag: 'Documental' },
            { id: 'zwBuVrMqZcA', titulo: 'Gastronomía ecuatoriana', texto: 'Sabores, tradición y cocina regional.', tag: 'Comida' },
            { id: 'pezK1ZZuC50', titulo: 'Encebollado ecuatoriano', texto: 'Cómo se prepara el plato estrella de la Costa.', tag: 'Comida' },
            { id: 'G1QXaYzETOc', titulo: 'Cómo comemos cuy', texto: 'Tradición andina explicada de forma amigable.', tag: 'Comida' },
            { id: 'sqIKC6NHcDw', titulo: 'All You Need Is Ecuador', texto: 'Campaña oficial de turismo (español).', tag: 'Turismo' },
            { id: 'JCtl3qCdBiM', titulo: 'Director’s cut turístico', texto: 'Costa, Andes, Amazonía y Galápagos.', tag: 'Turismo' },
            { id: 'lhXc0HIuYls', titulo: 'El pasillo ecuatoriano', texto: 'Música tradicional y patrimonio cultural.', tag: 'Cultura' },
            { id: 'LzsdNotN8jg', titulo: 'Himno Nacional (cantado)', texto: 'Versión oficial cantada del himno.', tag: 'Himno' }
        ];

        function renderizarVideosStand() {
            const grid = document.getElementById('video-grid');
            if (!grid) return;
            const puedeEmbed = location.protocol === 'http:' || location.protocol === 'https:';
            grid.innerHTML = catalogoVideos.map(v => `
                <article class="video-card" data-yt="${v.id}">
                    <div class="video-frame video-thumb" id="yt-frame-${v.id}">
                        <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="${v.titulo}" loading="lazy" width="480" height="360">
                        <span class="video-tag">${v.tag}</span>
                        <button type="button" class="video-play-btn" onclick="cargarVideoEmbed('${v.id}')" aria-label="Reproducir ${v.titulo}">
                            <i class="fa-solid fa-play" aria-hidden="true"></i>
                        </button>
                    </div>
                    <h3>${v.titulo}</h3>
                    <p>${v.texto}</p>
                    <div class="video-actions">
                        ${puedeEmbed ? `<button type="button" class="audio-play" onclick="cargarVideoEmbed('${v.id}')">Ver aquí</button>` : ''}
                        <a class="audio-play audio-play-ghost" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer">Abrir en YouTube</a>
                    </div>
                </article>
            `).join('');
        }

        function cargarVideoEmbed(id) {
            const frame = document.getElementById('yt-frame-' + id);
            if (!frame) return;
            if (location.protocol === 'file:') {
                window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener,noreferrer');
                return;
            }
            frame.classList.remove('video-thumb');
            frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="Video Ecuador" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
        }

        function cambiarMediaTab(id) {
            ['videos', 'audios', 'galeria'].forEach(k => {
                const pane = document.getElementById('media-pane-' + k);
                const tab = document.querySelector('.media-tab[data-media="' + k + '"]');
                if (pane) pane.classList.toggle('oculto', k !== id);
                if (tab) {
                    tab.classList.toggle('is-on', k === id);
                    tab.setAttribute('aria-selected', k === id ? 'true' : 'false');
                }
            });
        }

        let ambienteNodes = [];
        function detenerAmbiente() {
            ambienteNodes.forEach(n => {
                try { n.stop(); } catch (e) {}
            });
            ambienteNodes = [];
        }

        function reproducirAmbiente(tipo) {
            if (!audioHabilitado) return;
            interaccionUsuario = true;
            detenerAmbiente();
            detenerNarracion();
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const now = audioCtx.currentTime;
                const presets = {
                    costa: [196, 247, 294],
                    sierra: [220, 277, 330],
                    amazonia: [165, 196, 247],
                    galapagos: [185, 233, 311]
                };
                (presets[tipo] || presets.costa).forEach((freq, i) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.type = i === 0 ? 'sine' : 'triangle';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0.0001, now);
                    g.gain.exponentialRampToValueAtTime(0.04, now + 0.4);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.start(now);
                    o.stop(now + 4.3);
                    ambienteNodes.push(o);
                });
                reproducirSonido('clic');
            } catch (e) {}
        }

        function narrarStand() {
            if (!('speechSynthesis' in window)) return;
            detenerNarracion();
            const u = new SpeechSynthesisUtterance(
                'Bienvenidos al stand de la República del Ecuador. Explora el mapa de las veinticuatro provincias, el informe, los sabores y los juegos. Ecuador tiene costa, sierra, amazonía y Galápagos.'
            );
            u.lang = 'es-EC';
            u.rate = 1;
            window.speechSynthesis.speak(u);
        }

        function detenerNarracion() {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }

        function abrirGaleria(btn) {
            const modal = document.getElementById('modal-galeria');
            const img = document.getElementById('galeria-img');
            const cap = document.getElementById('galeria-caption');
            if (!modal || !img) return;
            img.src = btn.getAttribute('data-full') || '';
            img.alt = btn.querySelector('img')?.alt || '';
            if (cap) cap.textContent = btn.getAttribute('data-cap') || '';
            modal.classList.remove('oculto');
            document.body.style.overflow = 'hidden';
        }

        function cerrarGaleria() {
            const modal = document.getElementById('modal-galeria');
            if (!modal) return;
            modal.classList.add('oculto');
            document.body.style.overflow = '';
        }

        function renderizarDiezDatos() {
            const grid = document.getElementById('grid-10-datos');
            if (!grid) return;
            let lista = diezDatosImpactantes;
            if (!datosExpandido) {
                const start = indiceDatoCarrusel % diezDatosImpactantes.length;
                lista = [];
                for (let i = 0; i < 4; i++) {
                    lista.push(diezDatosImpactantes[(start + i) % diezDatosImpactantes.length]);
                }
            }
            grid.innerHTML = lista.map(d => `
                <article class="dato-card">
                    <div>
                        <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
                            <span class="font-titulo font-black text-yellow-400">#${d.num}</span>
                            <i class="fa-solid ${d.icono} text-sky-300" aria-hidden="true"></i>
                        </div>
                        <span class="text-xs font-semibold text-slate-300 block">${d.titulo}</span>
                        <div class="font-titulo font-extrabold text-xl text-white mt-1">${d.cifra}</div>
                        <span class="text-xs font-bold text-amber-300 block mt-1">${d.sub}</span>
                    </div>
                    <p class="text-xs text-slate-300 mt-3 pt-2 border-t border-slate-700/80 leading-snug">${d.detalle}</p>
                </article>
            `).join('');
        }

        function iniciarCarruselDatos() {
            const prev = document.getElementById('dato-prev');
            const next = document.getElementById('dato-next');
            const toggle = document.getElementById('dato-toggle');
            if (prev) prev.addEventListener('click', () => {
                if (datosExpandido) return;
                indiceDatoCarrusel = (indiceDatoCarrusel + diezDatosImpactantes.length - 1) % diezDatosImpactantes.length;
                renderizarDiezDatos();
            });
            if (next) next.addEventListener('click', () => {
                if (datosExpandido) return;
                indiceDatoCarrusel = (indiceDatoCarrusel + 1) % diezDatosImpactantes.length;
                renderizarDiezDatos();
            });
            if (toggle) toggle.addEventListener('click', () => {
                datosExpandido = !datosExpandido;
                toggle.setAttribute('aria-expanded', datosExpandido ? 'true' : 'false');
                toggle.textContent = datosExpandido ? 'Ver menos' : 'Ver los 10';
                renderizarDiezDatos();
            });
        }

        /* ========================================================================
           C. BASE DE DATOS COMPLETA DE LAS 11 SECCIONES DEL INFORME ACADÉMICO
           ======================================================================== */
        const seccionesInforme = [
            {
                id: "1A",
                tituloCorto: "1-A. Identidad",
                icono: "fa-flag",
                tituloCompleto: "1.- A. Identidad y Configuración del Estado",
                subtitulo: "Constitución de Montecristi (2008), Bandera (NTE INEN 1990), Límites, Capital, Demografía, Lenguas y Símbolos",
                tarjetas: [
                    {
                        encabezado: "1. Nombre Oficial y Origen Geodésico",
                        badge: "Art. 1 Constitución 2008",
                        puntos: [
                            "<strong>Denominación oficial:</strong> <em>República del Ecuador</em> (Constitución promulgada en el Registro Oficial N.º 449 del 20 de octubre de 2008). Se define como un Estado constitucional de derechos y justicia, social, democrático, soberano, independiente, unitario, intercultural, plurinacional y laico.",
                            "<strong>Origen histórico del nombre:</strong> En 1736 la Misión Geodésica Hispano-Francesa (La Condamine, Bouguer, Godin y el sabio riobambeño Pedro Vicente Maldonado) popularizó el nombre de «Tierras del Ecuador».",
                            "<strong>Neutralidad regional (1830):</strong> Tras separarse de la Gran Colombia el 13 de mayo de 1830, el Congreso Constituyente de Riobamba (23 de septiembre de 1830) adoptó el nombre «Estado del Ecuador» para evitar recelos regionales de Guayaquil y Cuenca frente a Quito. En 1835 (Constitución de Ambato) se consagró «República del Ecuador»."
                        ]
                    },
                    {
                        encabezado: "2. Bandera Nacional y Wiphala Plurinacional",
                        badge: "Decreto 1900 • NTE INEN 1990",
                        puntos: [
                            "<strong>Proporción y cromática:</strong> Regulada por el Decreto Legislativo del 31 de octubre de 1900 (Eloy Alfaro) y la norma técnica NTE INEN 1990. Relación 2:3 con tres franjas horizontales asimétricas: <strong>Amarillo primario (50% superior)</strong> por la riqueza aurífera, agrícola y el sol equinoccial; <strong>Azul cobalto (25% central)</strong> por el océano Pacífico y el cielo andino; y <strong>Rojo bermellón (25% inferior)</strong> por la sangre de los próceres emancipadores.",
                            "<strong>Estatus de la Wiphala:</strong> Conforme al Art. 57 numeral 1 de la Constitución, el Estado garantiza los símbolos de las 14 nacionalidades originarias, otorgando valor protocolar a la <em>Wiphala</em> y al bastón de mando."
                        ]
                    },
                    {
                        encabezado: "3. Ubicación Geográfica y 4. Capital (Quito)",
                        badge: "IGM • CONVEMAR 2012",
                        puntos: [
                            "<strong>Superficie y límites:</strong> 256.370 km² terrestres (248.360 km² continentales y 8.010 km² en Galápagos) + <strong>1.092.140 km² de espacios marítimos</strong> bajo la CONVEMAR (4,26 veces su área terrestre). Limita al norte con Colombia (586 km, Tratado Muñoz Vernaza-Suárez 1916), al sur y este con Perú (1.529 km, Protocolo de Río 1942 y Paz de Brasilia del 26 de octubre de 1998) y al noroeste marítimo con Costa Rica (Isla del Coco).",
                            "<strong>Capital y 5 Funciones del Estado:</strong> San Francisco de Quito (Art. 2 Constitución) es sede de las 5 Funciones: 1) Ejecutiva (Palacio de Carondelet), 2) Legislativa (Asamblea Nacional unicameral), 3) Judicial y Corte Constitucional, 4) Electoral (CNE y TCE) y 5) Transparencia y Control Social (CPCCS, Contraloría, Defensoría)."
                        ]
                    },
                    {
                        encabezado: "5. Población, 6. Idiomas, 7. Moneda y 9. Símbolos",
                        badge: "Censo INEC 2022 • Proy. 2026",
                        puntos: [
                            "<strong>Demografía y Etnicidad:</strong> 16.938.986 habitantes censados en 2022 y proyección de <strong>18,45 millones en 2026</strong>. Autoidentificación étnica: 77,5% mestizos, 7,7% pueblo montubio, 7,7% indígenas (14 nacionalidades y 18 pueblos), 4,8% afroecuatorianos y 2,3% blancos/otros.",
                            "<strong>Idiomas (Art. 2):</strong> El castellano es el idioma oficial; el <strong>castellano, el kichwa y el shuar</strong> son idiomas oficiales de relación intercultural, junto a 14 lenguas ancestrales (Kichwa, Shuar, Achuar, Shiwiar, Wao Terero, A'ingae, Paicoca, Záparo, Katsakati, Awapit, Cha'palaa, Tsa'fiki y Siapedee).",
                            "<strong>Moneda (Art. 303):</strong> Dólar de los Estados Unidos (USD / $) desde enero/marzo de 2000 (Ley Trole I, canje a 25.000 sucres por dólar) tras el Sucre (1884–2000).",
                            "<strong>Símbolos Patrios:</strong> Escudo de Armas (1900, con el volcán Chimborazo, río y vapor <em>Guayas</em>, signos de Aries a Cáncer y el Cóndor Andino), Himno Nacional (<em>¡Salve, oh Patria!</em> de Juan León Mera y Antonio Neumane, 1865–1866), el Cóndor Andino (<em>Vultur gryphus</em>) y el Árbol Nacional de la Quina (<em>Cinchona pubescens</em>, 1936)."
                        ]
                    }
                ]
            },
            {
                id: "2B",
                tituloCorto: "2-B. Historia",
                icono: "fa-landmark-dome",
                tituloCompleto: "2.- B. Estructura y Trayectoria Histórica",
                subtitulo: "Cuna mundial del cacao (3500 a. C.), Real Audiencia de Quito, Emancipación y Hitos Republicanos",
                tarjetas: [
                    {
                        encabezado: "1. Origen Prehispánico y Domesticación del Cacao",
                        badge: "Arqueología INPC / IRD",
                        puntos: [
                            "<strong>Precerámico y Formativo:</strong> Asentamientos tempranos en El Inga, Chobshi, Cubilán y Las Vegas (8000 a. C.). Hacia el 3800 a. C., la cultura <strong>Valdivia</strong> desarrolló la cerámica más antigua de América.",
                            "<strong>Cuna mundial del Cacao (Hace 5.500 años):</strong> En el yacimiento <strong>Santa Ana-La Florida (Palanda, Zamora Chinchipe)</strong>, la cultura <strong>Mayo-Chinchipe-Marañón (ca. 3500 a. C.)</strong> protagonizó la domesticación y uso social más antiguo de <em>Theobroma cacao</em> en el planeta.",
                            "<strong>Señoríos étnicos e Incario:</strong> Destacaron la liga marítima Manteño-Huancavilca (exportadora de concha <em>Spondylus</em>), la orfebrería en platino de La Tolita y los señoríos Caranqui, Quitu, Puruhá y Cañari, integrados al <em>Tahuantinsuyo</em> a fines del siglo XV (Tomebamba, Ingapirca y Quito)."
                        ]
                    },
                    {
                        encabezado: "2. Periodo Colonial y Gesta Emancipadora (1534–1830)",
                        badge: "Quito Luz de América",
                        puntos: [
                            "<strong>Real Audiencia de Quito (1563):</strong> Fundada San Francisco de Quito el 6 de diciembre de 1534 tras la resistencia de Rumiñahui, Felipe II erigió la Real Audiencia en 1563. Destacaron la economía textil de los obrajes y el esplendor barroco de la <strong>Escuela Quiteña de Arte</strong> (Legarda, Caspicara, Miguel de Santiago).",
                            "<strong>Ciclo de Independencia:</strong> Precursorado por Eugenio Espejo, el <strong>10 de agosto de 1809</strong> se instaló en Quito la Primera Junta Soberana de Hispanoamérica (seguida por la inmolación del 2 de agosto de 1810). El ciclo militar triunfó con el 9 de octubre de 1820 en Guayaquil, el 3 de noviembre en Cuenca y la <strong>Batalla de Pichincha el 24 de mayo de 1822</strong> bajo el mariscal Antonio José de Sucre."
                        ]
                    },
                    {
                        encabezado: "3. Cronología de Acontecimientos Republicanos",
                        badge: "20 Constituciones (1830–2008)",
                        puntos: [
                            "• <strong>1845–1857:</strong> Revolución Marcista, manumisión de los esclavos (Urbina, 1852) y abolición del tributo indígena (1857).",
                            "• <strong>1860–1875:</strong> Reunificación autoritaria y educativa de Gabriel García Moreno.",
                            "• <strong>1895–1912:</strong> <strong>Revolución Liberal Alfarista</strong> (Eloy Alfaro): Constitución laica de 1906, educación pública laica, Registro Civil y Ferrocarril Transandino (1908).",
                            "• <strong>1922–1929:</strong> Bautizo de sangre obrero del 15 de noviembre de 1922, <strong>Revolución Juliana (1925)</strong>, creación del Banco Central (1927) y consagración del <strong>voto femenino (1929, pionero en Latinoamérica tras Matilde Hidalgo en 1924)</strong>.",
                            "• <strong>1941–1998:</strong> Protocolo de Río (1942), revuelta de «La Gloriosa» (1944), boom bananero, Reforma Agraria (1964), exportación petrolera estatal (1972), retorno democrático (1979), Levantamiento Indígena (1990) y <strong>Acta de Paz de Brasilia con el Perú (26 de octubre de 1998)</strong>."
                        ]
                    },
                    {
                        encabezado: "4. Personajes Históricos y Sujetos Subalternos",
                        badge: "Memoria Plurinacional",
                        puntos: [
                            "<strong>Próceres, estadistas y científicos:</strong> Pedro Vicente Maldonado, Eugenio Espejo, Manuela Cañizares, Manuela Sáenz, José Joaquín de Olmedo, Vicente Rocafuerte, Gabriel García Moreno, Juan Montalvo, Eloy Alfaro, Matilde Hidalgo de Prócel, Benjamín Carrión y Oswaldo Guayasamín.",
                            "<strong>Líderes indígenas, afrodescendientes y populares:</strong> Alonso de Illescas (cimarronaje esmeraldeño del siglo XVI), Fernando Daquilema y Manuela León (sublevación de Cacha, 1871), las montoneras alfaristas, <strong>Dolores Cacuango y Tránsito Amaguaña</strong> (fundadoras de la FEI en 1944 y de las primeras escuelas bilingües kichwa-castellano en Cayambe) y Monseñor Leonidas Proaño."
                        ]
                    }
                ]
            },
            {
                id: "3C",
                tituloCorto: "3-C. Cultura",
                icono: "fa-masks-theater",
                tituloCompleto: "3.- C. Cultura y Patrimonio Nacional (Material e Inmaterial)",
                subtitulo: "Tradiciones sincréticas, Pasillo y Marimba, Vestimenta y 9 Declaratorias Mundiales de la UNESCO",
                tarjetas: [
                    {
                        encabezado: "1. Tradiciones, Costumbres y Ritos Comunitarios",
                        badge: "Sincretismo Andino-Costero",
                        puntos: [
                            "<strong>Festividades mayores:</strong> El <em>Inti Raymi</em> (solsticio de junio en Imbabura, Pichincha y Cañar con la figura del Aya Huma), la <em>Diablada de Píllaro</em> (Tungurahua), la <em>Mama Negra</em> de Latacunga, el <em>Pase del Niño Viajero</em> en Cuenca y el Rodeo Montubio en el Litoral (12 de octubre).",
                            "<strong>Instituciones cotidianas:</strong> La <strong>Minga</strong> (trabajo comunitario solidario de raíz prehispánica), la <strong>Pambamesa</strong> (mesa comunal igualitaria), el rito del <strong>Día de los Difuntos (2 de noviembre)</strong> con colada morada y guaguas de pan, y la quema de los Años Viejos el 31 de diciembre."
                        ]
                    },
                    {
                        encabezado: "2. Música, Literatura, Arte y Vestimenta",
                        badge: "Identidad Pluricultural",
                        puntos: [
                            "<strong>Sonoridad patrimonial:</strong> El <strong>Pasillo Ecuatoriano</strong> (inmortalizado por Julio Jaramillo), el Sanjuanito, el Albazo, la <strong>Marimba Esmeraldeña</strong> y la <strong>Bomba del Valle del Chota</strong>.",
                            "<strong>Literatura y Plástica:</strong> De la Escuela Quiteña colonial al realismo social de la «Generación del Treinta» (Grupo de Guayaquil y Jorge Icaza con <em>Huasipungo</em>) y el indigenismo plástico de Guayasamín.",
                            "<strong>Vestimenta tradicional:</strong> El pueblo Kichwa Otavalo (poncho azul, pantalón blanco, trenza o <em>simpa</em>, anaco bordado, <em>chumbis</em> y <em>huallcas</em> doradas), el pueblo Saraguro, la Chola Cuencana (paño <em>ikat</em> de Gualaceo y sombrero de paja toquilla) y la nacionalidad Tsáchila (cabello moldeado con achiote)."
                        ]
                    },
                    {
                        encabezado: "3. Patrimonio Material e Inmaterial UNESCO (9 Declaratorias)",
                        badge: "Pionero Mundial UNESCO 1978",
                        puntos: [
                            "<strong>5 Patrimonios Materiales y Naturales Mundiales:</strong> 1) Centro Histórico de Quito (1978, el mejor conservado de Latinoamérica con 375 ha), 2) Islas Galápagos (1978), 3) Parque Nacional Sangay (1983), 4) Centro Histórico de Cuenca (1999) y 5) Sistema Vial Andino <em>Qhapaq Ñan</em> (2014).",
                            "<strong>4 Patrimonios Culturales Inmateriales de la Humanidad:</strong> 1) Patrimonio Oral y Cultural del Pueblo Zápara (2001/2008), 2) Tejido Tradicional del Sombrero de Paja Toquilla Ecuatoriano (2012), 3) Música de Marimba y Cantos Tradicionales de Esmeraldas (2015) y 4) El Pasillo Ecuatoriano (2021)."
                        ]
                    }
                ]
            },
            {
                id: "4D",
                tituloCorto: "4-D. Sociedad",
                icono: "fa-people-group",
                tituloCompleto: "4.- D. Estructura y Dinámica Social",
                subtitulo: "Estratificación, Educación (LOEI/LOES/SEIB), Sistema de Salud y Mercado Laboral (ENEMDU 2026)",
                tarjetas: [
                    {
                        encabezado: "1. Organización Social y 2. Sistema Educativo",
                        badge: "INEC • SENESCYT",
                        puntos: [
                            "<strong>Desigualdad y Hogar:</strong> Coeficiente de Gini de 0,458, tamaño promedio del hogar de 3,2 personas y más del 38% de hogares con jefatura femenina. Las redes comunitarias y las remesas migrantes (>USD 5.400 millones anuales) sostienen la economía familiar.",
                            "<strong>Educación (94,4% alfabetización):</strong> Articulada en Inicial, Educación General Básica (EGB, cobertura neta >93%), Bachillerato General Unificado (BGU) y Educación Superior, junto al Sistema de Educación Intercultural Bilingüe (SEIB) en las 14 lenguas indígenas."
                        ]
                    },
                    {
                        encabezado: "3. Salud Pública, 4. Situación Actual y 5. Desafíos",
                        badge: "MSP • IESS • ENDI",
                        puntos: [
                            "<strong>Sistema de Salud y Esperanza de Vida (77,9 años):</strong> Red Pública integrada por el Ministerio de Salud Pública (MSP, ~60%), el IESS y Seguro Social Campesino (~30%), ISSFA e ISSPOL. El desafío social prioritario es erradicar la <strong>Desnutrición Crónica Infantil (20,1% en menores de 2 años)</strong>.",
                            "<strong>Mercado Laboral y Seguridad:</strong> Conforme al INEC, el desempleo abierto es bajo (3,4%–4,1%), pero solo el <strong>35% de la PEA posee empleo adecuado</strong> y el <strong>53,5% trabaja en la informalidad</strong>. La pobreza por ingresos es del 26,0% y la pobreza multidimensional del 37,5%. El reto contemporáneo más urgente es recuperar la seguridad ciudadana frente al crimen organizado y asegurar la sostenibilidad actuarial del IESS."
                        ]
                    }
                ]
            },
            {
                id: "5E",
                tituloCorto: "5-E. Legislación (2024–2026)",
                icono: "fa-gavel",
                tituloCompleto: "5.- E. Legislación y Política Pública en Debate (Corte 2026)",
                subtitulo: "Ley Orgánica para Enfrentar el Conflicto Armado Interno (IVA 15%), Extradición (Art. 79) y Reformas COOTAD 2026",
                tarjetas: [
                    {
                        encabezado: "1. Identificación, Vigencia y Objetivos de la Norma",
                        badge: "R.O. Suplemento N.º 516 (12 marzo 2024)",
                        puntos: [
                            "<strong>¿Qué establece la ley?:</strong> La <em>Ley Orgánica para Enfrentar el Conflicto Armado Interno, la Crisis Social y Económica</em> elevó la tarifa base del IVA del 12% al 13% y facultó al Presidente de la República a fijarla hasta en el <strong>15% mediante decreto ejecutivo</strong> (vigente desde el 1 de abril de 2024), además de crear contribuciones temporales sobre utilidades de grandes empresas (3,25%) y bancos/cooperativas (5% al 25%) e IVA reducido del 5% a materiales de construcción.",
                            "<strong>¿Cuál era su objetivo y a quiénes afecta?:</strong> Recaudar más de USD 1.300 a 1.500 millones anuales adicionales para financiar a las Fuerzas Armadas y la Policía Nacional tras el Decreto Ejecutivo 111 (9 de enero de 2024) que declaró el conflicto armado interno, reduciendo el déficit fiscal. Afecta transversalmente a los consumidores y al sector corporativo/financiero."
                        ]
                    },
                    {
                        encabezado: "2. Argumentos A Favor vs. Argumentos En Contra",
                        badge: "Debate Constitucional Art. 300",
                        puntos: [
                            "<strong>Argumentos A FAVOR (Postura Oficial):</strong> 1) Sin seguridad estatal en puertos y cárceles no existe reactivación económica posible; 2) Los alimentos agrícolas de la canasta básica, medicamentos, educación, salud y transporte público mantienen <strong>tarifa 0% de IVA</strong>; 3) Evitó la cesación de pagos del Estado y viabilizó el acuerdo con el FMI por USD 4.000 millones.",
                            "<strong>Argumentos EN CONTRA (Crítica Académica y Social):</strong> 1) El IVA es un impuesto indirecto regresivo que encarece los combustibles y la cadena logística frente al principio de progresividad del Art. 300 de la Constitución; 2) Delegar al Ejecutivo la variación de la tasa entre 13% y 15% tensiona el principio de reserva de ley tributaria; 3) Los fondos ingresan a la caja única sin una cuenta auditable exclusiva de defensa."
                        ]
                    },
                    {
                        encabezado: "3. Impacto Medible y Situación Actual en 2026",
                        badge: "Actualización Legislativa 2026",
                        puntos: [
                            "<strong>Consecuencias oficiales (SRI / BCE):</strong> Récord histórico de recaudación tributaria en 2024–2025 (>USD 19.800 millones), equipamiento militar y reducción del déficit fiscal, a costa de una contracción inicial del consumo doméstico en 2024.",
                            "<strong>Situación en 2026 y normas conexas:</strong> En 2026 el IVA se mantiene en el 15% mientras la Corte Constitucional sustancia demandas sobre la discrecionalidad tarifaria. Paralelamente, rige la <strong>Reforma Constitucional del Art. 79 (Referéndum del 21 de abril de 2024)</strong> que permite la <strong>extradición de ecuatorianos</strong> por crimen organizado transnacional, y en 2026 se debate la reforma al <strong>COOTAD</strong> que exige a municipios y prefecturas destinar progresivamente el 65% (2026), 68% (2027) y 70% (2028) de su presupuesto a obras de inversión física."
                        ]
                    }
                ]
            },
            {
                id: "6F",
                tituloCorto: "6-F. Deporte",
                icono: "fa-person-running",
                tituloCompleto: "6.- F. Deporte, Rendimiento Atlético y Juegos Tradicionales",
                subtitulo: "10 Medallas Olímpicas (Atlanta 1996 a París 2024), 5 Mundiales FIFA y el Ecuavóley como Deporte Nacional",
                tarjetas: [
                    {
                        encabezado: "1. Leyendas Históricas y 2. Las 10 Medallas Olímpicas",
                        badge: "COI • COE (1996–2024)",
                        puntos: [
                            "<strong>Pioneros mundiales:</strong> <strong>Jefferson Pérez</strong> (Oro olímpico en Atlanta 1996, Plata en Beijing 2008 y tricampeón mundial de 20 km marcha en 2003, 2005 y 2007), <strong>Andrés Gómez</strong> (campeón de Roland Garros 1990), Pancho Segura y <strong>Alberto Spencer</strong> (máximo goleador histórico de la Copa Libertadores con 54 tantos).",
                            "<strong>Explosión Olímpica en Tokio 2020 y París 2024:</strong> En Tokio 2020 ganaron Oro <strong>Richard Carapaz</strong> (ciclismo de ruta) y <strong>Neisi Dajomes</strong> (halterofilia, primera mujer ecuatoriana campeona olímpica) y Plata <strong>Tamara Salazar</strong>. En París 2024 el Ecuador sumó 5 medallas: Oro de <strong>Brian Daniel Pintado</strong> (20 km marcha), Plata de <strong>Pintado y Glenda Morejón</strong> (relevo mixto marcha), Plata de <strong>Lucía «La Tigra» Yépez</strong> (lucha libre 53 kg) y Bronces de <strong>Angie Palacios</strong> y <strong>Neisi Dajomes</strong> (halterofilia), además de los oros paralímpicos de <strong>Kiara Rodríguez</strong> y <strong>Poleth Méndes</strong>."
                        ]
                    },
                    {
                        encabezado: "3. Biotipos, Altitud, Fútbol y 5. El Ecuavóley",
                        badge: "Fisiología Andina & Identidad",
                        puntos: [
                            "<strong>Ventaja fisiológica de altitud:</strong> El entrenamiento en hipoxia natural en Azuay, Carchi y Pichincha (2.500–3.500 m s. n. m.) eleva la masa de hemoglobina y el consumo máximo de oxígeno, potenciando la marcha y el ciclismo (Carapaz ganador del Giro de Italia 2019 y podio en Tour y Vuelta), mientras el biotipo de Pastaza, Esmeraldas, Chota y Guayas destaca en potencia neuromuscular.",
                            "<strong>Fútbol de élite:</strong> 5 clasificaciones de la Selección a Mundiales FIFA (2002, 2006, 2014, 2022 y 2026), títulos continentales de LDU Quito e Independiente del Valle, y figuras en Europa como Moisés Caicedo, Willian Pacho y Piero Hincapié.",
                            "<strong>Deportes Tradicionales:</strong> El <strong>Ecuavóley</strong> (creación nacional jugada 3 contra 3 con red a 2,85 m y balón Mikasa FT-5), la <strong>Pelota Nacional</strong> (guante y chaza en la Sierra norte) y el Rodeo Montubio."
                        ]
                    }
                ]
            },
            {
                id: "7G",
                tituloCorto: "7-G. Ciencia y Tecnología",
                icono: "fa-microscope",
                tituloCompleto: "7.- G. Desarrollo Científico, Tecnológico y de Innovación (CTI)",
                subtitulo: "Estudio del Síndrome de Laron, el Unicornio Kushki, el Submarino Hipopótamo (1838) y Universidades Líderes",
                tarjetas: [
                    {
                        encabezado: "1. Ciencia, Medicina (Síndrome de Laron) e Ingeniería",
                        badge: "SCImago • SENESCYT • IGEPN",
                        puntos: [
                            "<strong>Producción científica indexada:</strong> El país pasó de menos de 500 artículos en 2010 a superar los <strong>6.500–7.500 documentos anuales en Scopus</strong> en 2022–2025, destacando en Biodiversidad, Biología Evolutiva, Vulcanología y Medicina Tropical.",
                            "<strong>Hito biomédico mundial (Síndrome de Laron):</strong> Las investigaciones del Dr. Jaime Guevara Aguirre en poblaciones de Loja y El Oro con mutación en el receptor de la hormona de crecimiento demostraron resistencia genética casi absoluta al cáncer y la diabetes tipo 2.",
                            "<strong>Ingeniería de alta complejidad:</strong> Complejos hidroeléctricos Paute Integral y Coca Codo Sinclair (1.500 MW), Parque Eólico Villonaco en Loja (a 2.720 m s. n. m.), Metro subterráneo de Quito y acuicultura de precisión con IA hidroacústica."
                        ]
                    },
                    {
                        encabezado: "2. Startups (Kushki), Descubrimientos y Universidades",
                        badge: "Innovación & Historia de la Ciencia",
                        puntos: [
                            "<strong>Primer Unicornio Tecnológico:</strong> La plataforma de infraestructura de pagos <strong>Kushki</strong> (fundada por ecuatorianos) superó los USD 1.500 millones de valoración, acompañada por Fintechs como Payphone y Peigo, Jelou (IA) y la incubadora <strong>Prendho (UTPL)</strong>.",
                            "<strong>Descubrimientos históricos globales:</strong> 1) La forma real achatada de la Tierra y base del Metro en la Misión Geodésica con Pedro Vicente Maldonado (1736); 2) La <strong>Quina de Loja</strong> contra la malaria (siglo XVII); 3) La evidencia evolutiva de Darwin en Galápagos (1835); y 4) El <strong>submarino «Hipopótamo»</strong> construido y sumergido por José Rodríguez Labandera en el río Guayas el 18 de septiembre de 1838 (primero de América Latina).",
                            "<strong>Universidades líderes e Innovación Social:</strong> USFQ, ESPOL, EPN, PUCE, UCE, Universidad de Cuenca y UTPL; destacan el monitoreo amazónico con drones por guardias indígenas Cofán y Waorani y las prótesis biónicas impresas en 3D."
                        ]
                    }
                ]
            },
            {
                id: "8H",
                tituloCorto: "8-H. Economía",
                icono: "fa-chart-column",
                tituloCompleto: "8.- H. Estructura y Dinámica Económica",
                subtitulo: "Cuentas Nacionales BCE, Liderazgo en Cacao y Camarón, Consulta del Yasuní, Bono Azul y Comercio Exterior",
                tarjetas: [
                    {
                        encabezado: "1. Matriz Productiva, Exportaciones y Recursos Naturales",
                        badge: "BCE • FEDEXPOR • ICCO",
                        puntos: [
                            "<strong>Composición del PIB (USD 121.800 millones):</strong> Sector Servicios (~57%), Industria Manufacturera y Construcción (~23,5%) y Sector Primario Agropecuario/Extractivo (~19,5%).",
                            "<strong>Potencia exportadora (>USD 31.500 M FOB):</strong> 1.º Petróleo crudo (~USD 8.600 M), 2.º Camarón blanco (~USD 6.950 M, N.º 1 mundial), 3.º Banano (~USD 3.650 M, N.º 1 mundial), 4.º <strong>Cacao en grano y elaborados (~USD 3.200 M, N.º 1 mundial en cacao fino de aroma con 62% del mercado global)</strong> y 5.º Concentrados de oro y cobre (~USD 3.150 M).",
                            "<strong>Democracia Ambiental (Yasuní-ITT):</strong> En agosto de 2023 el 59% de los ecuatorianos votó en consulta popular detener la explotación petrolera en el Bloque 43 del Parque Nacional Yasuní en aplicación de los Derechos de la Naturaleza (Arts. 71–74)."
                        ]
                    },
                    {
                        encabezado: "2. Innovación Financiera (Bono Azul) y Socios Comerciales",
                        badge: "TLC China 2024 • Acuerdo UE",
                        puntos: [
                            "<strong>Canje de Deuda por Naturaleza de Galápagos (2023):</strong> Mayor operación mundial de su tipo; recompró USD 1.628 millones de deuda por USD 656 millones, ahorrando más de USD 1.100 millones al Estado y destinando USD 450 millones a conservar las reservas marinas.",
                            "<strong>Principales socios y bloques comerciales:</strong> Estados Unidos, China (con Tratado de Libre Comercio vigente desde mayo de 2024, primer destino del camarón) y la Unión Europea (Acuerdo Multipartes desde 2017), además de ser miembro fundador de la Comunidad Andina (CAN, 1969)."
                        ]
                    }
                ]
            },
            {
                id: "11K",
                tituloCorto: "11-K. Conclusiones",
                icono: "fa-lightbulb",
                tituloCompleto: "11.- K. Conclusiones y Lecciones Aprendidas: ¿Qué podemos aprender del Ecuador?",
                subtitulo: "Síntesis filosófica, aportes al constitucionalismo global y prospectiva estratégica 2026–2035",
                tarjetas: [
                    {
                        encabezado: "1. Tres Lecciones Globales del Caso Ecuatoriano",
                        badge: "Análisis Comparado",
                        puntos: [
                            "<strong>Lección Sociocultural (Plurinacionalidad sin fragmentación):</strong> El Ecuador demuestra que reconocer constitucionalmente a 14 nacionalidades indígenas, al pueblo afroecuatoriano y al pueblo montubio fortalece la cohesión democrática, apoyado en instituciones solidarias como la <em>minga</em>.",
                            "<strong>Lección Jurídico-Ecológica (Derechos de la Naturaleza):</strong> Al consagrar en 2008 a la <em>Pachamama</em> como sujeto de derechos (Arts. 71–74), el Ecuador inauguró el constitucionalismo biocéntrico mundial.",
                            "<strong>Lección Macroeconómica (Dolarización y Finanzas Verdes):</strong> Más de 25 años de dolarización enseñan que una moneda fuerte erradica la hiperinflación, pero exige productividad, superávit comercial e innovación como el Bono Azul de Galápagos."
                        ]
                    },
                    {
                        encabezado: "2. Visión Prospectiva 2026–2035: «La Pequeña Gran Nación»",
                        badge: "Tesis de Benjamín Carrión",
                        puntos: [
                            "<strong>Imperativos hacia 2035:</strong> 1) Pacificación ciudadana y desarticulación del crimen transnacional en puertos; 2) Diversificación energética solar, eólica y geotérmica para superar los estiajes hidroeléctricos; 3) Formalización laboral y solvencia del IESS; y 4) Erradicación de la Desnutrición Crónica Infantil.",
                            "<strong>Síntesis final para el Jurado:</strong> El Ecuador confirma la vocación de ser una «Pequeña Gran Nación» cuya grandeza radica en su densidad biocultural, ética y científica en la mitad del mundo."
                        ]
                    }
                ]
            }
        ];

        let seccionActivaId = "1A";

        function renderizarTabsInforme() {
            const navTabs = document.getElementById('tabs-secciones');
            navTabs.innerHTML = seccionesInforme.map(sec => {
                const activa = sec.id === seccionActivaId;
                return `
                    <button onclick="cambiarSeccionInforme('${sec.id}')" 
                            class="min-h-[44px] px-4 py-2.5 rounded-xl font-titulo font-bold text-xs whitespace-nowrap transition flex items-center gap-2 border ${activa ? 'bg-slate-900 text-yellow-400 border-slate-900 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}">
                        <i class="fa-solid ${sec.icono}"></i>
                        <span>${sec.tituloCorto}</span>
                    </button>
                `;
            }).join('');
        }

        function cambiarSeccionInforme(id) {
            reproducirSonido('clic');
            seccionActivaId = id;
            document.getElementById('buscador-informe').value = '';
            renderizarTabsInforme();
            const sec = seccionesInforme.find(s => s.id === id);
            renderizarTarjetasSeccion([sec]);
        }

        function renderizarTarjetasSeccion(listaSecciones) {
            const contenedor = document.getElementById('contenedor-seccion-activa');
            if (!listaSecciones || listaSecciones.length === 0) {
                contenedor.innerHTML = `<p class="text-center text-slate-500 py-8">No se encontraron coincidencias para ese término en el informe.</p>`;
                return;
            }

            contenedor.innerHTML = listaSecciones.map(sec => `
                <div class="mb-8 last:mb-0">
                    <div class="border-b border-slate-200 pb-4 mb-6">
                        <h3 class="font-titulo text-xl sm:text-2xl font-black text-slate-900">${sec.tituloCompleto}</h3>
                        <p class="text-xs sm:text-sm text-slate-500 mt-1">${sec.subtitulo}</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${sec.tarjetas.map(t => `
                            <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-blue-400 transition flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between gap-2 mb-3">
                                        <h4 class="font-titulo font-bold text-base text-slate-900">${t.encabezado}</h4>
                                        <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[11px] shrink-0">${t.badge}</span>
                                    </div>
                                    <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                                        ${t.puntos.map(p => `<li class="flex items-start gap-2"><i class="fa-solid fa-circle-check text-emerald-600 mt-1 shrink-0 text-xs"></i><span>${p}</span></li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        function filtrarContenidoInforme(termino) {
            const q = termino.trim().toLowerCase();
            if (!q) {
                const sec = seccionesInforme.find(s => s.id === seccionActivaId);
                renderizarTarjetasSeccion([sec]);
                return;
            }
            const filtradas = seccionesInforme.map(sec => {
                const tarjetasCoincidentes = sec.tarjetas.filter(t =>
                    t.encabezado.toLowerCase().includes(q) ||
                    t.badge.toLowerCase().includes(q) ||
                    t.puntos.some(p => p.toLowerCase().includes(q))
                );
                if (sec.tituloCompleto.toLowerCase().includes(q) || tarjetasCoincidentes.length > 0) {
                    return { ...sec, tarjetas: tarjetasCoincidentes.length > 0 ? tarjetasCoincidentes : sec.tarjetas };
                }
                return null;
            }).filter(Boolean);

            renderizarTarjetasSeccion(filtradas);
        }

        /* ========================================================================
           D. DATOS Y RENDERIZADO DE LAS 3 FLIP-CARDS 3D DE ARTE CULINARIO (10-J)
           ======================================================================== */
        const platosGourmet = [
            {
                id: "patacones",
                nombre: "Patacones Crujientes de Plátano Verde",
                region: "Región Costa y Subtrópico (Patrimonio Manabita 2018)",
                etiqueta: "Plato Gourmet Sólido",
                colorGradiente: "from-amber-500 to-yellow-600",
                foto: "media/sabor-patacones.jpg",
                fotoAlt: "Patacones de plátano verde",
                resumenFrontal: "Obra de ingeniería culinaria popular del Pacífico ecuatorial basada en el plátano Barraganete (Musa AAB) en Grado 1 de maduración (>22% almidón), transformado mediante doble fritura y majado mecánico en caliente.",
                puntosReverso: [
                    "<strong>Etimología:</strong> Del árabe <em>batakká</em> e italiano <em>patacca</em> (monedas coloniales de plata de 8 reales).",
                    "<strong>1.ª Fritura (155 °C, 4–5 min):</strong> Gelatiniza los gránulos de almidón internos sin dorar la corteza.",
                    "<strong>Majado en caliente (>65 °C):</strong> Golpe vertical en piedra o pataconera antes de que el almidón sufra retrogradación.",
                    "<strong>2.ª Fritura (185 °C, 60–90 s):</strong> Choque térmico que evapora el agua y crea una corteza vítrea Maillard."
                ],
                fichaCompleta: {
                    origen: "Fusión cuádruple: especie asiática (Musa × paradisiaca llegada en el s. XVI), técnica africana del golfo de Guinea de majar en caliente, grasas hispánicas y piedras de moler prehispánicas Valdivia/Manteño-Huancavilca. Declarado parte del Patrimonio Cultural Inmaterial de la Cocina Manabita (INPC, 17 de octubre de 2018).",
                    ingredientes: "Plátano verde clon «Barraganete» cosechado en el Triángulo de Oro (El Carmen, Santo Domingo y Los Ríos) con 32%–35% de materia seca; manteca de cerdo criollo o aceite vegetal (>210 °C punto de humo); sal marina en grano de Charapotó o Santa Elena; ajo machacado; queso fresco manabita y salprieta.",
                    pasoAPaso: "1) Pelado en seco por incisión en las aristas y corte de cilindros de 3,0 a 3,5 cm; 2) Blanqueo en grasa a 155 °C por 4–5 min hasta tono amarillo traslúcido; 3) Majado inmediato en caliente (>65 °C) a discos de 0,6–0,8 cm con bordes estrellados; 4) Rocío rápido con agua fría de sal y ajo; 5) Segunda fritura a 185 °C por 60–90 segundos hasta dorado ámbar crujiente.",
                    sensorial: "Bimodalidad mecánica: corteza exterior crujiente (~1,5 mm) y centro húmedo y tierno. Servir de inmediato entre 65 °C y 72 °C acompañado de queso manabita, salprieta (maní y maíz tostados con achiote) y ají criollo."
                }
            },
            {
                id: "morocho",
                nombre: "El Morocho Ecuatoriano (Dulce de Leche y Especias)",
                region: "Región Sierra Interandina y Guayaquil",
                etiqueta: "Bebida-Alimento Ancestral",
                colorGradiente: "from-blue-700 to-indigo-900",
                foto: "media/sabor-morocho.jpg",
                fotoAlt: "Morocho dulce de maíz y leche",
                resumenFrontal: "Emulsión láctea y amilácea de origen prehispánico (maíz kichwa muruchu) mestizada en los conventos coloniales de Quito y Cuenca con leche entera andina, caña de azúcar y especias orientales y amazónicas.",
                puntosReverso: [
                    "<strong>Maíz Muruchu:</strong> Grano andino duro partido (2–4 mm) que conserva su polvillo de almidón natural como espesante.",
                    "<strong>Remojo pasivo (12 horas):</strong> Hidrata por capilaridad la matriz proteica de zeína del maíz duro.",
                    "<strong>Secreto científico:</strong> Hervir primero 90–120 min <strong>solo en agua con especias</strong> (el calcio de la leche desde crudo impermeabiliza el grano e impide que ablande).",
                    "<strong>Emulsión láctea (85–90 °C):</strong> Reducción lenta con leche entera, crema, azúcar o panela, pasas e <em>ishpingo</em>."
                ],
                fichaCompleta: {
                    origen: "Del vocablo kichwa muruchu (maíz duro de resistencia cultivado entre 2.200 y 3.000 m s. n. m.). En el Tahuantinsuyo se tomaba como mazamorra energética en agua (api); en la Colonia los monasterios de Santa Clara y La Concepción incorporaron leche bovina, azúcar/panela y especias.",
                    ingredientes: "500 g de maíz morocho blanco partido (conservando su almidón fino), 2 litros de leche entera fresca de Machachi o Cayambe, 100 ml de crema de leche, 250 g de azúcar o panela granulada de Pacto, pasas, canela en rama, clavo de olor, pimienta dulce, anís estrellado e ishpingo (flor de canela amazónica, Ocotea quixos).",
                    pasoAPaso: "1) Lavar ligeramente sin perder el almidón fino y remojar 12 horas en 2 L de agua fría; 2) Cocinar en el agua de remojo con las especias durante 90–120 min (o 35 min a presión) hasta ablandar el grano; 3) Retirar especias y verter la leche caliente batiendo con cuchara de palo por 30–40 min a 85 °C–90 °C; 4) Añadir azúcar/panela, crema, pizca de sal y pasas.",
                    sensorial: "Aroma cálido de aldehído cinámico y eugenol; textura líquida aterciopelada con fragmentos perlados tiernos de maíz. Servir caliente entre 70 °C y 75 °C espolvoreado con canela, maridando por contraste dulce-salado con empanadas de viento o pan de yuca."
                }
            },
            {
                id: "maracuya",
                nombre: "El Jugo de Maracuyá Fresco Ecuatoriano",
                region: "Litoral, Valles Subtropicales y Nacional",
                etiqueta: "Néctar Frutal Tropical",
                colorGradiente: "from-emerald-600 to-teal-800",
                foto: "media/sabor-maracuya.jpg",
                fotoAlt: "Jugo de maracuyá",
                resumenFrontal: "El refresco insignia de la comensalidad ecuatoriana elaborado con Passiflora edulis f. flavicarpa (clon INIAP-2009), reconocido mundialmente por su alta concentración de ésteres aromáticos y acidez cítrica brillante.",
                puntosReverso: [
                    "<strong>Selección Grado 5:</strong> Frutos amarillos pesados con cáscara ligeramente arrugada (14° a 16° Brix internos).",
                    "<strong>Extracción sin raspar el albedo:</strong> Se retiran los arilos anaranjados sin raspar la capa blanca interna (rica en pectinas astringentes).",
                    "<strong>Punto crítico (Pulsos de 2 s):</strong> Licuar en frío mediante 3–4 pulsos de 2 segundos para no triturar la semilla negra.",
                    "<strong>Balance sensorial:</strong> Estandarizado a 11°–12° Brix y pH 3,0–3,3, servido entre 4 °C y 7 °C."
                ],
                fichaCompleta: {
                    origen: "Nativo de América tropical (del guaraní mburukuja y llamado «Fruta de la Pasión» por los misioneros del s. XVI). Ecuador posee decenas de pasifloras nativas (granadilla, taxo, badea, gullán) y es hoy uno de los primeros exportadores mundiales de concentrado de maracuyá hacia la UE y EE. UU.",
                    ingredientes: "6 a 8 frutos de maracuyá amarillo ecuatoriano (variedad INIAP-2009 o Criollo en Grado 5 de madurez), 1 litro de agua purificada de manantial andino, 120 a 150 g de azúcar de caña o panela orgánica y hielo cristalino.",
                    pasoAPaso: "1) Lavar frutos, cortar por el ecuador y extraer los sacos de arilos sin raspar el mesocarpio blanco; 2) Colocar en licuadora con 500 ml de agua fría y pulsar 3 a 4 veces por 2 segundos (velocidad mínima) para soltar el jugo sin fracturar la testa negra de las semillas (que liberaría ácidos grasos oxidables y polifenoles amargos); 3) Tamizar en colador fino; 4) Completar agua y endulzar.",
                    sensorial: "Color amarillo oro por sus carotenoides naturales, aroma explosivo a ésteres de hexilo y butanoato de etilo, y acidez refrescante que limpia el paladar y corta la grasa de los patacones, bolones, ceviches y encocados."
                }
            }
        ];

        function alternarTarjetaSabores(tarjeta) {
            const abierta = tarjeta.classList.toggle('volteada');
            const frente = tarjeta.querySelector('.flip-card-front');
            const reverso = tarjeta.querySelector('.flip-card-back');
            if (frente) frente.toggleAttribute('inert', abierta);
            if (reverso) reverso.toggleAttribute('inert', !abierta);
            reproducirSonido('clic');
        }

        function renderizarFlipCardsGastronomia() {
            const contenedor = document.getElementById('contenedor-flip-cards');
            contenedor.innerHTML = platosGourmet.map(plato => `
                <div class="flip-card" onclick="if(!event.target.closest('button')) alternarTarjetaSabores(this)">
                    <div class="flip-card-inner">
                        <!-- CARA FRONTAL -->
                        <div class="flip-card-front flex flex-col justify-between">
                            <div>
                                <div class="sabor-hero">
                                    <img src="${plato.foto}" alt="${plato.fotoAlt}" class="sabor-foto" loading="lazy" width="640" height="400">
                                    <div class="sabor-hero-overlay">
                                        <span class="sabor-badge">${plato.etiqueta}</span>
                                        <h3 class="font-titulo font-black text-lg sm:text-xl leading-snug text-white">${plato.nombre}</h3>
                                        <p class="text-xs text-white/90 mt-1"><i class="fa-solid fa-location-dot mr-1" aria-hidden="true"></i>${plato.region}</p>
                                    </div>
                                </div>
                                <div class="p-4 sm:p-5">
                                    <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${plato.resumenFrontal}</p>
                                </div>
                            </div>
                            <div class="px-4 sm:px-5 pb-4 flex items-center justify-between gap-2 text-xs font-bold text-blue-700 border-t border-slate-100 pt-3">
                                <button type="button" class="min-h-[44px] px-3 rounded-lg bg-blue-50 text-blue-800" onclick="event.stopPropagation(); alternarTarjetaSabores(this.closest('.flip-card'))"><i class="fa-solid fa-rotate mr-1" aria-hidden="true"></i> Voltear ficha</button>
                                <span class="px-2 py-0.5 rounded bg-yellow-100 text-amber-900">INPC / INIAP</span>
                            </div>
                        </div>

                        <!-- CARA TRASERA (REVERSO CIENTÍFICO) -->
                        <div class="flip-card-back" inert>
                            <div>
                                <div class="flex items-center justify-between border-b border-slate-700 pb-2.5 mb-3">
                                    <span class="text-xs font-bold uppercase text-yellow-400">Ingeniería Culinaria</span>
                                    <span class="text-[11px] text-slate-300">Sección 10.- J</span>
                                </div>
                                <h4 class="font-titulo font-bold text-base text-white mb-3">${plato.nombre}</h4>
                                <ul class="space-y-2 text-xs text-slate-200 leading-relaxed">
                                    ${plato.puntosReverso.map(p => `<li class="flex items-start gap-2"><i class="fa-solid fa-check text-yellow-400 mt-1"></i><span>${p}</span></li>`).join('')}
                                </ul>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <button type="button" onclick="event.stopPropagation(); alternarTarjetaSabores(this.closest('.flip-card'))" class="min-h-[44px] rounded-xl bg-slate-800 text-white font-bold text-xs">Volver</button>
                                <button type="button" onclick="event.stopPropagation(); abrirModalCulinario('${plato.id}')" class="min-h-[44px] rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-titulo font-extrabold text-xs transition">Ver ficha</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function abrirModalCulinario(idPlato) {
            reproducirSonido('clic');
            const plato = platosGourmet.find(p => p.id === idPlato);
            if (!plato) return;
            recordarFoco();
            const modal = document.getElementById('modal-ficha-culinaria');
            const caja = document.getElementById('contenido-modal-culinario');
            caja.innerHTML = `
                <span class="px-3 py-1 rounded-full bg-yellow-100 text-amber-900 font-bold text-xs uppercase">${plato.etiqueta} • ${plato.region}</span>
                <h3 class="font-titulo font-black text-2xl sm:text-3xl text-slate-900 mt-2">${plato.nombre}</h3>
                ${plato.foto ? `<img src="${plato.foto}" alt="${plato.fotoAlt || plato.nombre}" class="mt-4 w-full max-h-56 object-cover rounded-2xl border border-slate-200" loading="lazy">` : ''}
                <div class="mt-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <strong class="text-slate-900 block mb-1"><i class="fa-solid fa-scroll text-blue-700 mr-1.5"></i>1. Origen Histórico y Sincretismo Cultural:</strong>
                        <p>${plato.fichaCompleta.origen}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <strong class="text-slate-900 block mb-1"><i class="fa-solid fa-seedling text-emerald-700 mr-1.5"></i>2. Ingredientes Endógenos y Selección Técnica (INIAP):</strong>
                        <p>${plato.fichaCompleta.ingredientes}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <strong class="text-slate-900 block mb-1"><i class="fa-solid fa-fire-burner text-amber-600 mr-1.5"></i>3. Método de Cocción y Paso a Paso Operativo:</strong>
                        <p>${plato.fichaCompleta.pasoAPaso}</p>
                    </div>
                    <div class="bg-blue-950 text-white p-4 rounded-2xl border-l-4 border-yellow-400">
                        <strong class="text-yellow-400 block mb-1"><i class="fa-solid fa-utensils mr-1.5"></i>4. Análisis Sensorial, Temperatura y Maridaje:</strong>
                        <p>${plato.fichaCompleta.sensorial}</p>
                    </div>
                </div>
            `;
            modal.classList.remove('oculto');
            sincronizarScrollModal();
            const cierre = modal.querySelector('button');
            if (cierre) cierre.focus();
        }

        function cerrarModalCulinario() {
            const modal = document.getElementById('modal-ficha-culinaria');
            if (!modal || modal.classList.contains('oculto')) return;
            modal.classList.add('oculto');
            sincronizarScrollModal();
            restaurarFoco();
        }

        /* ========================================================================
           E. ZONA ARCADE — LAS 4 MODALIDADES DE JUEGO INTERACTIVO
           ======================================================================== */
        function cambiarJuegoArcade(modo) {
            reproducirSonido('clic');
            const modos = ['trivia', 'memorama', 'ruta', 'regiones'];
            modos.forEach(m => {
                const vista = document.getElementById(`juego-vista-${m}`);
                const tab = document.getElementById(`tab-juego-${m}`);
                if (vista) vista.classList.toggle('oculto', m !== modo);
                if (tab) {
                    tab.classList.toggle('is-active', m === modo);
                    tab.setAttribute('aria-selected', m === modo ? 'true' : 'false');
                }
            });
            if (modo === 'ruta') iniciarJuegoRuta();
        }

        /* ------------------------------------------------------------------------
           JUEGO 1: TRIVIA ACADÉMICA «DESAFÍO EQUINOCCIAL» (10 PREGUNTAS)
           ------------------------------------------------------------------------ */
        const bancoPreguntasTrivia = [
            {
                pregunta: "1. Según la arqueología oficial (INPC / IRD de Francia), ¿qué hito mundial ocurrió hace 5.500 años (ca. 3500 a. C.) en el sitio Santa Ana-La Florida (Palanda, Zamora Chinchipe)?",
                opciones: [
                    "La domesticación y uso social más antiguo del cacao (Theobroma cacao) en el planeta por la cultura Mayo-Chinchipe",
                    "La construcción del primer observatorio incaico de piedra almohadillada",
                    "La llegada de las primeras semillas de plátano Barraganete desde Asia",
                    "La firma del primer tratado comercial con Mesoamérica"
                ],
                correcta: 0,
                explicacion: "En Santa Ana-La Florida (Palanda), estudios publicados en Nature Ecology & Evolution (Zarrillo, Valdez et al., 2018) demostraron la domesticación del cacao hace 5.500 años."
            },
            {
                pregunta: "2. ¿Por qué la cumbre del volcán ecuatoriano Chimborazo (6.263,47 m s. n. m.) ostenta un récord geodésico mundial frente al monte Everest?",
                opciones: [
                    "Porque tiene el cráter activo de mayor diámetro del continente",
                    "Porque debido al abultamiento ecuatorial es el punto más alejado del centro de la Tierra (6.384,416 km, superando por 2.168 m al Everest)",
                    "Porque es el único glaciar ubicado exactamente en el nivel del mar",
                    "Porque fue medido utilizando radares submarinos"
                ],
                correcta: 1,
                explicacion: "La Misión Geodésica franco-ecuatoriana (IGM/IRD, 2016) certificó que la cumbre del Chimborazo se encuentra a 6.384,416 km del centro terrestre, superando por 2.168 metros al Everest."
            },
            {
                pregunta: "3. Conforme al Artículo 2 de la Constitución de la República del Ecuador (2008), ¿cuáles son los idiomas oficiales de relación intercultural en todo el país?",
                opciones: [
                    "Únicamente el castellano y el inglés comercial",
                    "El castellano, el kichwa y el shuar (además del uso oficial de las demás lenguas ancestrales en sus territorios)",
                    "El quechua cuzqueño, el guaraní y el aimara",
                    "El castellano y el latín protocolar"
                ],
                correcta: 1,
                explicacion: "El Art. 2 de la Constitución establece que el castellano es el idioma oficial, y el castellano, el kichwa y el shuar son idiomas oficiales de relación intercultural."
            },
            {
                pregunta: "4. En la ingeniería culinaria de los Patacones Crujientes de plátano verde Barraganete, ¿cuál es el fundamento técnico de la doble fritura?",
                opciones: [
                    "Freír dos veces a 90 °C en agua con azúcar",
                    "1.ª fritura a 155 °C para gelatinizar el almidón interno, majado en caliente (>65 °C) y 2.ª fritura a 185 °C para crear la corteza crujiente",
                    "Hornear el plátano maduro y luego congelarlo",
                    "Licuar el plátano verde crudo antes de freír"
                ],
                correcta: 1,
                explicacion: "La 1.ª fritura (155 °C) gelatiniza el almidón para permitir el aplastado en caliente sin quebrarse, y la 2.ª fritura (185 °C) deshidrata la corteza por reacción de Maillard."
            },
            {
                pregunta: "5. Al preparar El Morocho dulce ecuatoriano, ¿por qué el grano partido debe hervir primero únicamente en agua con especias antes de incorporar la leche?",
                opciones: [
                    "Porque el calcio y las proteínas de la leche desde crudo impermeabilizan la pared celular del grano e impiden su ablandamiento",
                    "Para que el maíz cambie su color blanco a morado oscuro",
                    "Porque la leche se evapora por completo a los 40 °C",
                    "Para evitar añadir canela o clavo de olor"
                ],
                correcta: 0,
                explicacion: "El endospermo córneo del maíz muruchu requiere gelatinizarse primero en medio acuoso; si se hierve desde crudo en leche, el calcio impermeabiliza el pericarpio."
            },
            {
                pregunta: "6. En la preparación técnica del Jugo de Maracuyá fresco (INIAP-2009), ¿por qué se licúa en frío mediante pulsos breves de apenas 2 segundos?",
                opciones: [
                    "Para ahorrar energía eléctrica en la cocina",
                    "Para calentar el jugo hasta los 85 °C mediante fricción",
                    "Para desprender el arilo jugoso sin triturar las semillas negras, evitando liberar polifenoles amargos y lípidos oxidables",
                    "Para pulverizar por completo la cáscara amarilla externa"
                ],
                correcta: 2,
                explicacion: "Licuar por pulsos de 2 segundos separa la membrana jugosa sin romper la testa negra de la semilla, preservando el aroma limpio y evitando el amargor."
            },
            {
                pregunta: "7. ¿Qué estableció la Ley Orgánica para Enfrentar el Conflicto Armado Interno (promulgada en marzo de 2024 y vigente en 2026) en materia tributaria?",
                opciones: [
                    "La eliminación total de los impuestos aduaneros y el retorno al Sucre",
                    "El incremento del IVA del 12% al 13% base y hasta el 15% mediante decreto ejecutivo, más contribuciones de seguridad a bancos y grandes empresas",
                    "La prohibición de exportar petróleo y camarón",
                    "Un impuesto único del 50% a los alimentos agrícolas de la canasta básica"
                ],
                correcta: 1,
                explicacion: "La ley publicada en el R.O. 516 fijó la subida del IVA al 15% y creó contribuciones temporales sobre utilidades corporativas y bancarias para financiar la seguridad."
            },
            {
                pregunta: "8. ¿Cuántas medallas olímpicas suma el Ecuador en su historia hasta París 2024 y quiénes ganaron sus 4 medallas de ORO?",
                opciones: [
                    "5 medallas en total, todas en natación",
                    "10 medallas olímpicas en total (4 de Oro: Jefferson Pérez en 1996, Richard Carapaz en 2021, Neisi Dajomes en 2021 y Brian Pintado en 2024)",
                    "2 medallas de bronce en fútbol masculino",
                    "15 medallas en deportes de invierno"
                ],
                correcta: 1,
                explicacion: "Ecuador registra 10 preseas olímpicas (4 oros, 4 platas y 2 bronces), con oros de Jefferson Pérez, Richard Carapaz, Neisi Dajomes y Brian Daniel Pintado."
            },
            {
                pregunta: "9. ¿Qué descubrimiento biomédico de alcance mundial lideró el Dr. Jaime Guevara Aguirre en poblaciones de las provincias ecuatorianas de Loja y El Oro?",
                opciones: [
                    "Que los pacientes con Síndrome de Laron presentan resistencia genética casi absoluta al cáncer y a la diabetes tipo 2",
                    "La primera vacuna sintética contra la fiebre amarilla",
                    "El aislamiento de la penicilina en líquenes del volcán Cotopaxi",
                    "El reemplazo de la corteza de la Quina por agua termal"
                ],
                correcta: 0,
                explicacion: "El estudio de la cohorte ecuatoriana con deficiencia del receptor de la hormona del crecimiento (Síndrome de Laron) revolucionó la ciencia mundial sobre longevidad y cáncer."
            },
            {
                pregunta: "10. En el plano jurídico-ambiental y financiero, ¿por qué la Constitución de 2008 y el «Bono Azul de Galápagos» (2023) son referentes mundiales?",
                opciones: [
                    "Porque privatizaron todos los parques nacionales del país",
                    "Porque Ecuador fue el 1.er país del mundo en reconocer Derechos a la Naturaleza (Arts. 71–74) y ejecutó el mayor Canje de Deuda por Conservación Marina de la historia",
                    "Porque autorizaron la pesca industrial dentro de las islas Galápagos",
                    "Porque eliminaron el Ministerio del Ambiente"
                ],
                correcta: 1,
                explicacion: "Ecuador inauguró en 2008 el constitucionalismo biocéntrico (Derechos de la Naturaleza) y en 2023 ahorró más de USD 1.100 millones en deuda externa con el Bono Azul de Galápagos."
            }
        ];

        let indiceTrivia = 0;
        let puntajeTrivia = 0;
        let rachaTrivia = 0;
        let triviaRespondida = false;

        function iniciarTrivia() {
            indiceTrivia = 0;
            puntajeTrivia = 0;
            rachaTrivia = 0;
            triviaRespondida = false;
            renderizarPreguntaTrivia();
        }

        function renderizarPreguntaTrivia() {
            const contenedor = document.getElementById('quiz-container');
            if (indiceTrivia >= bancoPreguntasTrivia.length) {
                reproducirSonido('victoria');
                contenedor.innerHTML = `
                    <div class="text-center py-6 space-y-4">
                        <div class="w-20 h-20 rounded-full bg-yellow-400/20 border-2 border-yellow-400 text-yellow-400 flex items-center justify-center mx-auto text-4xl">
                            <i class="fa-solid fa-medal"></i>
                        </div>
                        <h3 class="font-titulo text-2xl sm:text-3xl font-black text-white">¡Trivia Académica Completada!</h3>
                        <p class="text-slate-300 text-sm">Obtuviste <strong class="text-yellow-400 text-lg">${puntajeTrivia} puntos</strong> en el Desafío Equinoccial.</p>
                        <div class="pt-3">
                            <button onclick="iniciarTrivia()" class="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-titulo font-extrabold text-xs uppercase tracking-wider transition">
                                <i class="fa-solid fa-rotate-right mr-1.5"></i> Volver a Jugar la Trivia
                            </button>
                        </div>
                    </div>
                `;
                return;
            }

            const item = bancoPreguntasTrivia[indiceTrivia];
            const progreso = Math.round((indiceTrivia / bancoPreguntasTrivia.length) * 100);

            contenedor.innerHTML = `
                <div class="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs">
                    <span class="font-bold text-yellow-400 uppercase tracking-wider">Pregunta ${indiceTrivia + 1} de ${bancoPreguntasTrivia.length}</span>
                    <div class="flex items-center gap-3">
                        <span class="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 font-bold"><i class="fa-solid fa-fire mr-1" aria-hidden="true"></i>Racha: ${rachaTrivia}</span>
                        <span class="px-2.5 py-1 rounded bg-slate-800 text-yellow-400 font-bold">Puntos Trivia: ${puntajeTrivia}</span>
                    </div>
                </div>

                <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                    <div class="h-full bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 transition-all duration-300" style="width: ${progreso}%"></div>
                </div>

                <h3 class="font-titulo font-bold text-base sm:text-xl text-white mb-6 leading-snug">${item.pregunta}</h3>

                <div class="grid grid-cols-1 gap-3" id="opciones-trivia-box">
                    ${item.opciones.map((op, idx) => `
                        <button onclick="verificarRespuestaTrivia(${idx})" id="btn-op-${idx}"
                                class="opcion-btn text-left p-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600 text-xs sm:text-sm text-slate-100 font-medium flex items-start gap-3">
                            <span class="w-6 h-6 rounded-lg bg-slate-900 text-yellow-400 font-bold flex items-center justify-center shrink-0 text-xs">${String.fromCharCode(65 + idx)}</span>
                            <span>${op}</span>
                        </button>
                    `).join('')}
                </div>

                <div id="feedback-trivia" class="oculto mt-6 p-4 rounded-xl border text-xs sm:text-sm"></div>
            `;
            triviaRespondida = false;
        }

        function verificarRespuestaTrivia(idxElegido) {
            if (triviaRespondida) return;
            triviaRespondida = true;

            const item = bancoPreguntasTrivia[indiceTrivia];
            const btnElegido = document.getElementById(`btn-op-${idxElegido}`);
            const btnCorrecto = document.getElementById(`btn-op-${item.correcta}`);
            const feedback = document.getElementById('feedback-trivia');

            if (idxElegido === item.correcta) {
                reproducirSonido('acierto');
                btnElegido.classList.add('correcto');
                rachaTrivia++;
                const ganados = 50 + (rachaTrivia * 10);
                puntajeTrivia += ganados;
                sumarPuntosGlobales(ganados);
                feedback.className = 'mt-6 p-4 rounded-xl border bg-emerald-950/80 border-emerald-500 text-emerald-200 text-xs sm:text-sm';
                feedback.innerHTML = `
                    <div class="flex items-center justify-between mb-1">
                        <strong class="text-emerald-400"><i class="fa-solid fa-circle-check mr-1"></i> ¡Respuesta Correcta! (+${ganados} pts)</strong>
                    </div>
                    <p>${item.explicacion}</p>
                    <button onclick="siguientePreguntaTrivia()" class="mt-3 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase transition">
                        Siguiente Pregunta <i class="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                `;
            } else {
                reproducirSonido('error');
                btnElegido.classList.add('incorrecto');
                btnCorrecto.classList.add('correcto');
                rachaTrivia = 0;
                feedback.className = 'mt-6 p-4 rounded-xl border bg-red-950/80 border-red-500 text-red-200 text-xs sm:text-sm';
                feedback.innerHTML = `
                    <strong class="text-red-400 block mb-1"><i class="fa-solid fa-circle-xmark mr-1"></i> Respuesta Incorrecta</strong>
                    <p>${item.explicacion}</p>
                    <button onclick="siguientePreguntaTrivia()" class="mt-3 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs uppercase transition">
                        Continuar <i class="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                `;
            }
        }

        function siguientePreguntaTrivia() {
            reproducirSonido('clic');
            indiceTrivia++;
            renderizarPreguntaTrivia();
        }

        /* ------------------------------------------------------------------------
           JUEGO 2: MEMORAMA PATRIMONIAL Y OLÍMPICO (6 PARES = 12 CARTAS)
           ------------------------------------------------------------------------ */
        const paresMemoramaBase = [
            { parId: 1, texto: "Volcán Chimborazo", icono: "🏔️" },
            { parId: 1, texto: "6.384,4 km del centro terrestre", icono: "🌍" },
            { parId: 2, texto: "Cultura Mayo-Chinchipe", icono: "🏺" },
            { parId: 2, texto: "Cacao hace 5.500 años (Palanda)", icono: "🍫" },
            { parId: 3, texto: "Brian Daniel Pintado", icono: "🥇" },
            { parId: 3, texto: "Oro Olímpico 20 km Marcha París 2024", icono: "👟" },
            { parId: 4, texto: "Kushki (PayTech)", icono: "🦄" },
            { parId: 4, texto: "1.er Unicornio Tecnológico ($1.500 M)", icono: "💻" },
            { parId: 5, texto: "Árbol de la Quina (Loja)", icono: "🌿" },
            { parId: 5, texto: "Cura mundial contra la Malaria (1936)", icono: "⚕️" },
            { parId: 6, texto: "Artículos 71 al 74 (2008)", icono: "⚖️" },
            { parId: 6, texto: "Derechos de la Naturaleza (Pachamama)", icono: "🌱" }
        ];

        let cartasMemorama = [];
        let cartasVolteadas = [];
        let paresEncontrados = 0;
        let intentosMemorama = 0;
        let bloqueoMemorama = false;

        function iniciarMemorama() {
            cartasMemorama = [...paresMemoramaBase]
                .sort(() => Math.random() - 0.5)
                .map((c, idx) => ({ ...c, uid: idx, emparejada: false, revelada: false }));
            cartasVolteadas = [];
            paresEncontrados = 0;
            intentosMemorama = 0;
            bloqueoMemorama = false;
            actualizarCabeceraMemorama();
            renderizarTableroMemorama();
        }

        function actualizarCabeceraMemorama() {
            document.getElementById('memo-intentos').textContent = intentosMemorama;
            document.getElementById('memo-pares').textContent = `${paresEncontrados}/6`;
        }

        function renderizarTableroMemorama() {
            const tablero = document.getElementById('tablero-memorama');
            tablero.innerHTML = cartasMemorama.map((c, idx) => `
                <div onclick="voltearCartaMemorama(${idx})" 
                     class="carta-memorama ${c.revelada ? 'revelada' : ''} ${c.emparejada ? 'emparejada' : ''}">
                    <div class="carta-memorama-inner">
                        <div class="carta-cara-frontal shadow-md">
                            <i class="fa-solid fa-sun text-2xl"></i>
                            <span class="text-[10px] font-bold uppercase tracking-widest mt-1 text-white">ECUADOR</span>
                        </div>
                        <div class="carta-cara-trasera shadow-md">
                            <span class="text-2xl mb-1">${c.icono}</span>
                            <span class="text-xs font-bold leading-tight">${c.texto}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function voltearCartaMemorama(idx) {
            if (bloqueoMemorama) return;
            const carta = cartasMemorama[idx];
            if (carta.revelada || carta.emparejada) return;

            reproducirSonido('clic');
            carta.revelada = true;
            cartasVolteadas.push(carta);
            renderizarTableroMemorama();

            if (cartasVolteadas.length === 2) {
                intentosMemorama++;
                bloqueoMemorama = true;
                const [c1, c2] = cartasVolteadas;

                if (c1.parId === c2.parId) {
                    setTimeout(() => {
                        reproducirSonido('acierto');
                        c1.emparejada = true;
                        c2.emparejada = true;
                        paresEncontrados++;
                        sumarPuntosGlobales(40);
                        cartasVolteadas = [];
                        bloqueoMemorama = false;
                        actualizarCabeceraMemorama();
                        renderizarTableroMemorama();
                        if (paresEncontrados === 6) reproducirSonido('victoria');
                    }, 350);
                } else {
                    setTimeout(() => {
                        reproducirSonido('error');
                        c1.revelada = false;
                        c2.revelada = false;
                        cartasVolteadas = [];
                        bloqueoMemorama = false;
                        actualizarCabeceraMemorama();
                        renderizarTableroMemorama();
                    }, 850);
                }
            }
        }


        /* ------------------------------------------------------------------------
           JUEGO 3: RUTA EQUINOCCIAL — ordena el viaje
           ------------------------------------------------------------------------ */
        const pasosRutaBase = [
            { id: 'a', texto: 'Llegar a Quito y visitar la Mitad del Mundo' },
            { id: 'b', texto: 'Bajar a Guayaquil y probar patacones en la Costa' },
            { id: 'c', texto: 'Entrar a la Amazonía y conocer el Yasuní' },
            { id: 'd', texto: 'Volar a Galápagos para el cierre ecológico' }
        ];
        let ordenRuta = [];
        let rutaBloqueada = false;
        let rutaSeleccionIdx = null;

        function barajar(arr) {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        function iniciarJuegoRuta() {
            ordenRuta = barajar(pasosRutaBase);
            rutaBloqueada = false;
            rutaSeleccionIdx = null;
            renderizarJuegoRuta();
        }

        function renderizarJuegoRuta() {
            const cont = document.getElementById('contenedor-juego-ruta');
            if (!cont) return;
            cont.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <h3 class="font-titulo text-xl font-extrabold text-white">Ruta Equinoccial</h3>
                        <p class="text-sm text-slate-300 mt-1">Ordena el viaje de norte a sur / costa–oriente–islas. Toca dos pasos para intercambiarlos.</p>
                    </div>
                    <div id="lista-ruta">
                        ${ordenRuta.map((p, i) => `
                            <button type="button" class="ruta-step ${rutaSeleccionIdx === i ? 'is-picked' : ''}" onclick="intercambiarRuta(${i})">
                                <span class="ruta-ord">${i + 1}</span>
                                <span class="text-left text-sm">${p.texto}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" onclick="verificarRuta()" class="min-h-[44px] px-4 rounded-xl bg-yellow-400 text-slate-950 font-bold text-sm" ${rutaBloqueada ? 'disabled' : ''}>Comprobar orden</button>
                        <button type="button" onclick="iniciarJuegoRuta()" class="min-h-[44px] px-4 rounded-xl bg-slate-800 text-slate-200 font-bold text-sm border border-slate-600">Mezclar de nuevo</button>
                    </div>
                    <div id="feedback-ruta" class="text-sm font-bold min-h-[24px]"></div>
                </div>
            `;
        }

        function intercambiarRuta(idx) {
            if (rutaBloqueada) return;
            if (rutaSeleccionIdx === null) {
                rutaSeleccionIdx = idx;
                renderizarJuegoRuta();
                return;
            }
            if (rutaSeleccionIdx === idx) {
                rutaSeleccionIdx = null;
                renderizarJuegoRuta();
                return;
            }
            const tmp = ordenRuta[rutaSeleccionIdx];
            ordenRuta[rutaSeleccionIdx] = ordenRuta[idx];
            ordenRuta[idx] = tmp;
            rutaSeleccionIdx = null;
            reproducirSonido('clic');
            renderizarJuegoRuta();
        }

        function verificarRuta() {
            const ok = ordenRuta.map(p => p.id).join('') === 'abcd';
            const fb = document.getElementById('feedback-ruta');
            if (ok) {
                rutaBloqueada = true;
                reproducirSonido('victoria');
                sumarPuntosGlobales(120);
                fb.innerHTML = '<span class="text-emerald-400"><i class="fa-solid fa-check-circle mr-1"></i> ¡Ruta perfecta! +120 pts</span>';
                renderizarJuegoRuta();
            } else {
                reproducirSonido('error');
                fb.innerHTML = '<span class="text-red-400"><i class="fa-solid fa-xmark-circle mr-1"></i> Aún no. Pista: Quito → Costa → Amazonía → Galápagos.</span>';
            }
        }

        /* ------------------------------------------------------------------------
           JUEGO 4: CLASIFICADOR RÁPIDO «RETO DE LAS 4 REGIONES»
           ------------------------------------------------------------------------ */
        const itemsClasificadorRegiones = [
            { nombre: "Primer exportador mundial de Camarón blanco y Banano", region: "costa", pista: "Cuenca del Guayas, Manabí, El Oro y Esmeraldas" },
            { nombre: "Volcán Chimborazo (6.263,47 m s. n. m.) y Centro Histórico de Quito", region: "sierra", pista: "Callejón Interandino de los Andes" },
            { nombre: "Parque Nacional Yasuní y Cuna del Cacao en Palanda (3500 a. C.)", region: "amazonia", pista: "45,7% del territorio nacional al este de los Andes" },
            { nombre: "Bono Azul de Conservación (2023) y Volcán Wolf en la Isla Isabela", region: "galapagos", pista: "Archipiélago volcánico a 972 km del continente" },
            { nombre: "Tejido del Sombrero de Paja Toquilla en Montecristi y Marimba Esmeraldeña", region: "costa", pista: "Patrimonios Culturales Inmateriales del Litoral" },
            { nombre: "Árbol Nacional de la Quina (Loja) y Complejo Inca-Cañari de Ingapirca", region: "sierra", pista: "Andes australes del Ecuador" }
        ];

        let indiceClasificador = 0;

        function iniciarJuegoRegiones() {
            indiceClasificador = 0;
            renderizarJuegoRegiones();
        }

        function renderizarJuegoRegiones() {
            const cont = document.getElementById('contenedor-juego-regiones');
            if (indiceClasificador >= itemsClasificadorRegiones.length) {
                reproducirSonido('victoria');
                cont.innerHTML = `
                    <div class="text-center py-6 space-y-4">
                        <h3 class="font-titulo text-2xl font-black text-emerald-400">¡Dominio Geográfico Completado!</h3>
                        <p class="text-xs sm:text-sm text-slate-300">Clasificaste correctamente todos los activos estratégicos de las 4 Regiones Naturales del Ecuador.</p>
                        <button onclick="iniciarJuegoRegiones()" class="px-6 py-2.5 rounded-xl bg-yellow-400 text-slate-950 font-bold text-xs uppercase">
                            Jugar de Nuevo
                        </button>
                    </div>
                `;
                return;
            }

            const actual = itemsClasificadorRegiones[indiceClasificador];
            cont.innerHTML = `
                <div class="text-center max-w-2xl mx-auto space-y-5">
                    <span class="px-3 py-1 rounded-full bg-slate-800 text-yellow-400 text-xs font-bold">Elemento ${indiceClasificador + 1} de ${itemsClasificadorRegiones.length}</span>
                    <div class="bg-slate-800/90 p-6 rounded-2xl border-2 border-blue-500/40">
                        <span class="text-xs text-slate-400 uppercase block mb-1">¿A qué Región Geográfica pertenece este activo nacional?</span>
                        <h4 class="font-titulo font-black text-xl sm:text-2xl text-white">${actual.nombre}</h4>
                        <span class="text-xs text-blue-300 block mt-2"><i class="fa-solid fa-lightbulb mr-1"></i>Pista: ${actual.pista}</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button type="button" onclick="verificarClasificacionRegion('costa')" class="min-h-[44px] p-4 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 border border-amber-400 font-titulo font-bold text-xs sm:text-sm transition">
                            <i class="fa-solid fa-water mr-1" aria-hidden="true"></i> Costa
                        </button>
                        <button type="button" onclick="verificarClasificacionRegion('sierra')" class="min-h-[44px] p-4 rounded-xl bg-purple-500/20 hover:bg-purple-500 hover:text-white border border-purple-400 font-titulo font-bold text-xs sm:text-sm transition">
                            <i class="fa-solid fa-mountain mr-1" aria-hidden="true"></i> Sierra
                        </button>
                        <button type="button" onclick="verificarClasificacionRegion('amazonia')" class="min-h-[44px] p-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-400 font-titulo font-bold text-xs sm:text-sm transition">
                            <i class="fa-solid fa-leaf mr-1" aria-hidden="true"></i> Amazonía
                        </button>
                        <button type="button" onclick="verificarClasificacionRegion('galapagos')" class="min-h-[44px] p-4 rounded-xl bg-sky-500/20 hover:bg-sky-500 hover:text-slate-950 border border-sky-400 font-titulo font-bold text-xs sm:text-sm transition">
                            <i class="fa-solid fa-anchor mr-1" aria-hidden="true"></i> Galápagos
                        </button>
                    </div>
                    <div id="feedback-clasificador" class="text-xs font-bold min-h-[24px]"></div>
                </div>
            `;
        }

        function verificarClasificacionRegion(regElegida) {
            const actual = itemsClasificadorRegiones[indiceClasificador];
            const fb = document.getElementById('feedback-clasificador');
            if (regElegida === actual.region) {
                reproducirSonido('acierto');
                sumarPuntosGlobales(45);
                fb.innerHTML = `<span class="text-emerald-400"><i class="fa-solid fa-check-circle mr-1"></i> ¡Correcto! (+45 pts)</span>`;
                setTimeout(() => {
                    indiceClasificador++;
                    renderizarJuegoRegiones();
                }, 650);
            } else {
                reproducirSonido('error');
                fb.innerHTML = `<span class="text-red-400"><i class="fa-solid fa-xmark-circle mr-1"></i> Región incorrecta. Revisa la pista geográfica e intenta de nuevo.</span>`;
            }
        }

        /* ========================================================================
           F. GENERADOR DE CÓDIGO QR VECTORIAL Y EXPORTADOR A 3 ARCHIVOS VS CODE
           ======================================================================== */
        function generarSVGQR(textoSemilla) {
            // Genera una matriz QR estilizada determinista en SVG con los tres patrones de posición oficiales
            const size = 21;
            let hash = 0;
            for (let i = 0; i < textoSemilla.length; i++) {
                hash = ((hash << 5) - hash) + textoSemilla.charCodeAt(i);
                hash |= 0;
            }
            const esPatronPosicion = (r, c) =>
                (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

            let celdas = '';
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (esPatronPosicion(r, c)) continue;
                    const bit = Math.abs(Math.sin(r * 13.7 + c * 29.3 + hash)) > 0.46;
                    if (bit) {
                        celdas += `<rect x="${c * 10}" y="${r * 10}" width="10" height="10" fill="#0F172A" rx="1.5"/>`;
                    }
                }
            }

            const dibujarFinder = (x, y) => `
                <rect x="${x}" y="${y}" width="70" height="70" rx="8" fill="#0033A0"/>
                <rect x="${x + 10}" y="${y + 10}" width="50" height="50" rx="4" fill="#FFFFFF"/>
                <rect x="${x + 20}" y="${y + 20}" width="30" height="30" rx="3" fill="#EF3340"/>
            `;

            return `
                <svg viewBox="0 0 210 210" class="w-full h-full">
                    <rect width="210" height="210" fill="#FFFFFF"/>
                    ${dibujarFinder(0, 0)}
                    ${dibujarFinder(140, 0)}
                    ${dibujarFinder(0, 140)}
                    ${celdas}
                    <rect x="85" y="85" width="40" height="40" rx="6" fill="#FFDD00" stroke="#0F172A" stroke-width="3"/>
                    <text x="105" y="110" text-anchor="middle" font-size="14" font-weight="900" fill="#0F172A">EC</text>
                </svg>
            `;
        }

        function urlPublica() {
            const manual = document.getElementById('input-url-qr');
            if (manual && manual.value.trim()) return manual.value.trim();
            if (location.protocol === 'http:' || location.protocol === 'https:') {
                return location.href.split('#')[0];
            }
            return '';
        }

        function inicializarCodigosQR(urlTexto) {
            const url = (urlTexto || '').trim() || urlPublica();
            const input = document.getElementById('input-url-qr');
            if (input && url && document.activeElement !== input) input.value = url;
            document.querySelectorAll('[data-qr]').forEach((caja) => {
                caja.replaceChildren();
                if (!url || typeof QRCode === 'undefined') {
                    const aviso = document.createElement('p');
                    aviso.className = 'text-xs text-slate-600 text-center px-2';
                    aviso.textContent = 'Al publicar en GitHub Pages, aquí aparecerá un QR que abre esta página.';
                    caja.appendChild(aviso);
                    return;
                }
                const holder = document.createElement('div');
                caja.appendChild(holder);
                new QRCode(holder, {
                    text: url,
                    width: 168,
                    height: 168,
                    colorDark: '#0A1931',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M
                });
                const imagen = holder.querySelector('img');
                if (imagen) imagen.alt = 'Código QR que abre ' + url;
            });
            const visible = document.getElementById('url-visible');
            if (visible) visible.textContent = url || 'Publica el sitio para generar el enlace';
        }

        function actualizarQRPersonalizado(valor) {
            inicializarCodigosQR(valor);
        }

        function copiarEnlacePortal() {
            const url = urlPublica() || location.href;
            const terminar = () => reproducirSonido('acierto');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(terminar).catch(() => {});
                return;
            }
            const area = document.createElement('textarea');
            area.value = url;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
            terminar();
        }

        let focoPrevio = null;

        function recordarFoco() {
            focoPrevio = document.activeElement;
        }

        function restaurarFoco() {
            if (focoPrevio && typeof focoPrevio.focus === 'function') focoPrevio.focus();
        }

        function capaAbierta() {
            return ['modal-qr', 'modal-vscode', 'modal-ficha-culinaria'].some((id) => {
                const nodo = document.getElementById(id);
                return nodo && !nodo.classList.contains('oculto');
            });
        }

        function sincronizarScrollModal() {
            document.body.classList.toggle('modal-abierto', capaAbierta());
        }

        function abrirModalQR() {
            reproducirSonido('clic');
            recordarFoco();
            const modal = document.getElementById('modal-qr');
            modal.classList.remove('oculto');
            sincronizarScrollModal();
            const cierre = modal.querySelector('button');
            if (cierre) cierre.focus();
        }

        function cerrarModalQR() {
            const modal = document.getElementById('modal-qr');
            if (!modal || modal.classList.contains('oculto')) return;
            modal.classList.add('oculto');
            sincronizarScrollModal();
            restaurarFoco();
        }

        /* Exportador de los 3 archivos separados para VS Code (index.html, style.css, codigo.js) */
        let archivoVSCodeActual = 'html';

        function abrirModalVSCode() {
            reproducirSonido('clic');
            recordarFoco();
            document.getElementById('modal-vscode').classList.remove('oculto');
            sincronizarScrollModal();
            mostrarCodigoArchivo('html');
        }

        function cerrarModalVSCode() {
            const modal = document.getElementById('modal-vscode');
            if (!modal || modal.classList.contains('oculto')) return;
            modal.classList.add('oculto');
            sincronizarScrollModal();
            restaurarFoco();
        }

        const rutasArchivo = { html: 'index.html', css: 'style.css', js: 'codigo.js' };

        async function mostrarCodigoArchivo(tipo) {
            archivoVSCodeActual = tipo;
            ['html', 'css', 'js'].forEach(t => {
                const btn = document.getElementById(`btn-tab-${t}`);
                if (!btn) return;
                btn.className = t === tipo
                    ? 'px-4 py-2 rounded-xl bg-yellow-400 text-slate-950 font-bold text-xs'
                    : 'px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700';
            });
            const visor = document.getElementById('visor-codigo-vscode');
            visor.textContent = 'Cargando ' + rutasArchivo[tipo] + '…';
            try {
                const respuesta = await fetch(rutasArchivo[tipo]);
                if (!respuesta.ok) throw new Error('archivo');
                visor.textContent = await respuesta.text();
            } catch (error) {
                visor.textContent = 'Este visor funciona cuando el portal se abre desde GitHub Pages o un servidor local. Los archivos del proyecto son index.html, style.css y codigo.js.';
            }
        }

        function copiarCodigoVSCode() {
            const texto = document.getElementById('visor-codigo-vscode').textContent;
            const avisar = () => {
                reproducirSonido('acierto');
                const btn = document.getElementById('btn-copiar-vscode');
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado';
                setTimeout(() => { btn.innerHTML = original; }, 2000);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(texto).then(avisar).catch(() => {});
                return;
            }
            const areaTemp = document.createElement('textarea');
            areaTemp.value = texto;
            document.body.appendChild(areaTemp);
            areaTemp.select();
            document.execCommand('copy');
            areaTemp.remove();
            avisar();
        }

        function alternarMenu() {
            const panel = document.getElementById('nav-links');
            const btn = document.getElementById('btn-menu');
            const abierto = panel.classList.toggle('abierto');
            btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
            document.getElementById('icono-menu').className = abierto ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            const textoMenu = document.getElementById('texto-menu');
            if (textoMenu) textoMenu.textContent = abierto ? 'Cerrar menú' : 'Abrir menú';
        }

        function cerrarMenu() {
            const panel = document.getElementById('nav-links');
            const btn = document.getElementById('btn-menu');
            if (!panel || !btn) return;
            panel.classList.remove('abierto');
            btn.setAttribute('aria-expanded', 'false');
            const icono = document.getElementById('icono-menu');
            if (icono) icono.className = 'fa-solid fa-bars';
            const textoMenu = document.getElementById('texto-menu');
            if (textoMenu) textoMenu.textContent = 'Abrir menú';
        }

        function iniciarRecorrido() {
            const btnMenu = document.getElementById('btn-menu');
            if (btnMenu) btnMenu.addEventListener('click', alternarMenu);
            document.querySelectorAll('#nav-links a').forEach((enlace) => {
                enlace.addEventListener('click', cerrarMenu);
            });
            const secciones = ['mapa-datos', 'informe-11-secciones', 'gastronomia-3d', 'multimedia', 'zona-arcade'];
            const observador = new IntersectionObserver((entradas) => {
                entradas.forEach((entrada) => {
                    if (!entrada.isIntersecting) return;
                    document.querySelectorAll('#nav-links a').forEach((enlace) => {
                        enlace.classList.toggle('nav-activa', enlace.getAttribute('href') === '#' + entrada.target.id);
                    });
                });
            }, { rootMargin: '-45% 0px -45% 0px', threshold: 0.05 });
            secciones.forEach((id) => {
                const nodo = document.getElementById(id);
                if (nodo) observador.observe(nodo);
            });
            const subir = document.getElementById('btn-subir');
            if (subir) {
                window.addEventListener('scroll', () => {
                    subir.classList.toggle('visible', window.scrollY > 700);
                }, { passive: true });
            }
            document.addEventListener('keydown', (evento) => {
                if (evento.key !== 'Escape') return;
                cerrarModalQR();
                cerrarModalCulinario();
                cerrarModalVSCode();
                cerrarGaleria();
                cerrarMenu();
                detenerNarracion();
                detenerAmbiente();
            });
            ['modal-qr', 'modal-vscode', 'modal-ficha-culinaria', 'modal-galeria'].forEach((id) => {
                const modal = document.getElementById(id);
                if (!modal) return;
                modal.addEventListener('click', (evento) => {
                    if (evento.target !== modal) return;
                    if (id === 'modal-qr') cerrarModalQR();
                    if (id === 'modal-vscode') cerrarModalVSCode();
                    if (id === 'modal-ficha-culinaria') cerrarModalCulinario();
                    if (id === 'modal-galeria') cerrarGaleria();
                });
            });
        }

        /* ========================================================================
           G. INICIALIZACIÓN AL CARGAR EL DOM
           ======================================================================== */
        function iniciarReveals() {
            const nodos = document.querySelectorAll('[data-reveal]');
            if (!nodos.length) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                nodos.forEach(n => n.classList.add('is-in'));
                return;
            }
            const io = new IntersectionObserver((entries) => {
                entries.forEach(en => {
                    if (en.isIntersecting) {
                        en.target.classList.add('is-in');
                        io.unobserve(en.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
            nodos.forEach(n => {
                const rect = n.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.92) n.classList.add('is-in');
                else io.observe(n);
            });
        }

        window.addEventListener('DOMContentLoaded', () => {
            seleccionarRegionMapa('costa', { silencio: true });
            iniciarMapaInteractivo();
            iniciarCarruselDatos();
            renderizarDiezDatos();
            renderizarTabsInforme();
            cambiarSeccionInforme('1A');
            renderizarFlipCardsGastronomia();
            renderizarVideosStand();
            iniciarTrivia();
            iniciarMemorama();
            iniciarJuegoRuta();
            iniciarJuegoRegiones();
            iniciarRecorrido();
            iniciarReveals();
            inicializarCodigosQR(urlPublica());
        });