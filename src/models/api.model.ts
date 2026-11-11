/**
 * Tipos relacionados con la comunicación HTTP con la API REST.
 */

/**
 * Ciclo de vida de una petición asíncrona.
 * Una unión de literales es más expresiva y segura que varios booleanos
 * (`isLoading`, `hasError`...) que podrían contradecirse entre sí.
 */
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

/** Categorías de error HTTP que la UI puede querer distinguir. */
export type HttpErrorKind =
  | 'network' // No hay conexión o el servidor no responde
  | 'timeout' // La petición ha tardado demasiado
  | 'http' // El servidor ha respondido con un código 4xx / 5xx
  | 'invalid_response'; // El cuerpo no tiene la forma esperada

/** Firma genérica de un type guard: permite validar cualquier respuesta. */
export type TypeGuard<T> = (value: unknown) => value is T;
