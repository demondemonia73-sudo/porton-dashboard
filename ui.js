let panelAbierto = true;
let permisoEspecialLocal = false;
let adminAutorizado = false;

function togglePanel() {
    panelAbierto = !panelAbierto;
    const content = document.getElementById('panelContent');
    const arrow = document.getElementById('panelArrow');
    
    if (panelAbierto) {
        content.classList.remove('collapsed');
        arrow.classList.remove('collapsed');
    } else {
        content.classList.add('collapsed');
        arrow.classList.add('collapsed');
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
    
    if (estado === "ABIERTO") {
        textoDiv.innerHTML = '✅ PORTÓN ABIERTO';
        textoDiv.className = 'gate-status abierto';
        puerta.style.left = 'calc(100% - 90px)';
    } else if (estado === "CERRADO") {
        textoDiv.innerHTML = '🔒 PORTÓN CERRADO';
        textoDiv.className = 'gate-status cerrado';
        puerta.style.left = '12px';
    } else {
        textoDiv.innerHTML = '⚠️ PORTÓN ENTREABIERTO';
        textoDiv.className = 'gate-status intermedio';
        puerta.style.left = 'calc(50% - 45px)';
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

// ==================== LÓGICA DE HORARIO (MISMA QUE EL ESP32) ====================

function isHorarioLaboral() {
    const ahora = new Date();
    const diaSemana = ahora.getDay();     // 0=Domingo, 1=Lunes...6=Sábado
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();
    
    // Solo Lunes a Viernes (1 a 5)
    if (diaSemana >= 1 && diaSemana <= 5) {
        const minutosActuales = hora * 60 + minutos;
        const minutosInicio = 7 * 60 + 30;   // 7:30 AM
        const minutosFin = 14 * 60 + 0;       // 2:00 PM
        return (minutosActuales >= minutosInicio && minutosActuales < minutosFin);
    }
    return false;
}

// ==================== CONTROL DE HABILITACIÓN DE TOGGLES ====================

function actualizarHabilitacionControles() {
    const toggles = ['toggleFoto', 'toggleAuto', 'toggleBoton', 'togglePIR', 'toggleHorario'];
    const btnPermiso = document.getElementById('btnPermiso');
    const modoHorarioActivo = document.getElementById('toggleHorario').classList.contains('active');
    
    let habilitado = false;
    
    // Lógica IDÉNTICA al ESP32
    if (!modoHorarioActivo) {
        habilitado = true;                      // Modo horario desactivado manualmente
    } else if (permisoEspecialLocal) {
        habilitado = true;                      // Permiso especial activo
    } else if (isHorarioLaboral()) {
        habilitado = true;                      // Dentro del horario laboral
    } else {
        habilitado = false;                     // Fuera del horario → DESHABILITADO
    }
    
    console.log("📅 Horario laboral:", isHorarioLaboral());
    console.log("🔓 Controles habilitados:", habilitado);
    
    if (habilitado) {
        toggles.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('disabled');
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
            }
        });
        if (btnPermiso) {
            btnPermiso.disabled = false;
            btnPermiso.classList.remove('disabled');
        }
    }
}

// ==================== FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN ====================

