let panelAbierto = true;
let permisoEspecialLocal = false;
let adminAutorizado = false;
let sincronizado = false;
let emergenciaRemotaLocal = false;

// Variables para evitar duplicados en el historial
let ultimoEstadoPorton = null;
let ultimoFoto = null;
let ultimoAuto = null;
let ultimoBoton = null;
let ultimoPIR = null;
let ultimoHorario = null;
let ultimoPermisoEspecial = null;
let ultimoEmergencia = null;

function togglePanel() {
    panelAbierto = !panelAbierto;
    const content = document.getElementById('panelContent');
    const arrow = document.getElementById('panelArrow');
    
    if (panelAbierto) {
        if (content) content.classList.remove('collapsed');
        if (arrow) arrow.classList.remove('collapsed');
    } else {
        if (content) content.classList.add('collapsed');
        if (arrow) arrow.classList.add('collapsed');
    }
}

function updateConnectionStatus(connected) {
    const statusText = document.getElementById('statusText');
    if (statusText) {
        if (connected) {
            statusText.innerHTML = '<span class="status-led green"></span> Conectado';
        } else {
            statusText.innerHTML = '<span class="status-led red"></span> Desconectado';
        }
    }
}

function updatePortonUI(estado) {
    const textoDiv = document.getElementById('estadoPorton');
    const puerta = document.getElementById('puerta');
    if (!textoDiv || !puerta) return;
    
    console.log("🚪 Actualizando UI del portón:", estado);
    
    if (estado === "ABIERTO") {
        textoDiv.innerHTML = '✅ PORTÓN ABIERTO';
        textoDiv.className = 'gate-status abierto';
        puerta.style.left = 'calc(100% - 90px)';
        if (ultimoEstadoPorton !== "ABIERTO") {
            registrarEvento('PORTÓN_ABIERTO', 'El portón se abrió');
            ultimoEstadoPorton = "ABIERTO";
        }
    } else if (estado === "CERRADO") {
        textoDiv.innerHTML = '🔒 PORTÓN CERRADO';
        textoDiv.className = 'gate-status cerrado';
        puerta.style.left = '12px';
        if (ultimoEstadoPorton !== "CERRADO") {
            registrarEvento('PORTÓN_CERRADO', 'El portón se cerró');
            ultimoEstadoPorton = "CERRADO";
        }
    } else {
        textoDiv.innerHTML = '⚠️ PORTÓN ENTREABIERTO';
        textoDiv.className = 'gate-status intermedio';
        puerta.style.left = 'calc(50% - 45px)';
        if (ultimoEstadoPorton !== "INTERMEDIO") {
            registrarEvento('PORTÓN_INTERMEDIO', 'Portón en posición intermedia');
            ultimoEstadoPorton = "INTERMEDIO";
        }
    }
}

function updateSensores(data) {
    const sensorAbiertoVal = document.getElementById('sensorAbiertoVal');
    const sensorCerradoVal = document.getElementById('sensorCerradoVal');
    const abiertoBox = document.getElementById('sensorAbiertoBox');
    const cerradoBox = document.getElementById('sensorCerradoBox');
    
    if (sensorAbiertoVal && abiertoBox) {
        if (data.abierto === true) {
            sensorAbiertoVal.innerHTML = '✅ ACTIVADO';
            abiertoBox.classList.add('activo');
        } else if (data.abierto === false) {
            sensorAbiertoVal.innerHTML = '⚪ INACTIVO';
            abiertoBox.classList.remove('activo');
        }
    }
    
    if (sensorCerradoVal && cerradoBox) {
        if (data.cerrado === true) {
            sensorCerradoVal.innerHTML = '✅ ACTIVADO';
            cerradoBox.classList.add('activo');
        } else if (data.cerrado === false) {
            sensorCerradoVal.innerHTML = '⚪ INACTIVO';
            cerradoBox.classList.remove('activo');
        }
    }
}

