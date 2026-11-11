/* =========================================================================
   EXTRAS.JS — Pasaporte, cronología, paisajes sonoros, toast y UI nueva
   Integra patrones del sitio de referencia sobre el portal COBOLJA actual.
   ========================================================================= */
'use strict';

const CLAVE_PAS = 'ecuador-cobolja-stand-v3';
const NOMBRES_J = {
  trivia: 'Trivia',
  memorama: 'Memorama',
  ruta: 'Ruta Equinoccial',
  regiones: 'Regiones',
  mapa: 'Explorar el mapa',
  explorar: 'Leer y descubrir'
};

const est = (() => {
  const base = { pts: {}, regs: [], tabs: [], platos: [], nombre: '', foto: '', sonido: true, cond: false, tv: [], registroOk: false };
  try {
    const merged = Object.assign(base, JSON.parse(localStorage.getItem(CLAVE_PAS) || '{}'));
    // Visitantes previos (solo nombre): no forzar de nuevo el registro
    if ((merged.nombre || '').trim() && merged.registroOk !== true) merged.registroOk = true;
    return merged;
  } catch (e) {
    return base;
  }
})();

function guardarEstado() {
  try {
    localStorage.setItem(CLAVE_PAS, JSON.stringify(est));
  } catch (e) {
    // Si la foto es muy pesada, reintenta sin ella
    try {
      const copia = Object.assign({}, est, { foto: '' });
      localStorage.setItem(CLAVE_PAS, JSON.stringify(copia));
      toastMsg('No se pudo guardar la foto (espacio). El nombre sí quedó guardado.');
    } catch (e2) { /* ignore */ }
  }
}

let camStream = null;
let fotoTemporal = '';

function detenerCamara() {
  if (camStream) {
    camStream.getTracks().forEach((t) => t.stop());
    camStream = null;
  }
  const v = document.getElementById('cam-preview');
  if (v) v.srcObject = null;
}

function totalPuntos() {
  return Object.values(est.pts).reduce((a, b) => a + (b || 0), 0);
}

function rangoActual() {
  let r = RANGOS[0];
  const t = totalPuntos();
  RANGOS.forEach((x) => { if (t >= x.min) r = x; });
  return r;
}

function toastMsg(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastMsg._t);
  toastMsg._t = setTimeout(() => t.classList.remove('on'), 2600);
}

function sumarCategoria(juego, n) {
  const cap = (typeof TOPES !== 'undefined' && TOPES[juego]) || 0;
  const ya = est.pts[juego] || 0;
  const ok = Math.max(0, Math.min(n, cap - ya));
  if (ok > 0) {
    const antes = totalPuntos();
    est.pts[juego] = ya + ok;
    guardarEstado();
    pintarPuntosUI(true);
    if (typeof pintarLobbyPuntos === 'function') pintarLobbyPuntos();
    if (antes < META && totalPuntos() >= META && !est.cond) {
      est.cond = true;
      guardarEstado();
      setTimeout(celebrarCondor, 800);
    }
  }
  return ok;
}

function pintarPuntosUI(bump) {
  const score = document.getElementById('score');
  const rango = document.getElementById('rango-visitante');
  const chipIc = document.getElementById('pasaporte-emoji');
  const chipNom = document.getElementById('pasaporte-nombre-chip');
  const t = totalPuntos();
  const r = rangoActual();
  if (score) {
    score.textContent = t;
    if (bump) {
      score.classList.remove('score-bump');
      void score.offsetWidth;
      score.classList.add('score-bump');
    }
  }
  if (rango) rango.textContent = r.nombre;
  if (chipIc) chipIc.textContent = r.ic;
  if (chipNom) {
    const n = (est.nombre || '').trim();
    chipNom.textContent = n ? n.split(/\s+/)[0] : 'Tu pasaporte';
    chipNom.classList.toggle('oculto', !n);
  }
}

function pintarLobbyPuntos() {
  Object.keys(TOPES).forEach((k) => {
    const el = document.getElementById('lobby-pts-' + k);
    if (el) el.textContent = (est.pts[k] || 0) + ' / ' + TOPES[k];
  });
}

/* ---------- Modal genérico ligero ---------- */
function abrirModalExtra(html, opts = {}) {
  let raiz = document.getElementById('modal-extra');
  if (!raiz) {
    raiz = document.createElement('div');
    raiz.id = 'modal-extra';
    raiz.className = 'modal-extra oculto';
    document.body.appendChild(raiz);
  }
  if (!raiz._wired) {
    raiz.addEventListener('click', (e) => {
      if (e.target !== raiz) return;
      if (raiz.classList.contains('modal-bienvenida') && !(est.nombre || '').trim()) return;
      cerrarModalExtra();
    });
    raiz._wired = true;
  }
  let caja = raiz.querySelector('.modal-extra-c');
  if (!caja) {
    caja = document.createElement('div');
    caja.setAttribute('role', 'dialog');
    caja.setAttribute('aria-modal', 'true');
    raiz.appendChild(caja);
  }
  caja.className = 'modal-extra-c' + (opts.ancho ? ' ancho' : '');
  caja.innerHTML = '<button type="button" class="modal-extra-cerrar" aria-label="Cerrar">×</button>' + html;
  caja.querySelector('.modal-extra-cerrar').onclick = () => {
    if (raiz.classList.contains('modal-bienvenida') && !(est.nombre || '').trim()) return;
    cerrarModalExtra();
  };
  raiz.classList.remove('oculto');
  document.body.classList.add('modal-abierto');
  if (opts.foco) {
    const f = caja.querySelector(opts.foco);
    if (f) setTimeout(() => f.focus(), 40);
  }
}