function updateConfiguracion(data) {
    console.log("🔄 Actualizando configuración:", data);
    
    // Actualizar permiso especial local
    if (data.permisoEspecial === true) {
        permisoEspecialLocal = true;
    } else if (data.permisoEspecial === false && permisoEspecialLocal === true) {
        permisoEspecialLocal = false;
    }
    
    // ===== FOTOELÉCTRICA =====
    const toggleFoto = document.getElementById('toggleFoto');
    const fotoBox = document.getElementById('fotoBox');
    if (toggleFoto) {
        if (data.fotoHabilitado === true) {
            toggleFoto.classList.add('active');
            if (fotoBox) fotoBox.classList.add('activo');
            console.log("📷 Foto -> ACTIVADO");
        } else if (data.fotoHabilitado === false) {
            toggleFoto.classList.remove('active');
            if (fotoBox) fotoBox.classList.remove('activo');
            console.log("📷 Foto -> DESACTIVADO");
        }
    }
    
    // ===== MODO AUTOMÁTICO =====
    const toggleAuto = document.getElementById('toggleAuto');
    const autoBox = document.getElementById('autoBox');
    if (toggleAuto) {
        if (data.modoAuto === true) {
            toggleAuto.classList.add('active');
            if (autoBox) autoBox.classList.add('activo');
            console.log("🤖 Auto -> ACTIVADO");
        } else if (data.modoAuto === false) {
            toggleAuto.classList.remove('active');
            if (autoBox) autoBox.classList.remove('activo');
            console.log("🤖 Auto -> DESACTIVADO");
        }
    }
    
    // ===== BOTÓN FÍSICO =====
    const toggleBoton = document.getElementById('toggleBoton');
    const botonBadge = document.getElementById('botonBadge');
    if (toggleBoton) {
        if (data.botonFisicoHabilitado === true) {
            toggleBoton.classList.add('active');
            if (botonBadge) botonBadge.innerHTML = '🎮 Botón: ON';
            console.log("🎮 Botón -> ACTIVADO");
        } else if (data.botonFisicoHabilitado === false) {
            toggleBoton.classList.remove('active');
            if (botonBadge) botonBadge.innerHTML = '🎮 Botón: OFF';
            console.log("🎮 Botón -> DESACTIVADO");
        }
    }
    
    // ===== SENSORES PIR =====
    const togglePIR = document.getElementById('togglePIR');
    const pirBadge = document.getElementById('pirBadge');
    if (togglePIR) {
        if (data.pirHabilitado === true) {
            togglePIR.classList.add('active');
            if (pirBadge) pirBadge.innerHTML = '🚪 PIR: ON';
            console.log("🚪 PIR -> ACTIVADO");
        } else if (data.pirHabilitado === false) {
            togglePIR.classList.remove('active');
            if (pirBadge) pirBadge.innerHTML = '🚪 PIR: OFF';
            console.log("🚪 PIR -> DESACTIVADO");
        }
    }
    
    // ===== MODO HORARIO =====
    const toggleHorario = document.getElementById('toggleHorario');
    const horarioBadge = document.getElementById('horarioBadge');
    if (toggleHorario) {
        if (data.modoHorario === true) {
            toggleHorario.classList.add('active');
            if (horarioBadge) horarioBadge.innerHTML = '⏰ Horario: ON';
            console.log("⏰ Horario -> ACTIVADO");
        } else if (data.modoHorario === false) {
            toggleHorario.classList.remove('active');
            if (horarioBadge) horarioBadge.innerHTML = '⏰ Horario: OFF';
            console.log("⏰ Horario -> DESACTIVADO");
        }
    }
    
    // ===== ACTUALIZAR HABILITACIÓN DE CONTROLES =====
    actualizarHabilitacionControles();
    
    // ===== PERMISO ESPECIAL UI =====
    const permisoEstado = document.getElementById('permisoEstado');
    if (permisoEstado) {
        if (permisoEspecialLocal) {
            permisoEstado.innerHTML = `🔑 Permiso especial activo`;
        } else {
            permisoEstado.innerHTML = '';
        }
    }
    
    // ===== BADGES =====
    const chapaBadge = document.getElementById('chapaBadge');
    if (chapaBadge && data.chapa !== undefined) {
        chapaBadge.innerHTML = data.chapa ? '🔐 Chapa: ON' : '🔐 Chapa: OFF';
    }
    
    const mqttBadge = document.getElementById('mqttBadge');
    if (mqttBadge && data.mqtt !== undefined) {
        mqttBadge.innerHTML = data.mqtt ? '🌍 MQTT: Conectado' : '🌍 MQTT: Desconectado';
    }
    
    const emergenciaBadge = document.getElementById('emergenciaBadge');
    if (emergenciaBadge && data.emergencia !== undefined) {
        emergenciaBadge.innerHTML = data.emergencia ? '🛑 EMERGENCIA ACTIVA' : '🛑 Emergencia: OFF';
        emergenciaBadge.style.background = data.emergencia ? '#e74c3c' : '#e67e22';
    }
    
    console.log("✅ updateConfiguracion completado");
}

// ==================== VERIFICACIÓN PERIÓDICA DEL HORARIO ====================

function verificarYActualizarEstado() {
    const horarioActivo = isHorarioLaboral();
    const modoHorarioActivo = document.getElementById('toggleHorario').classList.contains('active');
    
    let controlesHabilitados = false;
    
    if (!modoHorarioActivo) {
        controlesHabilitados = true;
    } else if (permisoEspecialLocal) {
        controlesHabilitados = true;
    } else if (horarioActivo) {
        controlesHabilitados = true;
    } else {
        controlesHabilitados = false;
    }
    
    const toggles = ['toggleFoto', 'toggleAuto', 'toggleBoton', 'togglePIR', 'toggleHorario'];
    const btnPermiso = document.getElementById('btnPermiso');
    
    if (controlesHabilitados) {
        toggles.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('disabled');
        });
        if (btnPermiso) {
            btnPermiso.disabled = true;
            btnPermiso.classList.add('disabled');
        }
    } else {
        toggles.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('disabled');
        });
        if (btnPermiso) {
            btnPermiso.disabled = false;
            btnPermiso.classList.remove('disabled');
        }
    }
    
    console.log("📅 Verificación periódica - Controles habilitados:", controlesHabilitados);
}

// ==================== RESTO DE FUNCIONES ====================

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
    enviarComando(`ACTIVAR_PERMISO:${minutos}`);
    permisoEspecialLocal = true;
    mostrarMensaje(`🔑 Permiso especial activado por ${minutos} minutos`);
    setTimeout(() => actualizarHabilitacionControles(), 500);
}

// ==================== FUNCIONES ADMIN ====================

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

// ==================== EMERGENCIA ====================

function activarEmergenciaRemotaUI() {
    enviarComando("ACTIVAR_EMERGENCIA_REMOTA");
    mostrarMensaje("🛑 Activando emergencia remota...");
    setTimeout(() => {
        location.reload();
    }, 2000);
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
            document.getElementById('emergenciaContrasena').style.display = 'block';
            document.getElementById('btnRecargarEmergencia').style.display = 'none';
        }
    } else {
        if (emergenciaActivaLocal) {
            overlay.style.display = 'none';
            emergenciaActivaLocal = false;
        }
    }
}

// ==================== ESTADO DEL ESP32 ====================

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

// ==================== HEARTBEAT CHECK ====================

function iniciarHeartbeatCheck() {
    setInterval(() => {
        if (ultimoHeartbeat > 0 && Date.now() - ultimoHeartbeat > CONFIG.tiempos.heartbeatTimeout) {
            updateEsp32Status(false);
        }
    }, 5000);
}

// ==================== INICIALIZACIÓN ====================

// Verificar estado cada minuto
setInterval(verificarYActualizarEstado, 60000);
verificarYActualizarEstado();