function isHorarioLaboral() {
    const ahora = new Date();
    const diaSemana = ahora.getDay();
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();
    
    if (diaSemana >= 1 && diaSemana <= 5) {
        const minutosActuales = hora * 60 + minutos;
        const minutosInicio = 7 * 60 + 30;
        const minutosFin = 14 * 60 + 0;
        return (minutosActuales >= minutosInicio && minutosActuales < minutosFin);
    }
    return false;
}

function actualizarHabilitacionControles() {
    const toggles = ['toggleFoto', 'toggleAuto', 'toggleBoton', 'togglePIR', 'toggleHorario'];
    const btnPermiso = document.getElementById('btnPermiso');
    const modoHorarioActivo = document.getElementById('toggleHorario').classList.contains('active');
    
    if (!sincronizado) {
        toggles.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('disabled');
                el.onclick = null;
            }
        });
        if (btnPermiso) {
            btnPermiso.disabled = true;
            btnPermiso.classList.add('disabled');
        }
        return;
    }
    
    let habilitado = false;
    
    if (!modoHorarioActivo) {
        habilitado = true;
    } else if (permisoEspecialLocal === true) {
        habilitado = true;
    } else if (isHorarioLaboral()) {
        habilitado = true;
    } else {
        habilitado = false;
    }
    
    if (habilitado) {
        toggles.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('disabled');
                if (id === 'toggleFoto') el.onclick = () => toggleSensor('foto');
                else if (id === 'toggleAuto') el.onclick = () => toggleModoAuto();
                else if (id === 'toggleBoton') el.onclick = () => toggleBotonFisico();
                else if (id === 'togglePIR') el.onclick = () => togglePIR();
                else if (id === 'toggleHorario') el.onclick = () => toggleHorario();
            }
        });
        if (btnPermiso) {
            btnPermiso.disabled = true;
            btnPermiso.classList.add('disabled');
        }
    } else {
        toggles.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('disabled');
                el.onclick = null;
            }
        });
        if (btnPermiso) {
            btnPermiso.disabled = false;
            btnPermiso.classList.remove('disabled');
        }
    }
}

// ==================== FUNCIÓN PRINCIPAL QUE PROCESA LOS MENSAJES MQTT ====================

