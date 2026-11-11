import { UserAction, UserState } from '../models/user-state.model';

export const initialUserState: UserState = {
  users: [],
  status: 'idle',
  error: null,
};

/**
 * Reducer: función PURA `(estadoActual, acción) => estadoNuevo`.
 *
 * Reglas de oro:
 *  - No muta `state`: siempre devuelve un objeto nuevo con el operador spread.
 *  - No tiene efectos secundarios (nada de fetch, timers ni console.log).
 *  - Mismo input => mismo output. Por eso es trivial de testear y de depurar.
 *
 * Al vivir en su propio fichero (sin JSX ni React) se puede testear de forma aislada.
 */
export const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'fetch_users_start':
      return { ...state, status: 'loading', error: null };
    case 'fetch_users_success':
      return { ...state, status: 'success', users: action.payload };
    case 'fetch_users_error':
      return { ...state, status: 'error', error: action.payload };
    default: {
      // Comprobación exhaustiva: si alguien añade una acción nueva a `UserAction`
      // y olvida tratarla aquí, TypeScript dará un error de compilación.
      const unhandled: never = action;
      return unhandled;
    }
  }
};
