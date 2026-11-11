/**
 * Modelo de dominio: Usuario.
 *
 * Es la "forma" de los datos que devuelve la API REST (Express).
 * Usamos `readonly` para dejar claro, ya en el tipo, que un usuario
 * nunca se modifica in situ: si cambia, se crea un objeto nuevo.
 */
export interface User {
  readonly id: number;
  readonly name: string;
}

/**
 * Type guard: comprueba en tiempo de ejecución que un valor `unknown`
 * (p. ej. el JSON recibido por la red) tiene realmente la forma de `User`.
 *
 * ¿Por qué? TypeScript solo existe en compilación. Lo que llega del servidor
 * es, a efectos prácticos, `unknown`. Validarlo evita hacer un `as User`
 * "a ciegas" y que un error del backend explote más tarde en la UI.
 */
export const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'number' && typeof candidate.name === 'string';
};

/** Type guard para un array de usuarios (composición de funciones puras). */
export const isUserArray = (value: unknown): value is User[] =>
  Array.isArray(value) && value.every(isUser);
