// ========== CARRITO — solo lectura del contador ==========
function obtenerCarrito() {
  return JSON.parse(localStorage.getItem('cafe_carrito') || '[]');
}

function contarCarrito() {
  return obtenerCarrito().reduce((total, articulo) => total + articulo.cantidad, 0);
}

function actualizarInsignia() {
  const cantidad = contarCarrito();
  document.querySelectorAll('.insignia-carrito').forEach(b => b.textContent = cantidad);
}

// ========== MENÚ LATERAL ==========
function abrirMenuLateral() {
  document.getElementById('menuLateral').classList.add('abierto');
  document.getElementById('capaMenuLateral').classList.add('abierto');
}

function cerrarMenuLateral() {
  document.getElementById('menuLateral').classList.remove('abierto');
  document.getElementById('capaMenuLateral').classList.remove('abierto');
}

// ========== NOTIFICACIÓN ==========
function mostrarNotificacion(mensaje) {
  const notif = document.getElementById('notificacion');
  if (!notif) return;
  notif.textContent = mensaje;
  notif.classList.add('visible');
  setTimeout(() => notif.classList.remove('visible'), 2200);
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', actualizarInsignia);