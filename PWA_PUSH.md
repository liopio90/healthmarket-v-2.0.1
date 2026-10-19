# Notificaciones push y APIs del dispositivo

## Flujo push

1. La persona pulsa el botón; la aplicación consulta el permiso y el navegador lo solicita si aún está en estado `default`. No se pide permiso al cargar la página.
2. Con permiso concedido, el navegador crea una suscripción con `PushManager.subscribe()` y la clave pública VAPID del backend.
3. El frontend guarda la suscripción en PostgreSQL mediante `/api/push/subscribe`. El backend la usa para enviar una prueba a ese dispositivo.
4. El servicio push del navegador entrega el mensaje al service worker aunque la aplicación no esté abierta. El evento `push` muestra la notificación y `notificationclick` abre la aplicación.

La ubicación también se solicita solo al pulsar el botón. Si se deniega, la interfaz explica cómo cambiarlo en la configuración del sitio. Las coordenadas se muestran en el navegador y no se transmiten al servidor.

## Configuración y prueba local

Web Push necesita HTTPS, salvo en `localhost`, y claves VAPID. Desde la raíz del proyecto, genera una pareja una vez:

```powershell
npm --prefix backend exec web-push generate-vapid-keys
```

Configura las claves en el archivo `.env` de la raíz (no las publiques ni las incluyas en el frontend):

```dotenv
VAPID_PUBLIC_KEY=clave_publica_generada
VAPID_PRIVATE_KEY=clave_privada_generada
VAPID_CONTACT=mailto:admin@example.com
```

Con PostgreSQL disponible y configurado como para el resto del backend, inicia Express y la PWA en dos terminales:

```powershell
npm run start:backend
npm run dev
```

Abre `http://localhost:3000`, concede el permiso en el navegador y pulsa **Activar y enviar prueba**. Para probar la versión construida con su service worker de producción, usa `npm --prefix frontend run build` y `npm --prefix frontend run preview`; abre `http://127.0.0.1:4173`.

Si se deniega el permiso, el navegador no permite volver a mostrar automáticamente el diálogo: hay que habilitar notificaciones desde los ajustes del sitio y recargar. En despliegue, configura HTTPS y un proxy del mismo origen que enrute `/api` al backend. El backend conserva las suscripciones hasta que el dispositivo las desactive o el servicio push las reporte caducadas.