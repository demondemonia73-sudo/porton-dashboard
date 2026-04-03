let menuAbierto = true;

function toggleMenu() {
    menuAbierto = !menuAbierto;
    let m = document.getElementById('menuContent');
    let h = document.querySelector('.menu-header');
    if (menuAbierto) {
        m.classList.remove('collapsed');
        h.classList.remove('collapsed');
    } else {
        m.classList.add('collapsed');
        h.classList.add('collapsed');
    }
}

function updateConnectionStatus(connected) {
    const statusText = document.getElementById('statusText');
    if (statusText) {
        if (connected) {
            statusText.innerHTML = '<span class="status-led" style="background:#10b981;"></span> Conectado';
            statusText.classList.add('connected');
        } else {
            statusText.innerHTML = '<span class="status-led" style="background:#ef4444;"></span> Desconectado';
            statusText.classList.remove('connected');
        }
    }
}

function updateEsp32Status(online) {
    const esp32Text = document.getElementById('esp32StatusText');
    if (esp32Text) {
        if (online) {
            esp32Text.innerHTML = '<span class="status-led" style="background:#10b981;"></span> En línea';
            esp32Text.classList.add('connected');
        } else {
            esp32Text.innerHTML = '<span class="status-led" style="background:#ef4444;"></span> Desconectado';
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
        textoDiv.className = 'estado-texto abierto';
        puerta.style.left = 'calc(100% - 90px)';
    } else if (estado === "CERRADO") {
        textoDiv.innerHTML = '🔒 PORTÓN CERRADO';
        textoDiv.className = 'estado-texto cerrado';
        puerta.style.left = '12px';
    } else {
        textoDiv.innerHTML = '⚠️ PORTÓN ENTREABIERTO';
        textoDiv.className = 'estado-texto intermedio';
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
    console.log("🔄 Actualizando configuración con:", data);
    
    const fotoVal = document.getElementById('fotoVal');
    const movVal = document.getElementById('movVal');
    const autoVal = document.getElementById('autoVal');
    const fotoBox = document.getElementById('fotoBox');
    const movBox = document.getElementById('movBox');
    const autoBox = document.getElementById('autoBox');
    const toggleFoto = document.getElementById('toggleFoto');
    const toggleMov = document.getElementById('toggleMov');
    const toggleAuto = document.getElementById('toggleAuto');
    const toggleBoton = document.getElementById('toggleBoton');
    
    // Actualizar Fotoeléctrica
    if (data.fotoHabilitado !== undefined) {
        console.log("📷 Foto estado:", data.fotoHabilitado);
        if (data.fotoHabilitado === true) {
            if (fotoVal) fotoVal.innerHTML = '✅ HABILITADO';
            if (fotoBox) fotoBox.classList.add('activo');
            if (toggleFoto) toggleFoto.classList.add('active');
        } else {
            if (fotoVal) fotoVal.innerHTML = '⚪ DESHABILITADO';
            if (fotoBox) fotoBox.classList.remove('activo');
            if (toggleFoto) toggleFoto.classList.remove('active');
        }
    }
    
    // Actualizar Sensor Movimiento
    if (data.movHabilitado !== undefined) {
        console.log("🚶 Mov estado:", data.movHabilitado);
        if (data.movHabilitado === true) {
            if (movVal) movVal.innerHTML = '✅ HABILITADO';
            if (movBox) movBox.classList.add('activo');
            if (toggleMov) toggleMov.classList.add('active');
        } else {
            if (movVal) movVal.innerHTML = '⚪ DESHABILITADO';
            if (movBox) movBox.classList.remove('activo');
            if (toggleMov) toggleMov.classList.remove('active');
        }
    }
    
    // Actualizar Modo Automático
    if (data.modoAuto !== undefined) {
        console.log("🤖 Auto estado:", data.modoAuto);
        if (data.modoAuto === true) {
            if (autoVal) autoVal.innerHTML = '✅ ACTIVADO';
            if (autoBox) autoBox.classList.add('activo');
            if (toggleAuto) toggleAuto.classList.add('active');
        } else {
            if (autoVal) autoVal.innerHTML = '⚪ DESACTIVADO';
            if (autoBox) autoBox.classList.remove('activo');
            if (toggleAuto) toggleAuto.classList.remove('active');
        }
    }
    
    // Actualizar Botón Físico
    if (data.botonFisicoHabilitado !== undefined) {
        console.log("🎮 Botón estado:", data.botonFisicoHabilitado);
        if (data.botonFisicoHabilitado === true) {
            if (toggleBoton) toggleBoton.classList.add('active');
            document.getElementById('botonBadge').innerHTML = '🎮 Botón: ON';
        } else {
            if (toggleBoton) toggleBoton.classList.remove('active');
            document.getElementById('botonBadge').innerHTML = '🎮 Botón: OFF';
        }
    }
    
    // Actualizar Chapa
    const chapaBadge = document.getElementById('chapaBadge');
    if (chapaBadge && data.chapa !== undefined) {
        chapaBadge.innerHTML = data.chapa ? '🔐 Chapa: ON' : '🔐 Chapa: OFF';
    }
    
    // Actualizar MQTT
    const mqttBadge = document.getElementById('mqttBadge');
    if (mqttBadge && data.mqtt !== undefined) {
        mqttBadge.innerHTML = data.mqtt ? '🌍 MQTT: Conectado' : '🌍 MQTT: Desconectado';
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
