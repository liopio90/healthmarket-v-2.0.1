# Comparación CSR vs. SSR en Health Market

## 1. Diferencias e impacto

**CSR (Client-Side Rendering)** entrega un HTML inicial con un contenedor vacío y descarga JavaScript para que el navegador monte la aplicación. La primera vista depende de descargar, analizar y ejecutar el bundle; esto puede elevar FCP/LCP en redes lentas. El contenido principal aparece después y los buscadores necesitan ejecutar JavaScript para descubrirlo, por lo que el SEO puede ser menos predecible.

**SSR (Server-Side Rendering)** genera el HTML de la pantalla en el servidor y lo envía con el contenido visible. El navegador puede pintar texto y productos antes de ejecutar JavaScript, normalmente mejorando la percepción de carga y el contenido rastreable. Tiene como coste trabajo por solicitud, HTML inicial mayor y la necesidad de hidratar o añadir JavaScript para las interacciones.

La ruta CSR existente es `/` en el frontend de Vite. La vista SSR de esta práctica es `/ssr` en Express: contiene el título, descripción y productos en la respuesta HTML, con una mejora progresiva para los botones.

## 2. Vista SSR implementada

Ejecutar desde la raíz:

```powershell
npm install --prefix backend
npm --prefix backend start
```

Abrir `http://localhost:5000/ssr`. Para la referencia CSR:

```powershell
npm install --prefix frontend
npm --prefix frontend run dev
```

Abrir `http://localhost:3000/`.

## 3. Comparación reproducible

Con el backend ejecutándose, medir la respuesta de red de ambas rutas:

```powershell
node backend/benchmark.js
```

El script ejecuta 10 muestras y reporta estado HTTP, bytes recibidos y promedio en milisegundos. Usa por defecto `http://localhost:5000/ssr` y `http://localhost:5173/` para SSR y CSR; en este proyecto Vite usa el puerto `3000`, por lo que la comparación local se ejecuta así:

```powershell
$env:CSR_URL = 'http://localhost:3000/'
node backend/benchmark.js
```

Para una auditoría de usuario real, usar Lighthouse o Chrome DevTools en una ventana de incógnito y registrar FCP, LCP, TBT y tamaño de transferencia con la misma red y viewport. En CSR se debe observar que el HTML inicial no incluye el catálogo; en SSR sí incluye `hero-title` y los productos.

La métrica `Server-Timing: ssr;dur=...` permite separar el tiempo de renderizado del servidor del tiempo de red.

## 4. Conclusión para la PWA

- Conviene **SSR** en la página de inicio, páginas de producto, categorías y contenido informativo: son rutas públicas, indexables y sensibles a la primera carga.
- Conviene **CSR** en carrito, checkout, sesión, filtros, panel de usuario y acciones que cambian mucho de estado: son experiencias autenticadas o altamente interactivas donde el SEO no es prioritario.
- Una estrategia híbrida es la opción adecuada: SSR para el contenido inicial y CSR/hidratación para carrito, autenticación y navegación posterior.