function cerrarModalExtra() {
  detenerCamara();
  const raiz = document.getElementById('modal-extra');
  if (!raiz) return;
  raiz.classList.remove('modal-bienvenida', 'modal-pasaporte-libro');
  raiz.classList.add('oculto');
  document.body.classList.remove('modal-abierto');
}

function escHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function comprimirFotoCarnet(videoOImg) {
  const W = 240, H = 300;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const vw = videoOImg.videoWidth || videoOImg.naturalWidth || videoOImg.width;
  const vh = videoOImg.videoHeight || videoOImg.naturalHeight || videoOImg.height;
  const scale = Math.max(W / vw, H / vh);
  const sw = W / scale;
  const sh = H / scale;
  const sx = (vw - sw) / 2;
  const sy = (vh - sh) / 2;
  ctx.drawImage(videoOImg, sx, sy, sw, sh, 0, 0, W, H);
  return canvas.toDataURL('image/jpeg', 0.72);
}

function mostrarPasoBienvenida(paso) {
  const p1 = document.getElementById('paso-nombre');
  const p2 = document.getElementById('paso-foto');
  if (p1) p1.classList.toggle('oculto', paso !== 1);
  if (p2) p2.classList.toggle('oculto', paso !== 2);
}

async function iniciarCamaraBienvenida() {
  const video = document.getElementById('cam-preview');
  const aviso = document.getElementById('cam-aviso');
  const btnTomar = document.getElementById('btn-tomar-foto');
  if (!video) return;
  detenerCamara();
  fotoTemporal = '';
  const cap = document.getElementById('cam-captura');
  if (cap) {
    cap.classList.add('oculto');
    cap.removeAttribute('src');
  }
  video.classList.remove('oculto');
  if (!window.isSecureContext && location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    if (aviso) {
      aviso.classList.remove('oculto');
      aviso.textContent = 'No se pudo abrir la cámara en este entorno. Usa «Continuar sin foto».';
    }
    if (btnTomar) btnTomar.disabled = true;
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (aviso) {
      aviso.classList.remove('oculto');
      aviso.textContent = 'Este navegador no permite cámara. Puedes continuar sin foto.';
    }
    if (btnTomar) btnTomar.disabled = true;
    return;
  }
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    video.srcObject = camStream;
    await video.play();
    if (aviso) aviso.classList.add('oculto');
    if (btnTomar) btnTomar.disabled = false;
  } catch (err) {
    if (aviso) {
      aviso.classList.remove('oculto');
      aviso.textContent = 'No se pudo usar la cámara (permiso denegado o sin dispositivo). Continúa sin foto.';
    }
    if (btnTomar) btnTomar.disabled = true;
  }
}

function finalizarRegistroVisitante(conFoto) {
  const raiz = document.getElementById('modal-extra');
  const cierre = document.querySelector('#modal-extra .modal-extra-cerrar');
  if (conFoto && fotoTemporal) est.foto = fotoTemporal;
  else if (!conFoto && !fotoTemporal) { /* mantiene foto previa si existe al reeditar, salvo que explicitamente quiera borrar - ok */ }
  est.registroOk = true;
  guardarEstado();
  detenerCamara();
  pintarPuntosUI();
  if (raiz) raiz.classList.remove('modal-bienvenida');
  if (cierre) cierre.classList.remove('oculto');
  cerrarModalExtra();
  toastMsg('¡Hola, ' + est.nombre.split(' ')[0] + '! Tu pasaporte está listo.');
  setTimeout(abrirPasaporte, 280);
}

