const CONFIG = {
    mqtt: {
        broker: "wss://fce01a048733432a9eae2f8d8454ef46.s1.eu.hivemq.cloud:8884/mqtt",
        username: "prueba",
        password: "Prueba2026",
        topics: {
            comandos: "porton/comandos",
            estado: "porton/estado",
            sensores: "porton/sensores",
            heartbeat: "porton/heartbeat"
        }
    },
    tiempos: {
        heartbeatTimeout: 30000,
        updateInterval: 1000
    }
};
