let panelAbierto = true;

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
            statusText.classList.add('connected');
            statusText.classList.remove('disconnected');
        } else {
            statusText.innerHTML = '<span class="status-led red"></span> Desconectado';
            statusText.classList.add('disconnected');
            statusText.classList.remove('connected');
        }
    }
}

function updateEsp32Status(online) {
    const esp32Text = document.getElementById('esp32StatusText');
    if (esp32Text) {
        if (online) {
            esp32Text.innerHTML = '<span class="status-led green"></span> En línea';
            esp32Text.classList.add('connected');
            esp32Text.classList.remove('disconnected');
        } else {
            esp32Text.innerHTML = '<span class="status-led red"></span> Desconectado';
            esp32Text.classList.add('disconnected');
            esp32Text.classList.remove('connected');
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

function updateConfiguracion(data) {
    console.log("🔄 Actualizando configuración:", data);
    
    // Fotoeléctrica
    const toggleFoto = document.getElementById('toggleFoto');
    const fotoVal = document.getElementById('fotoVal');
    const fotoBox = document.getElementById('fotoBox');
    
    if (data.fotoHabilitado !== undefined) {
        if (data.fotoHabilitado === true) {
            if (toggleFoto) toggleFoto.classList.add('active');
            if (fotoVal) fotoVal.innerHTML = '✅ HABILITADO';
            if (fotoBox) fotoBox.classList.add('activo');
        } else {
            if (toggleFoto) toggleFoto.classList.remove('active');
            if (fotoVal) fotoVal.innerHTML = '⚪ DESHABILITADO';
            if (fotoBox) fotoBox.classList.remove('activo');
        }
    }
    
    // Sensor Movimiento
    const toggleMov = document.getElementById('toggleMov');
    const movVal = document.getElementById('movVal');
    const movBox = document.getElementById('movBox');
    
    if (data.movHabilitado !== undefined) {
        if (data.movHabilitado === true) {
            if (toggleMov) toggleMov.classList.add('active');
            if (movVal) movVal.innerHTML = '✅ HABILITADO';
            if (movBox) movBox.classList.add('activo');
        } else {
            if (toggleMov) toggleMov.classList.remove('active');
            if (movVal) movVal.innerHTML = '⚪ DESHABILITADO';
            if (movBox) movBox.classList.remove('activo');
        }
    }
    
    // Modo Automático
    const toggleAuto = document.getElementById('toggleAuto');
    const autoVal = document.getElementById('autoVal');
    const autoBox = document.getElementById('autoBox');
    
    if (data.modoAuto !== undefined) {
        if (data.modoAuto === true) {
            if (toggleAuto) toggleAuto.classList.add('active');
            if (autoVal) autoVal.innerHTML = '✅ ACTIVADO';
            if (autoBox) autoBox.classList.add('activo');
        } else {
            if (toggleAuto) toggleAuto.classList.remove('active');
            if (autoVal) autoVal.innerHTML = '⚪ DESACTIVADO';
            if (autoBox) autoBox.classList.remove('activo');
        }
    }
    
    // Botón Físico
    const toggleBoton = document.getElementById('toggleBoton');
    const botonBadge = document.getElementById('botonBadge');
    
    if (data.botonFisicoHabilitado !== undefined) {
        if (data.botonFisicoHabilitado === true) {
            if (toggleBoton) toggleBoton.classList.add('active');
            if (botonBadge) botonBadge.innerHTML = '🎮 Botón: ON';
        } else {
            if (toggleBoton) toggleBoton.classList.remove('active');
            if (botonBadge) botonBadge.innerHTML = '🎮 Botón: OFF';
        }
    }
    
    // Chapa
    const chapaBadge = document.getElementById('chapaBadge');
    if (chapaBadge && data.chapaActiva !== undefined) {
        chapaBadge.innerHTML = data.chapaActiva ? '🔐 Chapa: ON' : '🔐 Chapa: OFF';
    }
    
    // MQTT
    const mqttBadge = document.getElementById('mqttBadge');
    if (mqttBadge && data.mqtt !== undefined) {
        mqttBadge.innerHTML = data.mqtt ? '🌍 MQTT: Conectado' : '🌍 MQTT: Desconectado';
    }
    
    // Emergencia
    const emergenciaBadge = document.getElementById('emergenciaBadge');
    if (emergenciaBadge && data.emergenciaActiva !== undefined) {
        emergenciaBadge.innerHTML = data.emergenciaActiva ? '🛑 EMERGENCIA ACTIVA' : '🛑 Emergencia: OFF';
        emergenciaBadge.style.background = data.emergenciaActiva ? '#e74c3c' : '#e67e22';
    }
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
    enviarComando(sensor === 'foto' ? "TOGGLE_FOTO" : "TOGGLE_MOV");
}

function toggleModoAuto() {
    enviarComando("TOGGLE_AUTO");
}

function toggleBotonFisico() {
    enviarComando("TOGGLE_BOTON");
}

function iniciarHeartbeatCheck() {
    setInterval(() => {
        if (ultimoHeartbeat > 0 && Date.now() - ultimoHeartbeat > CONFIG.tiempos.heartbeatTimeout) {
            esp32Online = false;
            updateEsp32Status(false);
        }
    }, 5000);
}
