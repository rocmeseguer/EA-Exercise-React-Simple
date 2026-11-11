import { User } from '../models/user.model';

/**
 * Datos simulados, usados cuando no hay backend configurado.
 * Permiten ejecutar la demo sin la API de Express y, aun así, ver
 * los estados de Cargando / Éxito / Error en la interfaz.
 */
export const MOCK_USERS: readonly User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const MOCK_LATENCY_MS: number = 600;

/**
 * Simula la latencia de red respetando la cancelación (`AbortSignal`),
 * igual que haría un `fetch` real.
 */
export const simulateLatency = (signal?: AbortSignal): Promise<void> =>
  new Promise<void>((resolve, reject): void => {
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(resolve, MOCK_LATENCY_MS);
    signal?.addEventListener('abort', (): void => {
      clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
