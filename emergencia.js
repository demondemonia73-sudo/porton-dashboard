let emergenciaActivaLocal = false;
let emergenciaRemotaLocal = false;

function mostrarEmergencia(mostrar) {
    const overlay = document.getElementById('emergenciaOverlay');
    if (mostrar) {
        if (!emergenciaActivaLocal) {
            overlay.style.display = 'flex';
            emergenciaActivaLocal = true;
            
            // Verificar si es emergencia remota (necesita contraseña)
            if (emergenciaRemotaLocal) {
                document.getElementById('emergenciaContrasena').style.display = 'block';
                document.getElementById('btnRecargarEmergencia').style.display = 'none';
            } else {
                document.getElementById('emergenciaContrasena').style.display = 'none';
                document.getElementById('btnRecargarEmergencia').style.display = 'block';
                // Recargar después de 3 segundos para emergencia física
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
