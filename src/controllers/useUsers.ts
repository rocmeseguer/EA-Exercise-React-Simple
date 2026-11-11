import { useCallback, useEffect } from 'react';
import { useUserContext } from '../context/UserContext';
import { RequestStatus } from '../models/api.model';
import { User } from '../models/user.model';
import { getErrorMessage } from '../services/http.service';
import { getUsers } from '../services/user.service';

/**
 * Controller (Custom Hook) del listado de usuarios.
 *
 * Hace de "pegamento" entre la UI y la lógica:
 *   Componente -> useUsers() -> userService -> API REST
 *                    \-> dispatch(...) -> reducer -> Context -> re-render
 *
 * El componente solo recibe datos y callbacks; no sabe nada de fetch, de
 * reducers ni de cómo se gestionan los errores.
 */

export interface UseUsersResult {
  users: readonly User[];
  status: RequestStatus;
  error: string | null;
  reload: () => Promise<void>;
}

export const useUsers = (): UseUsersResult => {
  const { state, dispatch } = useUserContext();

  // `useCallback` mantiene la misma referencia de función entre renders,
  // así puede usarse como dependencia de `useEffect` sin provocar bucles.
  const loadUsers = useCallback(async (): Promise<void> => {
    dispatch({ type: 'fetch_users_start' });
    try {
      const users: readonly User[] = await getUsers();
      dispatch({ type: 'fetch_users_success', payload: users });
    } catch (error: unknown) {
      dispatch({ type: 'fetch_users_error', payload: getErrorMessage(error) });
    }
    // Sin `finally`: no hay un booleano `isLoading` que "apagar", porque la
    // transición loading -> success | error ya la hace el reducer en try/catch.
    // Los recursos de red (timeout, listeners) se liberan en el `finally` de `httpGet`.
  }, [dispatch]);

  // Efecto: cargar los usuarios SOLO la primera vez (estado 'idle').
  // Como los datos viven en el estado global, si volvemos a esta vista
  // se reutilizan sin repetir la petición (caché en memoria).
  //
  // No cancelamos la petición al desmontar: su resultado se guarda en el
  // Provider (que vive en la raíz de la app), no en este componente.
  useEffect((): void => {
    if (state.status === 'idle') {
      void loadUsers();
    }
  }, [state.status, loadUsers]);

  return {
    users: state.users,
    status: state.status,
    error: state.error,
    reload: loadUsers,
  };
};