function procesarMensajeMQTT(topic, mensaje) {
    console.log("📨 Topic:", topic);
    console.log("📦 Mensaje completo:", mensaje);
    
    if (topic === "porton/estado") {
        // Actualizar estado del portón
        if (mensaje.estado) {
            updatePortonUI(mensaje.estado);
        }
        
        // ACTUALIZAR TOGGLES - Usando los mismos IDs que el HTML
        const toggleFoto = document.getElementById("toggleFoto");
        if (toggleFoto) {
            if (mensaje.fotoHabilitado === true) {
                toggleFoto.classList.add('active');
            } else {
                toggleFoto.classList.remove('active');
            }
            console.log("📷 Foto actualizada:", mensaje.fotoHabilitado);
        } else {
            console.error("❌ No encuentro el elemento 'toggleFoto'");
        }
        
        const toggleAuto = document.getElementById("toggleAuto");
        if (toggleAuto) {
            if (mensaje.modoAuto === true) {
                toggleAuto.classList.add('active');
            } else {
                toggleAuto.classList.remove('active');
            }
            console.log("🤖 Auto actualizado:", mensaje.modoAuto);
        }
        
        const toggleBoton = document.getElementById("toggleBoton");
        if (toggleBoton) {
            if (mensaje.botonFisicoHabilitado === true) {
                toggleBoton.classList.add('active');
            } else {
                toggleBoton.classList.remove('active');
            }
            console.log("🎮 Botón actualizado:", mensaje.botonFisicoHabilitado);
        }
        
        const togglePIR = document.getElementById("togglePIR");
        if (togglePIR) {
            if (mensaje.pirHabilitado === true) {
                togglePIR.classList.add('active');
            } else {
                togglePIR.classList.remove('active');
            }
            console.log("🚪 PIR actualizado:", mensaje.pirHabilitado);
        }
        
        const toggleHorario = document.getElementById("toggleHorario");
        if (toggleHorario) {
            if (mensaje.modoHorario === true) {
                toggleHorario.classList.add('active');
            } else {
                toggleHorario.classList.remove('active');
            }
            console.log("⏰ Horario actualizado:", mensaje.modoHorario);
        }
        
        // Actualizar badges
        const chapaBadge = document.getElementById('chapaBadge');
        if (chapaBadge) {
            chapaBadge.innerHTML = mensaje.chapaActiva ? '🔐 Chapa: ON' : '🔐 Chapa: OFF';
        }
        
        const mqttBadge = document.getElementById('mqttBadge');
        if (mqttBadge) {
            mqttBadge.innerHTML = '🌍 MQTT: Conectado';
        }
        
        const emergenciaBadge = document.getElementById('emergenciaBadge');
        if (emergenciaBadge) {
            if (mensaje.emergenciaActiva) {
                emergenciaBadge.innerHTML = '🛑 EMERGENCIA ACTIVA';
                emergenciaBadge.style.background = '#e74c3c';
            } else {
                emergenciaBadge.innerHTML = '🛑 Emergencia: OFF';
                emergenciaBadge.style.background = '#e67e22';
            }
        }
        
        // Sincronizar permiso especial
        if (mensaje.permisoEspecial === true && permisoEspecialLocal === false) {
            permisoEspecialLocal = true;
            console.log("🔑 PERMISO ESPECIAL ACTIVADO");
        } else if (mensaje.permisoEspecial === false && permisoEspecialLocal === true) {
            permisoEspecialLocal = false;
            console.log("🔒 PERMISO ESPECIAL DESACTIVADO");
        }
        
        // Actualizar estado de sincronización
        if (!sincronizado) {
            sincronizado = true;
            console.log("✅ Dashboard sincronizado con ESP32");
        }
        
        // Actualizar habilitación de controles
        actualizarHabilitacionControles();
        
        // Actualizar UI del permiso especial
        const permisoEstado = document.getElementById('permisoEstado');
        if (permisoEstado) {
            if (permisoEspecialLocal) {
                permisoEstado.innerHTML = `🔑 Permiso especial activo`;
            } else {
                permisoEstado.innerHTML = '';
            }
        }
        
        // Registrar eventos en el historial
        if (mensaje.emergenciaActiva !== undefined && mensaje.emergenciaActiva !== ultimoEmergencia) {
            if (mensaje.emergenciaActiva) {
                registrarEvento('EMERGENCIA', 'Emergencia activada');
                mostrarEmergencia(true);
            } else {
                registrarEvento('EMERGENCIA', 'Emergencia desactivada');
                mostrarEmergencia(false);
            }
            ultimoEmergencia = mensaje.emergenciaActiva;
        }
    }
    
    if (topic === "porton/sensores") {
        updateSensores(mensaje);
    }
}

// ==================== RESTO DE FUNCIONES ====================

function updateConfiguracion(data) {
    // Redirigir a la función principal para mantener compatibilidad
    procesarMensajeMQTT("porton/estado", data);
}

function actualizarTimestamp() {
    const ts = document.getElementById('timestamp');
    if (ts) {
        ts.innerHTML = `🕐 Última actualización: ${new Date().toLocaleTimeString()}`;
    }
}

function iniciarReloj() {
    function actualizarReloj() {
        const relojDiv = document.getElementById('reloj');
        if (relojDiv) {
            const ahora = new Date();
            const hora = ahora.getHours().toString().padStart(2, '0');
            const minutos = ahora.getMinutes().toString().padStart(2, '0');
            const segundos = ahora.getSeconds().toString().padStart(2, '0');
            const fecha = ahora.toLocaleDateString('es-ES');
            relojDiv.innerHTML = `${fecha} ${hora}:${minutos}:${segundos}`;
        }
    }
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
}

function configurarBotones() {
    const btnAbrir = document.getElementById('btnAbrir');
    const btnCerrar = document.getElementById('btnCerrar');
    
    if (btnAbrir) btnAbrir.onclick = () => enviarComando("ABRIR");
    if (btnCerrar) btnCerrar.onclick = () => enviarComando("CERRAR");
}

function toggleSensor(sensor) {
    if (sensor === 'foto') enviarComando("TOGGLE_FOTO");
}