function abrirBienvenidaNombre() {
  fotoTemporal = est.foto || '';
  abrirModalExtra(`
    <div class="bienvenida-pasaporte">
      <div class="bienvenida-bandera" aria-hidden="true"><i></i><i></i><i></i></div>
      <p class="bienvenida-kicker">Stand digital · COBOLJA 2026</p>
      <h3>¡Bienvenido al Ecuador!</h3>
      <p class="bienvenida-lead">Crea tu pasaporte de visitante: nombre y, si quieres, una foto tipo carnet.</p>

      <div id="paso-nombre">
        <label for="nombre-bienvenida" class="block font-bold mt-4 mb-1">1. Tu nombre</label>
        <input id="nombre-bienvenida" class="campo-nombre" maxlength="40" placeholder="Ej.: Ana Pérez" autocomplete="name" value="${escHtml(est.nombre || '')}">
        <p id="nombre-error" class="nombre-error oculto">Escribe al menos 2 letras para continuar.</p>
        <button type="button" class="btn-pas-sol bienvenida-cta" id="btn-ir-foto">Siguiente: foto</button>
      </div>

      <div id="paso-foto" class="oculto">
        <p class="font-bold mt-2 mb-1">2. Foto para tu pasaporte</p>
        <p class="bienvenida-lead" style="font-size:0.95rem">Centra tu rostro en el óvalo y toca «Tomar foto».</p>
        <div class="cam-marco">
          <video id="cam-preview" playsinline autoplay muted></video>
          <img id="cam-captura" class="oculto" alt="Vista previa de tu foto">
          <div class="cam-guia" aria-hidden="true"></div>
        </div>
        <p id="cam-aviso" class="nombre-error oculto"></p>
        <div class="pas-acciones" style="margin-top:12px">
          <button type="button" class="btn-pas-sol" id="btn-tomar-foto">Tomar foto</button>
          <button type="button" class="btn-pas" id="btn-reintentar-foto">Otra foto</button>
          <button type="button" class="btn-pas" id="btn-sin-foto">Continuar sin foto</button>
          <button type="button" class="btn-pas" id="btn-volver-nombre">Volver</button>
        </div>
        <button type="button" class="btn-pas-sol bienvenida-cta oculto" id="btn-guardar-registro">Guardar y ver pasaporte</button>
      </div>
    </div>
  `, { foco: '#nombre-bienvenida', ancho: true });
  const raiz = document.getElementById('modal-extra');
  if (raiz) raiz.classList.add('modal-bienvenida');
  const cierre = document.querySelector('#modal-extra .modal-extra-cerrar');
  if (cierre) cierre.classList.add('oculto');

  const inp = document.getElementById('nombre-bienvenida');
  const err = document.getElementById('nombre-error');
  const irFoto = () => {
    const nom = (inp.value || '').trim();
    if (nom.length < 2) {
      err.classList.remove('oculto');
      inp.focus();
      return;
    }
    est.nombre = nom;
    guardarEstado();
    pintarPuntosUI();
    mostrarPasoBienvenida(2);
    iniciarCamaraBienvenida();
  };
  document.getElementById('btn-ir-foto').onclick = irFoto;
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') irFoto(); });

  document.getElementById('btn-volver-nombre').onclick = () => {
    detenerCamara();
    mostrarPasoBienvenida(1);
  };
  document.getElementById('btn-sin-foto').onclick = () => {
    fotoTemporal = '';
    finalizarRegistroVisitante(false);
  };
  document.getElementById('btn-tomar-foto').onclick = () => {
    const video = document.getElementById('cam-preview');
    if (!video || !camStream) return;
    try {
      fotoTemporal = comprimirFotoCarnet(video);
      const cap = document.getElementById('cam-captura');
      video.classList.add('oculto');
      cap.src = fotoTemporal;
      cap.classList.remove('oculto');
      detenerCamara();
      document.getElementById('btn-guardar-registro').classList.remove('oculto');
      toastMsg('Foto lista. Guarda para verla en tu pasaporte.');
    } catch (e) {
      toastMsg('No se pudo capturar la foto.');
    }
  };
  document.getElementById('btn-reintentar-foto').onclick = () => {
    fotoTemporal = '';
    document.getElementById('btn-guardar-registro').classList.add('oculto');
    iniciarCamaraBienvenida();
  };
  document.getElementById('btn-guardar-registro').onclick = () => finalizarRegistroVisitante(true);
}

