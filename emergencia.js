let emergenciaActivaLocal = false;
let emergenciaRemotaLocal = false;

function mostrarEmergencia(mostrar) {
    const overlay = document.getElementById('emergenciaOverlay');
    if (mostrar) {
        if (!emergenciaActivaLocal) {
            overlay.style.display = 'flex';
            emergenciaActivaLocal = true;
            
            fetch('/estadoEmergencia').then(r => r.json()).then(d => {
                if (d.emergenciaRemotaActiva) {
                    document.getElementById('emergenciaContrasena').style.display = 'block';
                    document.getElementById('btnRecargarEmergencia').style.display = 'none';
                } else {
                    document.getElementById('emergenciaContrasena').style.display = 'none';
                    document.getElementById('btnRecargarEmergencia').style.display = 'block';
                }
            }).catch(e => console.log(e));
        }
    } else {
        if (emergenciaActivaLocal) {
            overlay.style.display = 'none';
            emergenciaActivaLocal = false;
        }
    }
}
