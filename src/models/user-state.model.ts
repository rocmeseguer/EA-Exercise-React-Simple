import { RequestStatus } from './api.model';
import { User } from './user.model';

/**
 * Forma del estado GLOBAL de usuarios (gestionado con Context + useReducer).
 * Todo es `readonly`: el reducer siempre devuelve un objeto nuevo.
 */
export interface UserState {
  readonly users: readonly User[];
  readonly status: RequestStatus;
  readonly error: string | null;
  readonly selectedUser: User | null;
}

/**
 * Acciones que pueden modificar el estado global.
 *
 * Es una "unión discriminada" por la propiedad `type`: dentro de cada `case`
 * del reducer, TypeScript sabe exactamente qué `payload` hay disponible.
 */
export type UserAction =
  | { type: 'fetch_users_start' }
  | { type: 'fetch_users_success'; payload: readonly User[] }
  | { type: 'fetch_users_error'; payload: string }
  | { type: 'select_user'; payload: User }
  | { type: 'clear_user' };
