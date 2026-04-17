function alternarPass(id) {
    const campo = document.getElementById(id);
    campo.type = campo.type === 'password' ? 'text' : 'password';
}

function mostrarNotificacion(mensaje) {
    const notif = document.getElementById('notificacion');
    if (!notif) return;
    notif.textContent = mensaje;
    notif.classList.add('visible');
    setTimeout(() => notif.classList.remove('visible'), 2200);
}

function manejarAcceder() {
    const email = document.getElementById('email-acceder').value.trim();
    const pass = document.getElementById('pass-acceder').value;

    if (!email || !pass) {
        mostrarNotificacion('Por favor rellena todos los campos');
        return;
    }

    window.location.href = 'index.html';
}

function manejarRegistro() {
    const nombre = document.getElementById('nombre-registro').value.trim();
    const email = document.getElementById('email-registro').value.trim();
    const pass = document.getElementById('pass-registro').value;
    const telefono = document.getElementById('telefono-registro').value.trim();
    const direccion = document.getElementById('direccion-registro').value.trim();
    const ciudad = document.getElementById('ciudad-registro').value.trim();
    const cp = document.getElementById('cp-registro').value.trim();
    const pais = document.getElementById('pais-registro').value.trim();

    if (!nombre || !email || !pass || !telefono || !direccion || !ciudad || !cp || !pais) {
        mostrarNotificacion('Por favor rellena todos los campos');
        return;
    }

    window.location.href = 'index.html';
}