function abrirEditarNombre() {
  abrirModalExtra(`
    <div class="bienvenida-pasaporte">
      <p class="bienvenida-kicker">Pasaporte</p>
      <h3>Editar nombre</h3>
      <p class="bienvenida-lead">Cambia solo tu nombre. La foto se mantiene igual.</p>
      <label for="nombre-editar" class="block font-bold mt-4 mb-1">Tu nombre</label>
      <input id="nombre-editar" class="campo-nombre" maxlength="40" placeholder="Ej.: Ana Pérez" autocomplete="name" value="${escHtml(est.nombre || '')}">
      <p id="nombre-edit-error" class="nombre-error oculto">Escribe al menos 2 letras.</p>
      <div class="pas-acciones" style="margin-top:12px">
        <button type="button" class="btn-pas-sol" id="btn-guardar-solo-nombre">Guardar nombre</button>
        <button type="button" class="btn-pas" id="btn-cancelar-nombre">Cancelar</button>
      </div>
    </div>
  `, { foco: '#nombre-editar' });
  const inp = document.getElementById('nombre-editar');
  const err = document.getElementById('nombre-edit-error');
  const guardar = () => {
    const nom = (inp.value || '').trim();
    if (nom.length < 2) {
      err.classList.remove('oculto');
      inp.focus();
      return;
    }
    est.nombre = nom;
    est.registroOk = true;
    guardarEstado();
    pintarPuntosUI();
    cerrarModalExtra();
    toastMsg('Nombre actualizado');
    setTimeout(abrirPasaporte, 200);
  };
  document.getElementById('btn-guardar-solo-nombre').onclick = guardar;
  document.getElementById('btn-cancelar-nombre').onclick = () => {
    cerrarModalExtra();
    setTimeout(abrirPasaporte, 120);
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') guardar(); });
}

function abrirEditarFoto() {
  if (!(est.nombre || '').trim()) {
    abrirBienvenidaNombre();
    return;
  }
  fotoTemporal = est.foto || '';
  abrirModalExtra(`
    <div class="bienvenida-pasaporte">
      <p class="bienvenida-kicker">Pasaporte</p>
      <h3>Editar foto</h3>
      <p class="bienvenida-lead">Centra tu rostro en el óvalo. Tu nombre no se modifica.</p>
      <div class="cam-marco">
        <video id="cam-preview" playsinline autoplay muted></video>
        <img id="cam-captura" class="oculto" alt="Vista previa de tu foto">
        <div class="cam-guia" aria-hidden="true"></div>
      </div>
      <p id="cam-aviso" class="nombre-error oculto"></p>
      <div class="pas-acciones" style="margin-top:12px">
        <button type="button" class="btn-pas-sol" id="btn-tomar-foto">Tomar foto</button>
        <button type="button" class="btn-pas" id="btn-reintentar-foto">Otra foto</button>
        <button type="button" class="btn-pas" id="btn-quitar-foto">Quitar foto</button>
        <button type="button" class="btn-pas" id="btn-cancelar-foto">Cancelar</button>
      </div>
      <button type="button" class="btn-pas-sol bienvenida-cta oculto" id="btn-guardar-foto">Guardar foto</button>
    </div>
  `, { ancho: true });
  iniciarCamaraBienvenida();
  document.getElementById('btn-cancelar-foto').onclick = () => {
    detenerCamara();
    cerrarModalExtra();
    setTimeout(abrirPasaporte, 120);
  };
  document.getElementById('btn-quitar-foto').onclick = () => {
    fotoTemporal = '';
    est.foto = '';
    guardarEstado();
    detenerCamara();
    cerrarModalExtra();
    toastMsg('Foto eliminada');
    setTimeout(abrirPasaporte, 200);
  };
  document.getElementById('btn-tomar-foto').onclick = () => {
    const video = document.getElementById('cam-preview');
    if (!video || !camStream) return;
    try {
      fotoTemporal = comprimirFotoCarnet(video);
      const cap = document.getElementById('cam-captura');
      video.classList.add('oculto');
      cap.src = fotoTemporal;
      cap.classList.remove('oculto');
      detenerCamara();
      document.getElementById('btn-guardar-foto').classList.remove('oculto');
      toastMsg('Foto lista. Guárdala para verla en el pasaporte.');
    } catch (e) {
      toastMsg('No se pudo capturar la foto.');
    }
  };
  document.getElementById('btn-reintentar-foto').onclick = () => {
    fotoTemporal = '';
    document.getElementById('btn-guardar-foto').classList.add('oculto');
    iniciarCamaraBienvenida();
  };
  document.getElementById('btn-guardar-foto').onclick = () => {
    if (fotoTemporal) est.foto = fotoTemporal;
    guardarEstado();
    detenerCamara();
    cerrarModalExtra();
    toastMsg('Foto actualizada');
    setTimeout(abrirPasaporte, 200);
  };
}

function abrirPasaporte() {
  if (typeof reproducirSonido === 'function') reproducirSonido('clic');
  if (!(est.nombre || '').trim()) {
    abrirBienvenidaNombre();
    return;
  }
  const t = totalPuntos();
  const r = rangoActual();
  const sig = RANGOS.find((x) => x.min > t);
  const nombre = escHtml(est.nombre);
  const foto = est.foto
    ? `<img class="pas-foto" src="${est.foto}" alt="Foto de ${nombre}">`
    : `<div class="pas-foto pas-foto-vacia" aria-hidden="true">${r.ic}</div>`;

  const faltanTxt = sig ? `faltan ${sig.min - t} para ${sig.nombre}` : '¡meta lograda!';
  abrirModalExtra(`
    <div class="pasaporte-vista">
      <div class="pasaporte-escena" id="pasaporte-escena">
        <div class="pasaporte-libro" id="pasaporte-libro" tabindex="0" role="button" aria-label="Abrir pasaporte" aria-expanded="false">
          <div class="pas-pagina">
            <div class="pas-hoja">
              <div class="pas-hoja-bandera" aria-hidden="true"><i></i><i></i><i></i></div>
              <div class="pas-hoja-head">
                <strong>REPÚBLICA DEL ECUADOR</strong>
                <span>Pasaporte del visitante · COBOLJA</span>
              </div>
              <div class="pas-hoja-top">
                ${foto}
                <div class="pas-datos">
                  <p class="pasaporte-label">Apellidos / Nombre</p>
                  <h3 class="pasaporte-nombre">${nombre}</h3>
                  <p class="pasaporte-label">Nacionalidad / Rango</p>
                  <p class="pasaporte-rango">${r.ic} ${r.nombre}</p>
                  <p class="pasaporte-pts"><strong>${t}</strong> / ${META} pts<br><small>${faltanTxt}</small></p>
                </div>
              </div>
              <p class="pas-hoja-nota">Documento digital del stand · Comunidad Andina · República del Ecuador</p>
            </div>
          </div>
          <div class="pas-tapa" aria-hidden="true">
            <div class="pas-tapa-frente">
              <div class="pas-tapa-piel"></div>
              <img class="pas-tapa-img" src="media/pasaporte-ecuador-tapa.png" alt="" decoding="async">
              <div class="pas-tapa-brillo"></div>
              <div class="pas-tapa-relieve"></div>
            </div>
            <div class="pas-tapa-atras" aria-hidden="true"></div>
          </div>
        </div>
        <p class="pas-hint" id="pas-hint"><i class="fa-solid fa-hand-pointer" aria-hidden="true"></i> Toca el pasaporte para abrirlo</p>
      </div>

      <div class="rangos">${RANGOS.map((x) => `<div class="${t >= x.min ? 'ok' : ''}"><span class="e">${x.ic}</span>${x.nombre}<br><small>${x.min} pts</small></div>`).join('')}</div>
      ${Object.keys(TOPES).map((k) => `<div class="pas-fila"><span>${NOMBRES_J[k]}</span><span class="bar"><i style="width:${((est.pts[k] || 0) / TOPES[k]) * 100}%"></i></span><span>${est.pts[k] || 0}/${TOPES[k]}</span></div>`).join('')}
      <p class="pas-nota">Cada actividad tiene un tope: para llegar a ${META} combina juegos, mapa e informe.</p>
      <div class="pas-acciones">
        ${t >= META ? '<button type="button" class="btn-pas-sol" id="p-dip">Mi diploma</button>' : ''}
        <button type="button" class="btn-pas" id="p-edit-nom">Editar nombre</button>
        <button type="button" class="btn-pas" id="p-edit-foto">Editar foto</button>
        <button type="button" class="btn-pas" id="p-son">${est.sonido ? 'Sonido activado' : 'Sonido desactivado'}</button>
        <button type="button" class="btn-pas" id="p-res">Reiniciar puntos</button>
      </div>
    </div>
  `, { ancho: true });

  const raiz = document.getElementById('modal-extra');
  if (raiz) raiz.classList.add('modal-pasaporte-libro');
  const libro = document.getElementById('pasaporte-libro');
  const hint = document.getElementById('pas-hint');
  const escena = document.getElementById('pasaporte-escena');
  if (libro) {
    let animando = false;
    const durMs = () => {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
      const raw = getComputedStyle(libro).getPropertyValue('--pas-open').trim() || '1.55s';
      if (raw.endsWith('ms')) return parseFloat(raw) || 1550;
      return (parseFloat(raw) || 1.55) * 1000;
    };
    const syncHint = () => {
      const abierto = libro.classList.contains('abierto');
      libro.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      libro.setAttribute('aria-label', abierto ? 'Cerrar pasaporte' : 'Abrir pasaporte');
      if (hint) {
        hint.innerHTML = abierto
          ? '<i class="fa-solid fa-book" aria-hidden="true"></i> Toca de nuevo para cerrarlo'
          : '<i class="fa-solid fa-hand-pointer" aria-hidden="true"></i> Toca el pasaporte para abrirlo';
        hint.classList.toggle('pas-hint-abierto', abierto);
      }
      if (escena) escena.classList.toggle('escena-abierta', abierto);
    };
    const toggle = () => {
      if (animando) return;
      animando = true;
      libro.classList.remove('pas-latido');
      const abrir = !libro.classList.contains('abierto');
      libro.classList.toggle('abriendo', abrir);
      libro.classList.toggle('cerrando', !abrir);
      // Forzar reflow para que la transición arranque limpia
      void libro.offsetWidth;
      libro.classList.toggle('abierto', abrir);
      syncHint();
      if (typeof reproducirSonido === 'function') reproducirSonido('clic');
      window.setTimeout(() => {
        libro.classList.remove('abriendo', 'cerrando');
        animando = false;
      }, durMs() + 80);
    };
    // Empieza cerrado; late un poco para invitar a tocarlo
    syncHint();
    setTimeout(() => { if (!libro.classList.contains('abierto')) libro.classList.add('pas-latido'); }, 550);
    libro.addEventListener('click', toggle);
    libro.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  const dip = document.getElementById('p-dip');
  if (dip) dip.onclick = () => abrirDiplomaStand();
  document.getElementById('p-edit-nom').onclick = () => {
    cerrarModalExtra();
    setTimeout(abrirEditarNombre, 120);
  };
  document.getElementById('p-edit-foto').onclick = () => {
    cerrarModalExtra();
    setTimeout(abrirEditarFoto, 120);
  };
  document.getElementById('p-son').onclick = (e) => {
    est.sonido = !est.sonido;
    guardarEstado();
    if (!est.sonido && typeof pararPaisaje === 'function') pararPaisaje();
    if (typeof audioHabilitado !== 'undefined') window.audioHabilitado = est.sonido;
    e.target.textContent = est.sonido ? 'Sonido activado' : 'Sonido desactivado';
  };
  document.getElementById('p-res').onclick = (e) => {
    if (e.target.dataset.c) {
      const nombreGuardado = est.nombre;
      const fotoGuardada = est.foto;
      est.pts = {}; est.regs = []; est.tabs = []; est.platos = []; est.tv = []; est.cond = false;
      est.nombre = nombreGuardado;
      est.foto = fotoGuardada;
      est.registroOk = true;
      guardarEstado();
      pintarPuntosUI();
      pintarLobbyPuntos();
      if (typeof pintarProgresoMapaLocal === 'function') pintarProgresoMapaLocal();
      cerrarModalExtra();
      toastMsg('Puntos reiniciados');
    } else {
      e.target.dataset.c = '1';
      e.target.textContent = 'Toca otra vez para confirmar';
    }
  };
}

function confetiStand() {
  let c = document.getElementById('confeti');
  if (!c) {
    c = document.createElement('canvas');
    c.id = 'confeti';
    c.className = 'oculto';
    document.body.appendChild(c);
  }
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  c.classList.remove('oculto');
  c.width = innerWidth;
  c.height = innerHeight;
  const g = c.getContext('2d');
  const col = ['#f2b705', '#1f4fa0', '#d6402b', '#2f9d73', '#fff'];
  const ps = Array.from({ length: 140 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.4,
    vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4,
    s: 5 + Math.random() * 7, c: col[Math.floor(Math.random() * col.length)], r: Math.random() * 6
  }));
  let f = 0;
  (function a() {
    g.clearRect(0, 0, c.width, c.height);
    ps.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.r += 0.12;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r);
      g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore();
    });
    if (++f < 240) requestAnimationFrame(a);
    else { g.clearRect(0, 0, c.width, c.height); c.classList.add('oculto'); }
  })();
}

