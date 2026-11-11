/**
 * Forma del estado GLOBAL del contador (Context + useReducer).
 * Vive en un Provider en la raíz de la app, por lo que NO se pierde
 * cuando el componente `Home` se desmonta al navegar a otra ruta.
 */
export interface CounterState {
  readonly count: number;
}

/**
 * Acciones del contador (unión discriminada por `type`).
 * Aunque ahora solo haya una, el patrón permite añadir más
 * (p. ej. `decrement`, `reset`) sin cambiar la forma del código.
 */
export type CounterAction = { type: 'increment' };
