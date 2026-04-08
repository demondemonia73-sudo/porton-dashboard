// ==================== VARIABLES GLOBALES ====================
let panelAbierto = true;
let permisoEspecialLocal = false;
let adminAutorizado = false;
let sincronizado = false;

// ==================== FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN ====================
function procesarMensajeMQTT(topic, mensaje) {
    console.log("📨 Topic:", topic);
    console.log("📦 Mensaje:", mensaje);
    
    if (topic === "porton/estado") {
        // Actualizar estado del portón
        const estadoDiv = document.getElementById('estadoPorton');
        const puerta = document.getElementById('puerta');
        if (estadoDiv && puerta && mensaje.estado) {
            if (mensaje.estado === "ABIERTO") {
                estadoDiv.innerHTML = '✅ PORTÓN ABIERTO';
                estadoDiv.className = 'gate-status abierto';
                puerta.style.left = 'calc(100% - 90px)';
            } else if (mensaje.estado === "CERRADO") {
                estadoDiv.innerHTML = '🔒 PORTÓN CERRADO';
                estadoDiv.className = 'gate-status cerrado';
                puerta.style.left = '12px';
            } else {
                estadoDiv.innerHTML = '⚠️ PORTÓN ENTREABIERTO';
                estadoDiv.className = 'gate-status intermedio';
                puerta.style.left = 'calc(50% - 45px)';
            }
        }
        
        // Actualizar toggles
        const toggleFoto = document.getElementById('toggleFoto');
        if (toggleFoto) {
            if (mensaje.fotoHabilitado) toggleFoto.classList.add('active');
            else toggleFoto.classList.remove('active');
        }
        
        const toggleAuto = document.getElementById('toggleAuto');
        if (toggleAuto) {
            if (mensaje.modoAuto) toggleAuto.classList.add('active');
            else toggleAuto.classList.remove('active');
        }
        
        const toggleBoton = document.getElementById('toggleBoton');
        if (toggleBoton) {
            if (mensaje.botonFisicoHabilitado) toggleBoton.classList.add('active');
            else toggleBoton.classList.remove('active');
        }
        
        const togglePIR = document.getElementById('togglePIR');
        if (togglePIR) {
            if (mensaje.pirHabilitado) togglePIR.classList.add('active');
            else togglePIR.classList.remove('active');
        }
        
        const toggleHorario = document.getElementById('toggleHorario');
        if (toggleHorario) {
            if (mensaje.modoHorario) toggleHorario.classList.add('active');
            else toggleHorario.classList.remove('active');
        }
        
        // Badges
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
        
        // Permiso especial
        if (mensaje.permisoEspecial) {
            permisoEspecialLocal = true;
            const permisoEstado = document.getElementById('permisoEstado');
            if (permisoEstado) permisoEstado.innerHTML = '🔑 Permiso especial activo';
        } else {
            permisoEspecialLocal = false;
            const permisoEstado = document.getElementById('permisoEstado');
            if (permisoEstado) permisoEstado.innerHTML = '';
        }
        
        if (!sincronizado) {
            sincronizado = true;
            console.log("✅ Sincronizado con ESP32");
        }
    }
}

function updateConfiguracion(data) {
    procesarMensajeMQTT("porton/estado", data);
}

function updatePortonUI(estado) {
    const estadoDiv = document.getElementById('estadoPorton');
    const puerta = document.getElementById('puerta');
    if (estadoDiv && puerta) {
        if (estado === "ABIERTO") {
            estadoDiv.innerHTML = '✅ PORTÓN ABIERTO';
            estadoDiv.className = 'gate-status abierto';
            puerta.style.left = 'calc(100% - 90px)';
        } else if (estado === "CERRADO") {
            estadoDiv.innerHTML = '🔒 PORTÓN CERRADO';
            estadoDiv.className = 'gate-status cerrado';
            puerta.style.left = '12px';
        } else {
            estadoDiv.innerHTML = '⚠️ PORTÓN ENTREABIERTO';
            estadoDiv.className = 'gate-status intermedio';
            puerta.style.left = 'calc(50% - 45px)';
        }
    }
}

function updateSensores(data) {
    console.log("Sensores:", data);
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

function actualizarTimestamp() {
    const ts = document.getElementById('timestamp');
    if (ts) {
        ts.innerHTML = `🕐 ${new Date().toLocaleTimeString()}`;
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

function toggleSensor(sensor) { enviarComando("TOGGLE_FOTO"); }
function toggleModoAuto() { enviarComando("TOGGLE_AUTO"); }
function toggleBotonFisico() { enviarComando("TOGGLE_BOTON"); }
function togglePIR() { enviarComando("TOGGLE_PIR"); }
function toggleHorario() { enviarComando("TOGGLE_HORARIO"); }

function activarPermisoConTiempo() {
    let minutos = document.getElementById('permisoMinutos').value;
    enviarComando(`ACTIVAR_PERMISO:${minutos}`);
    permisoEspecialLocal = true;
    const permisoEstado = document.getElementById('permisoEstado');
    if (permisoEstado) permisoEstado.innerHTML = '🔑 Permiso especial activo';
    mostrarMensaje(`🔑 Permiso activado por ${minutos} minutos`);
}

function mostrarAdmin() {
    let pass = prompt("🔐 Contraseña de administrador:");
    if (pass === "12345") {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.style.display = 'block';
        mostrarMensaje("🔓 Acceso ADMIN concedido");
    } else {
        alert("❌ Contraseña incorrecta");
    }
}

function abrirTemporalAdmin() {
    enviarComando("ADMIN_ABRIR");
    mostrarMensaje("🔓 Portón abierto por 1 minuto");
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.style.display = 'none';
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
        setTimeout(() => location.reload(), 1500);
    } else {
        const errorDiv = document.getElementById('errorContrasena');
        if (errorDiv) errorDiv.innerHTML = '❌ Contraseña incorrecta';
    }
}

function mostrarEmergencia(mostrar) {
    const overlay = document.getElementById('emergenciaOverlay');
    if (overlay) {
        if (mostrar) {
            overlay.style.display = 'flex';
            setTimeout(() => location.reload(), 3000);
        } else {
            overlay.style.display = 'none';
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
        if (ultimoHeartbeat && Date.now() - ultimoHeartbeat > 30000) {
            updateEsp32Status(false);
        }
    }, 5000);
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

console.log("✅ ui.js cargado correctamente");
