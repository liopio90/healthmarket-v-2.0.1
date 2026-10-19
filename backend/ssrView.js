const products = [
  {
    title: 'Proteína Premium Whey',
    description: 'Proteína de suero de leche para desarrollo muscular y recuperación.',
    price: '$1299.99',
    image: '/images/ProteínaWhey.png',
    badge: 'Más vendido',
  },
  {
    title: 'Complejo Vitamínico ABC',
    description: 'Vitaminas esenciales para apoyar tu energía y bienestar diario.',
    price: '$499.99',
    image: '/images/VitaminaABC.jpg',
    badge: 'Nuevo',
  },
  {
    title: 'Omega-3 Premium',
    description: 'EPA y DHA para apoyar la salud cardiovascular, cerebral y articular.',
    price: '$399.99',
    image: '/images/VitaminaA.jpg',
    badge: '',
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderProduct(product) {
  return `
    <article class="product-card">
      <div class="product-image-wrap">
        ${product.badge ? `<span class="badge">${escapeHtml(product.badge)}</span>` : ''}
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" width="320" height="240" loading="lazy">
      </div>
      <div class="product-content">
        <p class="product-category">Salud y nutrición</p>
        <h3>${escapeHtml(product.title)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="product-footer">
          <strong>${escapeHtml(product.price)}</strong>
          <button type="button" data-product="${escapeHtml(product.title)}">Agregar</button>
        </div>
      </div>
    </article>`;
}

function renderSsrHome() {
  const productMarkup = products.map(renderProduct).join('');

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Market | Nutrición para tu bienestar</title>
    <meta name="description" content="Productos de nutrición y bienestar seleccionados para acompañar tus objetivos de salud.">
    <style>
      :root { color-scheme: light; font-family: Georgia, 'Times New Roman', serif; background: #f7faf7; color: #18352b; }
      * { box-sizing: border-box; }
      body { margin: 0; background: linear-gradient(135deg, #f7faf7 0%, #edf7f0 55%, #fffaf0 100%); }
      header { display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 22px clamp(20px, 6vw, 88px); background: rgba(255,255,255,.86); border-bottom: 1px solid #dce9df; }
      .brand { font-size: 1.35rem; font-weight: 700; letter-spacing: .02em; }
      nav { display: flex; gap: 22px; font: 600 .92rem Arial, sans-serif; }
      nav a { color: #376451; text-decoration: none; }
      main { max-width: 1180px; margin: 0 auto; padding: 72px clamp(20px, 6vw, 88px) 88px; }
      .hero { max-width: 710px; }
      .eyebrow { margin: 0 0 12px; color: #15805b; font: 700 .78rem Arial, sans-serif; letter-spacing: .13em; text-transform: uppercase; }
      h1 { max-width: 680px; margin: 0; font-size: clamp(2.5rem, 5vw, 5rem); line-height: .98; letter-spacing: -.045em; }
      .hero-copy { margin: 24px 0 0; max-width: 610px; color: #527064; font: 1.1rem/1.65 Arial, sans-serif; }
      .section-heading { display: flex; justify-content: space-between; align-items: end; margin: 72px 0 24px; gap: 20px; }
      h2 { margin: 0; font-size: 2rem; letter-spacing: -.025em; }
      .section-heading p { margin: 0; color: #668174; font: .95rem Arial, sans-serif; }
      .products { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .product-card { overflow: hidden; background: #fff; border: 1px solid #dce9df; border-radius: 16px; box-shadow: 0 12px 30px rgba(34, 72, 52, .08); }
      .product-image-wrap { position: relative; min-height: 220px; display: grid; place-items: center; background: #eff8f0; }
      .product-image-wrap img { width: 100%; height: 220px; object-fit: contain; }
      .badge { position: absolute; top: 14px; left: 14px; z-index: 1; padding: 6px 10px; border-radius: 999px; background: #d9f4df; color: #17603f; font: 700 .72rem Arial, sans-serif; }
      .product-content { padding: 20px; }
      .product-category { margin: 0 0 8px; color: #15805b; font: 700 .72rem Arial, sans-serif; letter-spacing: .1em; text-transform: uppercase; }
      h3 { margin: 0; font-size: 1.35rem; }
      .product-content > p:not(.product-category) { min-height: 50px; margin: 10px 0 18px; color: #668174; font: .92rem/1.5 Arial, sans-serif; }
      .product-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .product-footer strong { font: 700 1.15rem Arial, sans-serif; }
      button { border: 0; border-radius: 8px; padding: 10px 14px; background: #15805b; color: #fff; cursor: pointer; font: 700 .85rem Arial, sans-serif; }
      footer { padding: 24px clamp(20px, 6vw, 88px); color: #668174; border-top: 1px solid #dce9df; font: .85rem Arial, sans-serif; }
      @media (max-width: 760px) { header { align-items: flex-start; flex-direction: column; } nav { gap: 14px; flex-wrap: wrap; } main { padding-top: 48px; } .products { grid-template-columns: 1fr; } .section-heading { align-items: flex-start; flex-direction: column; margin-top: 52px; } }
    </style>
  </head>
  <body>
    <header>
      <div class="brand">Health Market</div>
      <nav aria-label="Navegación principal"><a href="#productos">Productos</a><a href="#bienestar">Bienestar</a><a href="#contacto">Contacto</a></nav>
    </header>
    <main>
      <section class="hero" aria-labelledby="hero-title">
        <p class="eyebrow">Nutrición que acompaña tu ritmo</p>
        <h1 id="hero-title">Cuida tu salud con decisiones simples.</h1>
        <p class="hero-copy">Encuentra suplementos y productos seleccionados para convertir tus objetivos de bienestar en hábitos sostenibles.</p>
      </section>
      <section id="productos" aria-labelledby="products-title">
        <div class="section-heading"><h2 id="products-title">Destacados de la semana</h2><p>Selección Health Market</p></div>
        <div class="products">${productMarkup}</div>
      </section>
    </main>
    <footer id="contacto">Health Market · Bienestar informado para todos los días</footer>
    <script>
      document.querySelectorAll('[data-product]').forEach((button) => {
        button.addEventListener('click', () => {
          button.textContent = 'Agregado';
          button.setAttribute('aria-label', button.dataset.product + ' agregado al carrito');
        });
      });
    </script>
  </body>
</html>`;
}

module.exports = { renderSsrHome };
