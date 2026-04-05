import { useState, useCallback, useRef, useEffect } from 'react';
import type { Coordinates } from '../lib/mapbox';

export type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseGeolocationReturn {
  location: Coordinates | null;
  status: GeoStatus;
  error: string | null;
  requestLocation: () => void;
  watchLocation: () => void;
  stopWatching: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocalização não suportada pelo navegador.');
      return;
    }

    setStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permissão de localização negada. Ative nas configurações do navegador.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Localização indisponível. Verifique seu GPS.');
            break;
          case err.TIMEOUT:
            setError('Tempo limite excedido ao obter localização.');
            break;
          default:
            setError('Erro desconhecido ao obter localização.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocalização não suportada pelo navegador.');
      return;
    }

    setStatus('loading');
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permissão de localização negada.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Localização indisponível.');
            break;
          default:
            setError('Erro ao monitorar localização.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return { location, status, error, requestLocation, watchLocation, stopWatching };
}