function toggleModoAuto() {
    enviarComando("TOGGLE_AUTO");
}

function toggleBotonFisico() {
    enviarComando("TOGGLE_BOTON");
}

function togglePIR() {
    enviarComando("TOGGLE_PIR");
}

function toggleHorario() {
    enviarComando("TOGGLE_HORARIO");
}

function activarPermisoConTiempo() {
    let minutos = document.getElementById('permisoMinutos').value;
    console.log("🔑 Activando permiso especial por", minutos, "minutos");
    enviarComando(`ACTIVAR_PERMISO:${minutos}`);
    permisoEspecialLocal = true;
    mostrarMensaje(`🔑 Permiso especial activado por ${minutos} minutos`);
    setTimeout(() => {
        actualizarHabilitacionControles();
    }, 500);
}

function mostrarAdmin() {
    let pass = prompt("🔐 Ingrese contraseña de administrador:");
    if (pass === "12345") {
        adminAutorizado = true;
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminInfo').innerHTML = '✅ Autorizado - Puede abrir una vez';
        mostrarMensaje("🔓 Acceso ADMIN concedido (una vez)");
    } else {
        alert("❌ Contraseña incorrecta");
    }
}

function abrirTemporalAdmin() {
    if (!adminAutorizado) {
        alert("❌ No autorizado. Ingrese la contraseña primero.");
        return;
    }
    enviarComando("ADMIN_ABRIR");
    mostrarMensaje("🔓 Portón abierto por 1 minuto");
    document.getElementById('adminPanel').style.display = 'none';
    adminAutorizado = false;
    document.getElementById('adminInfo').innerHTML = '🔒 Panel oculto - Ingrese contraseña';
}

function activarEmergenciaRemotaUI() {
    enviarComando("ACTIVAR_EMERGENCIA_REMOTA");
    mostrarMensaje("🛑 Activando emergencia remota...");
}

function desactivarEmergenciaRemotaUI() {
    const contrasena = document.getElementById('contrasenaEmergencia').value;
    enviarComando(`DESACTIVAR_EMERGENCIA_REMOTA:${contrasena}`);
    if (contrasena === "123") {
        mostrarMensaje("✅ Emergencia remota desactivada");
        setTimeout(() => {
            location.reload();
        }, 1500);
    } else {
        document.getElementById('errorContrasena').innerHTML = '❌ Contraseña incorrecta';
    }
}

let emergenciaActivaLocal = false;

function mostrarEmergencia(mostrar) {
    const overlay = document.getElementById('emergenciaOverlay');
    if (mostrar) {
        if (!emergenciaActivaLocal) {
            overlay.style.display = 'flex';
            emergenciaActivaLocal = true;
            if (emergenciaRemotaLocal) {
                document.getElementById('emergenciaContrasena').style.display = 'block';
                document.getElementById('btnRecargarEmergencia').style.display = 'none';
            } else {
                document.getElementById('emergenciaContrasena').style.display = 'none';
                document.getElementById('btnRecargarEmergencia').style.display = 'block';
                setTimeout(() => {
                    location.reload();
                }, 3000);
            }
        }
    } else {
        if (emergenciaActivaLocal) {
            overlay.style.display = 'none';
            emergenciaActivaLocal = false;
        }
    }
}

function updateEsp32Status(online) {
    const esp32Status = document.getElementById('esp32StatusText');
    if (esp32Status) {
        if (online) {
            esp32Status.innerHTML = '<span class="status-led green"></span> Conectado';
        } else {
            esp32Status.innerHTML = '<span class="status-led red"></span> Conectando...';
        }
    }
}

function iniciarHeartbeatCheck() {
    setInterval(() => {
        if (ultimoHeartbeat > 0 && Date.now() - ultimoHeartbeat > CONFIG.tiempos.heartbeatTimeout) {
            updateEsp32Status(false);
        }
    }, 5000);
}

setInterval(() => {
    if (sincronizado) {
        actualizarHabilitacionControles();
    }
}, 60000);