function celebrarCondor() {
  if (typeof reproducirSonido === 'function') reproducirSonido('victoria');
  confetiStand();
  abrirModalExtra(`
    <div class="text-center">
      <div style="font-size:64px">🦅</div>
      <h3 class="font-titulo text-3xl font-extrabold mt-2">¡Eres Gran Cóndor!</h3>
      <p class="text-slate-600 mt-2">Superaste los ${META} puntos. Escribe tu nombre y descarga tu diploma.</p>
      <div class="pas-acciones justify-center mt-4">
        <button type="button" class="btn-pas-sol" id="c-dip">Crear mi diploma</button>
        <button type="button" class="btn-pas" id="c-seg">Seguir jugando</button>
      </div>
    </div>
  `);
  document.getElementById('c-dip').onclick = () => abrirDiplomaStand();
  document.getElementById('c-seg').onclick = () => cerrarModalExtra();
}

function dibujarDiplomaStand(cv, nombre) {
  const W = 1400, H = 990;
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#0b1a30'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#f2b705'; g.lineWidth = 10; g.strokeRect(36, 36, W - 72, H - 72);
  g.lineWidth = 2; g.strokeRect(58, 58, W - 116, H - 116);
  ['#ffdd00', '#0033a0', '#ef3340'].forEach((c, i) => {
    g.fillStyle = c; g.fillRect(W / 2 - 120, 110 + [0, 24, 40][i], 240, [24, 16, 16][i]);
  });
  g.textAlign = 'center';
  g.fillStyle = '#fff'; g.font = '800 34px Figtree,Arial';
  g.fillText('FERIA COBOLJA 2026 · STAND DE LA REPÚBLICA DEL ECUADOR', W / 2, 250);
  g.fillStyle = '#f2b705'; g.font = '800 84px "Bricolage Grotesque",Figtree,Arial';
  g.fillText('Diploma Gran Cóndor', W / 2, 370);
  g.fillStyle = '#c3d3ec'; g.font = '500 32px Figtree,Arial'; g.fillText('Se otorga a', W / 2, 450);
  g.fillStyle = '#fff';
  let fs = 78; const n = nombre || 'Explorador del Ecuador';
  g.font = `800 ${fs}px "Bricolage Grotesque",Figtree,Arial`;
  while (g.measureText(n).width > W - 300 && fs > 30) { fs -= 4; g.font = `800 ${fs}px "Bricolage Grotesque",Figtree,Arial`; }
  g.fillText(n, W / 2, 560);
  g.fillStyle = '#c3d3ec'; g.font = '500 30px Figtree,Arial';
  g.fillText(`por reunir ${totalPuntos()} puntos explorando el Ecuador.`, W / 2, 650);
  g.font = '110px serif'; g.fillText('🦅', W / 2, 800);
  g.font = '500 26px Figtree,Arial'; g.fillStyle = '#a9bddb';
  g.fillText(new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 900);
}

