import { HttpErrorKind, TypeGuard } from '../models/api.model';

/**
 * Capa de servicios: cliente HTTP genérico.
 *
 * Esta es la ÚNICA parte de la aplicación que sabe que existe `fetch`.
 * Los componentes no hacen peticiones: llaman a hooks (controllers), que a su
 * vez llaman a servicios. Así, si mañana cambiamos `fetch` por `axios`, solo
 * se toca este fichero.
 */

/**
 * URL base de la API de Express. Se configura con la variable de entorno
 * `REACT_APP_API_URL` (fichero `.env.local`), p. ej.:
 *   REACT_APP_API_URL=http://localhost:3000/api
 * Si no está definida, `user.service.ts` usa datos simulados (mock).
 */
export const API_BASE_URL: string | undefined = process.env.REACT_APP_API_URL;

const DEFAULT_TIMEOUT_MS: number = 8000;

/** Error de dominio propio: transporta la categoría y el código HTTP. */
export class HttpError extends Error {
  readonly kind: HttpErrorKind;
  readonly status: number | null;

  constructor(kind: HttpErrorKind, message: string, status: number | null = null) {
    super(message);
    this.name = 'HttpError';
    this.kind = kind;
    this.status = status;
    // Necesario al heredar de Error con target ES5 para que `instanceof` funcione.
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/** ¿El error se debe a que alguien canceló la petición (p. ej. al desmontar)? */
export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

/**
 * Convierte cualquier error (`unknown`) en un mensaje apto para la UI.
 * En un `catch`, TypeScript tipa el error como `unknown`: nunca asumimos su forma.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof HttpError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ha ocurrido un error inesperado.';
};

/**
 * GET genérico y tipado.
 *
 * @param path    Ruta relativa a `API_BASE_URL` (p. ej. `/users`).
 * @param guard   Type guard que valida la respuesta en tiempo de ejecución.
 * @param signal  Señal opcional para cancelar la petición desde fuera.
 */
export const httpGet = async <T>(
  path: string,
  guard: TypeGuard<T>,
  signal?: AbortSignal,
): Promise<T> => {
  if (API_BASE_URL === undefined) {
    throw new HttpError('network', 'La URL de la API (REACT_APP_API_URL) no está configurada.');
  }

  // Controlador interno: permite abortar por timeout Y por cancelación externa.
  const controller: AbortController = new AbortController();
  let timedOut: boolean = false;
  const timeoutId: ReturnType<typeof setTimeout> = setTimeout((): void => {
    timedOut = true;
    controller.abort();
  }, DEFAULT_TIMEOUT_MS);
  const forwardAbort = (): void => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  try {
    const response: Response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    // `fetch` NO lanza error con 404 o 500: hay que comprobar `ok` a mano.
    if (!response.ok) {
      throw new HttpError('http', `Error ${response.status}: ${response.statusText}`, response.status);
    }

    const data: unknown = await response.json();
    if (!guard(data)) {
      throw new HttpError('invalid_response', 'La respuesta del servidor no tiene el formato esperado.');
    }
    return data;
  } catch (error: unknown) {
    // Errores ya tipados: los propagamos tal cual.
    if (error instanceof HttpError) throw error;
    // Cancelación: distinguimos timeout (error real) de cancelación del llamante.
    if (isAbortError(error)) {
      if (timedOut) throw new HttpError('timeout', 'El servidor ha tardado demasiado en responder.');
      throw error;
    }
    // Cualquier otro caso (TypeError de fetch, JSON mal formado...).
    throw new HttpError('network', 'No se ha podido contactar con el servidor.');
  } finally {
    // `finally` se ejecuta SIEMPRE (éxito o error): lugar ideal para liberar recursos.
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', forwardAbort);
  }
};
