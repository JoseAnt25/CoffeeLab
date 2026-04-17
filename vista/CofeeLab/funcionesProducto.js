let currentQty = 1;
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));
  currentProduct = getAllProducts().find(p => p.id === productId);

  if (currentProduct) {
    document.getElementById('detail-img').textContent = currentProduct.emoji;
    document.getElementById('detail-name').textContent = currentProduct.name.toUpperCase();
    document.getElementById('detail-desc').textContent = currentProduct.desc;
    document.getElementById('detail-price').textContent = formatPrice(currentProduct.price);
    document.title = 'Café & Co. — ' + currentProduct.name;
  }
});

function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById('qty-display').textContent = currentQty;
}

function handleAddToCart() {
  if (!currentProduct) return;
  addToCart(currentProduct.id, currentQty);
  showToast(currentProduct.name + ' añadido al carrito');
}