window.addEventListener('load', () => {
    setTimeout(() => {
        if (sincronizado) {
            actualizarHabilitacionControles();
        }
    }, 2000);
});

// ==================== HISTORIAL DE EVENTOS ====================

function registrarEvento(tipo, detalle) {
    const evento = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        fecha: new Date().toLocaleString('es-ES'),
        tipo: tipo,
        detalle: detalle
    };
    
    let historial = JSON.parse(localStorage.getItem('historial_porton') || '[]');
    historial.unshift(evento);
    if (historial.length > 500) historial.pop();
    localStorage.setItem('historial_porton', JSON.stringify(historial));
    
    actualizarTablaHistorial();
    
    if (document.getElementById('soundEnabled')?.checked) {
        const audio = document.getElementById('notificationSound');
        if (audio) audio.play().catch(e => console.log('Error:', e));
    }
}

function actualizarTablaHistorial() {
    const tbody = document.getElementById('historyBody');
    if (!tbody) return;
    
    const historial = JSON.parse(localStorage.getItem('historial_porton') || '[]');
    const filtroTipo = document.getElementById('eventTypeFilter')?.value || 'all';
    const fechaDesde = document.getElementById('dateFrom')?.value;
    const fechaHasta = document.getElementById('dateTo')?.value;
    
    let eventosFiltrados = [...historial];
    
    if (filtroTipo !== 'all') {
        eventosFiltrados = eventosFiltrados.filter(e => e.tipo === filtroTipo);
    }
    
    if (fechaDesde) {
        eventosFiltrados = eventosFiltrados.filter(e => e.timestamp >= fechaDesde);
    }
    if (fechaHasta) {
        eventosFiltrados = eventosFiltrados.filter(e => e.timestamp <= fechaHasta + 'T23:59:59');
    }
    
    if (eventosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">No hay eventos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = eventosFiltrados.map(e => `
        <tr>
            <td>${e.fecha}</td>
            <td><span class="event-badge">${e.tipo}</span></td>
            <td>${e.detalle}</td>
        </tr>
    `).join('');
    
    actualizarEstadisticasHistorial(historial);
}

function actualizarEstadisticasHistorial(historial) {
    const totalEvents = document.getElementById('totalEvents');
    const monthEvents = document.getElementById('monthEvents');
    const avgDaily = document.getElementById('avgDaily');
    
    if (totalEvents) totalEvents.innerHTML = historial.length;
    
    if (monthEvents) {
        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const añoActual = ahora.getFullYear();
        const eventosMes = historial.filter(e => {
            const fecha = new Date(e.timestamp);
            return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
        });
        monthEvents.innerHTML = eventosMes.length;
    }
    
    if (avgDaily && historial.length > 0) {
        const primerEvento = new Date(historial[historial.length - 1].timestamp);
        const dias = Math.ceil((Date.now() - primerEvento) / (1000 * 60 * 60 * 24)) || 1;
        const promedio = (historial.length / dias).toFixed(1);
        avgDaily.innerHTML = promedio;
    }
}

function filterHistory() {
    actualizarTablaHistorial();
}

function resetFilters() {
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    const eventTypeFilter = document.getElementById('eventTypeFilter');
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';
    if (eventTypeFilter) eventTypeFilter.value = 'all';
    actualizarTablaHistorial();
}

function clearEventsWithPassword() {
    const password = prompt("🔐 Ingrese la contraseña de administrador para eliminar el historial:");
    if (password === "12345") {
        if (confirm('¿Está seguro de eliminar TODO el historial de eventos? Esta acción no se puede deshacer.')) {
            localStorage.setItem('historial_porton', '[]');
            actualizarTablaHistorial();
            mostrarMensaje('🗑️ Historial eliminado correctamente');
        }
    } else if (password !== null) {
        alert("❌ Contraseña incorrecta");
    }
}

function mostrarMensaje(msg, duration = 3000) {
    const msgDiv = document.getElementById('mensajeFlotante');
    if (msgDiv) {
        msgDiv.innerHTML = msg;
        msgDiv.style.display = 'block';
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, duration);
    }
}

console.log("✅ ui.js cargado correctamente - Versión corregida");