function abrirDiplomaStand() {
  abrirModalExtra(`
    <h3 class="font-titulo text-2xl font-extrabold">Tu diploma</h3>
    <label for="nom-dip" class="block font-bold mt-3 mb-1">Tu nombre</label>
    <input id="nom-dip" class="campo-nombre" maxlength="40" value="${(est.nombre || '').replace(/"/g, '&quot;')}" placeholder="Escribe tu nombre" autocomplete="name">
    <canvas id="dip-cv" class="diploma-prev" aria-label="Vista previa del diploma"></canvas>
    <button type="button" class="btn-pas-sol" id="dip-bajar">Descargar imagen</button>
  `, { ancho: true, foco: '#nom-dip' });
  const cv = document.getElementById('dip-cv');
  const pintar = () => dibujarDiplomaStand(cv, document.getElementById('nom-dip').value.trim());
  document.getElementById('nom-dip').addEventListener('input', (e) => {
    est.nombre = e.target.value; guardarEstado(); pintar();
  });
  pintar();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pintar);
  document.getElementById('dip-bajar').onclick = () => {
    cv.toBlob((b) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'Diploma-Gran-Condor.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  };
}

/* ---------- Cronología ---------- */
let cronoIdx = 0;
const REG_COLOR = { costa: '#e9a23b', sierra: '#8a5ca8', amazonia: '#2f9d73', galapagos: '#2ba3c9' };

function iniciarCrono() {
  const tira = document.getElementById('crono-tira');
  const det = document.getElementById('crono-det');
  if (!tira || !det || typeof CRONOLOGIA === 'undefined') return;
  tira.innerHTML = CRONOLOGIA.map((h, i) => `
    <button type="button" class="hito-c${i === 0 ? ' act' : ''}" data-i="${i}" role="tab" aria-selected="${i === 0}">
      <span class="ic">${h.ic}</span>
      <b>${h.a}</b>
      <span>${h.t}</span>
    </button>
  `).join('');
  tira.querySelectorAll('.hito-c').forEach((btn) => {
    btn.onclick = () => verHito(+btn.dataset.i, true);
  });
  const ant = document.getElementById('cr-ant');
  const sig = document.getElementById('cr-sig');
  if (ant) ant.onclick = () => verHito(Math.max(0, cronoIdx - 1), true);
  if (sig) sig.onclick = () => verHito(Math.min(CRONOLOGIA.length - 1, cronoIdx + 1), true);
  verHito(0, false);
}

function verHito(i, centrar) {
  cronoIdx = i;
  const h = CRONOLOGIA[i];
  const det = document.getElementById('crono-det');
  const tira = document.getElementById('crono-tira');
  if (!det || !h) return;
  det.style.borderLeftColor = REG_COLOR[h.reg] || '#f2b705';
  det.innerHTML = `<h3 class="font-titulo text-xl font-extrabold">${h.ic} ${h.t}</h3><p class="text-slate-600 mt-2">${h.d}</p><p class="text-sm font-bold text-slate-500 mt-2">${h.a}</p>`;
  tira.querySelectorAll('.hito-c').forEach((b, j) => {
    b.classList.toggle('act', j === i);
    b.setAttribute('aria-selected', j === i ? 'true' : 'false');
  });
  if (centrar) {
    const btn = tira.querySelector(`[data-i="${i}"]`);
    if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

/* ---------- Paisajes sonoros ---------- */
let ACX = null, ACX_master = null, paisajeAct = null;

function ctxExtra() {
  if (!ACX) {
    try {
      ACX = new (window.AudioContext || window.webkitAudioContext)();
      ACX_master = ACX.createGain();
      ACX_master.gain.value = 0.9;
      ACX_master.connect(ACX.destination);
    } catch (e) { return null; }
  }
  if (ACX.state === 'suspended') ACX.resume();
  return ACX;
}

function ruidoBuf(a) {
  const b = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource();
  s.buffer = b; s.loop = true;
  return s;
}

function notaExtra(f, t0, dur, tipo, vol, dest) {
  const a = ctxExtra(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = tipo || 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(0, a.currentTime + t0);
  g.gain.linearRampToValueAtTime(vol, a.currentTime + t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
  o.connect(g); g.connect(dest || ACX_master);
  o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + 0.05);
}

const PAISAJES = {
  andes(a, out) {
    const r = ruidoBuf(a), f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.6;
    const g = a.createGain(); g.gain.value = 0.13;
    r.connect(f); f.connect(g); g.connect(out); r.start();
    const esc = [587.33, 698.46, 784, 880, 1046.5];
    let i = 0;
    const timer = setInterval(() => {
      const fq = esc[i++ % esc.length], t = a.currentTime;
      notaExtra(fq, 0, 1.2, 'sine', 0.12, out);
    }, 1700);
    return () => { clearInterval(timer); try { r.stop(); } catch (e) {} };
  },
  costa(a, out) {
    const r = ruidoBuf(a), f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 650;
    const g = a.createGain(); g.gain.value = 0.16;
    r.connect(f); f.connect(g); g.connect(out); r.start();
    return () => { try { r.stop(); } catch (e) {} };
  },
  selva(a, out) {
    const r = ruidoBuf(a), f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2800;
    const g = a.createGain(); g.gain.value = 0.07;
    r.connect(f); f.connect(g); g.connect(out); r.start();
    const timer = setInterval(() => {
      if (Math.random() < 0.7) {
        const base = 520 + Math.random() * 260;
        for (let k = 0; k < 4; k++) notaExtra(base, k * 0.11, 0.07, 'square', 0.018, out);
      }
    }, 900);
    return () => { clearInterval(timer); try { r.stop(); } catch (e) {} };
  },
  islas(a, out) {
    const r = ruidoBuf(a), f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 360;
    const g = a.createGain(); g.gain.value = 0.15;
    r.connect(f); f.connect(g); g.connect(out); r.start();
    return () => { try { r.stop(); } catch (e) {} };
  }
};

function pararPaisaje() {
  if (!paisajeAct) return;
  const p = paisajeAct; paisajeAct = null;
  try { p.gain.gain.linearRampToValueAtTime(0.0001, ACX.currentTime + 0.4); } catch (e) {}
  setTimeout(() => { try { p.stop(); p.gain.disconnect(); } catch (e) {} }, 500);
  document.querySelectorAll('.audio-paisaje').forEach((b) => b.classList.remove('sona'));
}

function alternarPaisaje(id) {
  if (!est.sonido) { toastMsg('Activa el sonido en el pasaporte o el botón de audio'); return; }
  const ya = paisajeAct && paisajeAct.id === id;
  pararPaisaje();
  if (ya) return;
  const a = ctxExtra();
  if (!a) { toastMsg('Tu navegador no permite reproducir audio.'); return; }
  const gain = a.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(1, a.currentTime + 0.6);
  gain.connect(ACX_master);
  const stop = PAISAJES[id](a, gain);
  paisajeAct = { id, stop, gain };
  const btn = document.querySelector(`.audio-paisaje[data-id="${id}"]`);
  if (btn) btn.classList.add('sona');
}

function iniciarAudiosPaisaje() {
  const box = document.getElementById('audios-paisaje');
  if (!box || typeof AUDIOS === 'undefined') return;
  box.innerHTML = AUDIOS.map((a) => `
    <button type="button" class="audio-paisaje" data-id="${a.id}" aria-pressed="false">
      <span class="bt" style="background:${a.col}">${a.ic}</span>
      <span><b>${a.t}</b><small>${a.d}</small></span>
      <span class="ondas" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    </button>
  `).join('');
  box.querySelectorAll('.audio-paisaje').forEach((b) => {
    b.onclick = () => {
      alternarPaisaje(b.dataset.id);
      box.querySelectorAll('.audio-paisaje').forEach((x) => x.setAttribute('aria-pressed', x.classList.contains('sona') ? 'true' : 'false'));
    };
  });
}

/* ---------- Datos expandibles + gráficos ---------- */
function renderizarDatosMejorados() {
  const grid = document.getElementById('grid-10-datos');
  if (!grid || typeof diezDatosImpactantes === 'undefined') return;
  const iconos = ['👥', '🗺️', '💵', '❤️', '📖', '📈', '🌱', '🏅', '🚢', '🏔️'];
  grid.className = 'datos-grid';
  grid.innerHTML = diezDatosImpactantes.map((d, i) => `
    <button type="button" class="dato" aria-expanded="false" data-i="${i}">
      <span class="ic">${iconos[i] || '✨'}</span>
      <h4>${d.titulo}</h4>
      <b>${d.cifra}</b>
      <small>${d.sub}</small>
      <span class="det">${d.detalle}</span>
    </button>
  `).join('');
  grid.querySelectorAll('.dato').forEach((btn) => {
    btn.onclick = () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      grid.querySelectorAll('.dato').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    };
  });
}

function pintarGraficosStand() {
  const cont = document.getElementById('grid-graficos');
  if (!cont || typeof GRAFICOS === 'undefined') return;
  const keys = Object.keys(GRAFICOS);
  cont.innerHTML = keys.map((k) => {
    const g = GRAFICOS[k];
    const bars = g.datos.map((d, i) => {
      const val = Array.isArray(d) ? d[1] : 0;
      const label = Array.isArray(d) ? d[0] : '';
      const col = Array.isArray(d) && d[2] && typeof d[2] === 'string' && d[2].startsWith('#') ? d[2] : '#1f4fa0';
      const max = Math.max(...g.datos.map((x) => (Array.isArray(x) ? (typeof x[2] === 'number' ? Math.max(x[1], x[2]) : x[1]) : 0)), 1);
      const pct = Math.min(100, (val / max) * 100);
      return `<div class="g-bar-row"><span>${label}</span><div class="g-bar"><i style="width:${pct}%;background:${col}"></i></div><b>${String(val).replace('.', ',')}</b></div>`;
    }).join('');
    return `<article class="graf"><h3>${g.titulo}</h3><p class="nota">${g.nota}</p>${bars}</article>`;
  }).join('');
}

/* ---------- Arranque extras ---------- */
function iniciarExtras() {
  // Restaura progreso de mapa desde localStorage
  if (Array.isArray(est.regs) && typeof regionesVisitadas !== 'undefined') {
    est.regs.forEach((r) => regionesVisitadas.add(r));
    if (typeof actualizarProgresoMapa === 'function') actualizarProgresoMapa();
  }
  if (typeof totalPuntos === 'function') {
    try { puntajeGlobal = totalPuntos(); } catch (e) { /* ignore */ }
  }
  try {
    if (typeof audioHabilitado !== 'undefined') audioHabilitado = !!est.sonido;
    const icono = document.getElementById('icono-audio');
    if (icono) icono.className = est.sonido ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark text-slate-400';
  } catch (e) { /* ignore */ }
  pintarPuntosUI();
  pintarLobbyPuntos();
  iniciarCrono();
  iniciarAudiosPaisaje();
  renderizarDatosMejorados();
  pintarGraficosStand();
  const btnPas = document.getElementById('btn-pasaporte');
  if (btnPas) btnPas.addEventListener('click', abrirPasaporte);
  ['dato-prev', 'dato-next', 'dato-toggle'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add('oculto');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const bien = document.getElementById('modal-extra');
      if (bien && bien.classList.contains('modal-bienvenida') && !(est.nombre || '').trim()) return;
      cerrarModalExtra();
    }
  });
  if (!(est.nombre || '').trim()) {
    setTimeout(abrirBienvenidaNombre, 350);
  }
}

window.abrirBienvenidaNombre = abrirBienvenidaNombre;
window.abrirEditarNombre = abrirEditarNombre;
window.abrirEditarFoto = abrirEditarFoto;
window.abrirPasaporte = abrirPasaporte;

document.addEventListener('DOMContentLoaded', () => {
  // Deja que codigo.js monte primero; luego refuerza UI
  setTimeout(iniciarExtras, 80);
});
