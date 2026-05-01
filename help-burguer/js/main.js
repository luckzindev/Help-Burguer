// ── Cart State ──────────────────────────────────────
let cart = [];

function addToCart(name, price, img) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, img, qty: 1 });
  }
  updateCartUI();
  showToast(`${name} adicionado!`);
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  updateCartUI();
}

function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
  }
  updateCartUI();
}

function getTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function fmt(v) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`;
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const countEl = document.getElementById('cartCount');
  countEl.textContent = count;
  countEl.classList.toggle('show', count > 0);

  const listEl  = document.getElementById('cartList');
  const emptyEl = document.getElementById('cartEmpty');
  const footer  = document.getElementById('cartFooter');

  if (cart.length === 0) {
    listEl.innerHTML  = '';
    emptyEl.style.display = 'flex';
    footer.style.display  = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footer.style.display  = 'block';

  listEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g,"\\'")}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g,"\\'")}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.name.replace(/'/g,"\\'")}')">✕</button>
    </div>
  `).join('');

  const total = getTotal();
  document.getElementById('cartSubtotal').textContent = fmt(total);
  document.getElementById('cartTotal').textContent    = fmt(total);
}

// ── Cart Panel ──────────────────────────────────────
function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartPanel').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Checkout ────────────────────────────────────────
function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  buildSummary();
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCheckout() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function buildSummary() {
  const container = document.getElementById('summaryItems');
  container.innerHTML = '';
  cart.forEach(item => {
    const d = document.createElement('div');
    d.className = 'order-mini-item';
    d.innerHTML = `<span>${item.qty}x ${item.name}</span><span>${fmt(item.price * item.qty)}</span>`;
    container.appendChild(d);
  });
  document.getElementById('summaryTotal').textContent = fmt(getTotal());
}

function confirmOrder() {
  const name         = document.getElementById('fName').value.trim();
  const phone        = document.getElementById('fPhone').value.trim();
  const street       = document.getElementById('fStreet').value.trim();
  const number       = document.getElementById('fNumber').value.trim();
  const neighborhood = document.getElementById('fNeighborhood').value.trim();
  const cep          = document.getElementById('fCep').value.trim();

  if (!name || !phone || !street || !number || !neighborhood || !cep) {
    alert('Por favor, preencha todos os campos obrigatórios (*).');
    return;
  }

  const payment = document.querySelector('input[name="payment"]:checked').value;
  const obs     = document.getElementById('fObs').value.trim();
  const comp    = document.getElementById('fComp').value.trim();
  const ref     = document.getElementById('fRef').value.trim();

  let msg = `🍔 *NOVO PEDIDO – Help Burguer*\n\n`;
  msg += `*Itens:*\n`;
  cart.forEach(i => { msg += `• ${i.qty}x ${i.name} – ${fmt(i.price * i.qty)}\n`; });
  msg += `\n*Total: ${fmt(getTotal())}*\n`;
  msg += `\n👤 *Cliente:* ${name}`;
  msg += `\n📞 *Telefone:* ${phone}`;
  msg += `\n📍 *Endereço:* ${street}, ${number}${comp ? ' – ' + comp : ''}, ${neighborhood}, SP – CEP ${cep}`;
  if (ref) msg += `\n📌 *Referência:* ${ref}`;
  msg += `\n💳 *Pagamento:* ${payment}`;
  if (obs) msg += `\n📝 *Obs:* ${obs}`;

  const waURL = `https://wa.me/5511952060741?text=${encodeURIComponent(msg)}`;
  window.open(waURL, '_blank');

  document.getElementById('checkoutForm').style.display = 'none';
  document.getElementById('successScreen').classList.add('show');
}

function closeSuccess() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('checkoutForm').style.display = 'block';
  document.getElementById('successScreen').classList.remove('show');
  cart = [];
  updateCartUI();
  ['fName','fPhone','fCpf','fStreet','fNumber','fComp','fNeighborhood','fCep','fRef','fObs']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.body.style.overflow = '';
}

// ── Category Filter ─────────────────────────────────
function filterCat(cat, btn) {
  document.querySelectorAll('.menu-category').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('cat-' + cat).classList.add('active');
  btn.classList.add('active');
}

// ── Toast ───────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = '🍔 ' + msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Horário Brasília ────────────────────────────────
function checkOpenStatus() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brasilia = new Date(utc + (-3 * 60) * 60000);
  const totalMin = brasilia.getHours() * 60 + brasilia.getMinutes();

  // Aberto das 19:00 até 00:00
  const isOpen = totalMin >= 19 * 60 && totalMin < 24 * 60;

  const statusTag = document.getElementById('statusTag');
  const infoPill  = document.getElementById('infoPill');

  if (isOpen) {
    statusTag.textContent = '🔥 Aberto agora · Ter–Dom 19h–00h';
    statusTag.style.color = 'var(--amber)';
    statusTag.style.background = 'var(--amber-bg)';
    statusTag.style.borderColor = 'rgba(245,166,35,0.3)';

    infoPill.textContent = '🟢 Aberto agora';
    infoPill.style.background = 'rgba(34,197,94,0.2)';
    infoPill.style.color = '#4ade80';
    infoPill.style.borderColor = 'rgba(74,222,128,0.3)';
  } else {
    let minutesUntilOpen;
    if (totalMin < 19 * 60) {
      minutesUntilOpen = 19 * 60 - totalMin;
    } else {
      minutesUntilOpen = (24 * 60 - totalMin) + 19 * 60;
    }
    const hoursLeft = Math.floor(minutesUntilOpen / 60);
    const minsLeft  = minutesUntilOpen % 60;
    const timeStr   = hoursLeft > 0 ? `${hoursLeft}h${minsLeft > 0 ? minsLeft + 'min' : ''}` : `${minsLeft}min`;

    statusTag.textContent = `🔴 Fechado agora · Abre em ${timeStr}`;
    statusTag.style.color = '#f87171';
    statusTag.style.background = 'rgba(239,68,68,0.1)';
    statusTag.style.borderColor = 'rgba(239,68,68,0.25)';

    infoPill.textContent = `🔴 Fechado · Abre às 19h`;
    infoPill.style.background = 'rgba(239,68,68,0.15)';
    infoPill.style.color = '#f87171';
    infoPill.style.borderColor = 'rgba(239,68,68,0.3)';
  }
}

checkOpenStatus();
setInterval(checkOpenStatus, 60000);

// ── Scroll-in animation ─────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.menu-card, .info-card, .about-grid > *').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  obs.observe(el);
});
