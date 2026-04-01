let client = null;
let mqttConectado = false;
let esp32Online = false;
let ultimoHeartbeat = 0;

function conectarMQTT() {
    const options = {
        username: CONFIG.mqtt.username,
        password: CONFIG.mqtt.password,
        clientId: "web_dashboard_" + Math.random().toString(16).substr(2, 8),
        clean: true,
        keepalive: 60,
        reconnectPeriod: 5000
    };

    client = mqtt.connect(CONFIG.mqtt.broker, options);

    client.on('connect', () => {
        console.log("✅ Conectado a HiveMQ");
        mqttConectado = true;
        updateConnectionStatus(true);
        
        client.subscribe(CONFIG.mqtt.topics.estado);
        client.subscribe(CONFIG.mqtt.topics.sensores);
        client.subscribe(CONFIG.mqtt.topics.heartbeat);
        
        setTimeout(() => {
            enviarComando("ESTADO");
        }, 500);
    });

    client.on('message', (topic, message) => {
        const payload = message.toString();
        console.log("📨 Recibido:", topic, payload);
        
        if (topic === CONFIG.mqtt.topics.heartbeat) {
            esp32Online = true;
            ultimoHeartbeat = Date.now();
            updateEsp32Status(true);
            return;
        }
        
        if (payload.includes('"emergenciaActiva":true')) {
            mostrarEmergencia(true);
            return;
        }
        if (payload.includes('"emergenciaActiva":false')) {
            mostrarEmergencia(false);
            return;
        }
        
        try {
            const data = JSON.parse(payload);
            if (topic === CONFIG.mqtt.topics.estado) {
                if (data.estado) updatePortonUI(data.estado);
                updateConfiguracion(data);
            } else if (topic === CONFIG.mqtt.topics.sensores) {
                updateSensores(data);
            }
            actualizarTimestamp();
        } catch(e) {
            console.warn("Error parseando JSON:", payload);
        }
    });

    client.on('error', (err) => {
        console.error("❌ MQTT Error:", err);
        mqttConectado = false;
        updateConnectionStatus(false);
    });

    client.on('offline', () => {
        mqttConectado = false;
        updateConnectionStatus(false);
    });
}

function enviarComando(cmd) {
    if (!client || !mqttConectado) {
        alert("⚠️ No hay conexión con HiveMQ");
        return;
    }
    client.publish(CONFIG.mqtt.topics.comandos, cmd);
    document.getElementById('timestamp').innerHTML = `📨 Comando "${cmd}" enviado a las ${new Date().toLocaleTimeString()}`;
    setTimeout(() => {
        const ts = document.getElementById('timestamp');
        if (ts && !ts.innerHTML.includes("Comando")) {
            ts.innerHTML = `🕐 Última actualización: ${new Date().toLocaleTimeString()}`;
        }
    }, 3000);
}
