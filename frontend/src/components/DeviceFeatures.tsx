import { useEffect, useState } from 'react';
import { Bell, BellOff, LoaderCircle, MapPin } from 'lucide-react';

type PushState = 'checking' | 'ready' | 'subscribed' | 'denied' | 'unsupported';

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

function supportsPush() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function decodeVapidKey(value: string) {
  const padded = value + '='.repeat((4 - value.length % 4) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function DeviceFeatures() {
  const [pushState, setPushState] = useState<PushState>('checking');
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState('');
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (!supportsPush()) {
      setPushState('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setPushState('denied');
      return;
    }

    navigator.serviceWorker.getRegistration().then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription();
      setPushState(subscription ? 'subscribed' : 'ready');
    }).catch(() => setPushState('ready'));
  }, []);

  const enablePush = async () => {
    if (!supportsPush()) {
      setPushState('unsupported');
      setPushMessage('Este navegador no admite notificaciones push.');
      return;
    }

    if (Notification.permission === 'denied') {
      setPushState('denied');
      setPushMessage('El permiso está bloqueado. Cámbialo en la configuración del sitio del navegador.');
      return;
    }

    setPushBusy(true);
    setPushMessage('');
    try {
      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushState('denied');
        setPushMessage('No se activaron las notificaciones. Puedes cambiar el permiso en el navegador.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const keyResponse = await fetch('/api/push/public-key');
        const keyData = await keyResponse.json();
        if (!keyResponse.ok || !keyData.publicKey) {
          throw new Error(keyData.error || 'El servidor no está listo para enviar notificaciones.');
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidKey(keyData.publicKey),
        });
      }

      const subscribeResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
      const subscribeData = await subscribeResponse.json();
      if (!subscribeResponse.ok) {
        throw new Error(subscribeData.error || 'No se pudo guardar la suscripción.');
      }

      const testResponse = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      const testData = await testResponse.json();
      if (!testResponse.ok) {
        throw new Error(testData.error || 'No se pudo enviar la notificación de prueba.');
      }

      setPushState('subscribed');
      setPushMessage('Suscripción activa. Se envió una notificación de prueba a este dispositivo.');
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : 'Ocurrió un error al activar las notificaciones.');
    } finally {
      setPushBusy(false);
    }
  };

  const disablePush = async () => {
    setPushBusy(true);
    setPushMessage('');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setPushState('ready');
      setPushMessage('Notificaciones desactivadas en este dispositivo.');
    } catch {
      setPushMessage('No se pudo desactivar la suscripción. Inténtalo de nuevo.');
    } finally {
      setPushBusy(false);
    }
  };

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationMessage('Este navegador no admite geolocalización.');
      return;
    }

    setLocationBusy(true);
    setLocationMessage('');
    setCoordinates(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
        setLocationBusy(false);
      },
      (error) => {
        const messages: Record<number, string> = {
          1: 'Permiso de ubicación denegado. Puedes habilitarlo en la configuración del navegador.',
          2: 'No se pudo determinar la ubicación del dispositivo.',
          3: 'La solicitud de ubicación agotó el tiempo de espera.',
        };
        setLocationMessage(messages[error.code] || 'No se pudo obtener la ubicación.');
        setLocationBusy(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <section className="border-y border-gray-200 bg-gray-50 py-12" aria-labelledby="device-features-title">
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:gap-16">
        <div>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-800">
            <Bell size={21} aria-hidden="true" />
          </div>
          <h2 id="device-features-title" className="text-2xl font-semibold text-gray-900">Notificaciones y dispositivo</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">
            Recibe avisos aunque Health Market no esté abierto. La prueba se envía mediante el servicio push del navegador.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={enablePush}
              disabled={pushBusy || pushState === 'checking' || pushState === 'denied' || pushState === 'unsupported'}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pushBusy ? <LoaderCircle className="animate-spin" size={17} /> : <Bell size={17} />}
              {pushState === 'subscribed' ? 'Enviar prueba push' : 'Activar y enviar prueba'}
            </button>
            {pushState === 'subscribed' && (
              <button
                type="button"
                onClick={disablePush}
                disabled={pushBusy}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-white disabled:opacity-50"
              >
                <BellOff size={17} /> Desactivar
              </button>
            )}
          </div>
          <p className="mt-3 min-h-5 text-sm text-gray-600" aria-live="polite">
            {pushMessage || (pushState === 'denied'
              ? 'Permiso denegado. Habilítalo desde la configuración del sitio en el navegador.'
              : pushState === 'unsupported'
                ? 'Push no está disponible en este navegador o contexto.'
                : pushState === 'subscribed'
                  ? 'Este dispositivo está suscrito a las notificaciones.'
                  : 'El permiso se solicitará solo cuando pulses el botón.')}
          </p>
        </div>

        <div>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <MapPin size={21} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Ubicación del dispositivo</h3>
          <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">
            Usa la geolocalización del navegador para consultar tu posición aproximada. No se envía ni se guarda en el servidor.
          </p>
          <button
            type="button"
            onClick={requestLocation}
            disabled={locationBusy}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:opacity-50"
          >
            {locationBusy ? <LoaderCircle className="animate-spin" size={17} /> : <MapPin size={17} />}
            Compartir ubicación
          </button>
          {(coordinates || locationMessage) && (
            <p className="mt-3 text-sm text-gray-700" aria-live="polite">
              {coordinates
                ? `Latitud ${coordinates.latitude.toFixed(4)}, longitud ${coordinates.longitude.toFixed(4)} (precisión ±${Math.round(coordinates.accuracy)} m)`
                : locationMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}