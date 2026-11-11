import { useCallback } from 'react';
import { useUserContext } from '../context/UserContext';
import { User } from '../models/user.model';

/**
 * Controller mínimo para la SELECCIÓN de usuario (estado global, sin peticiones).
 * Separarlo de `useUsers` permite que una vista use la selección sin disparar
 * como efecto secundario la descarga del listado (principio de responsabilidad única).
 */
export interface UseUserSelectionResult {
  selectedUser: User | null;
  selectUser: (user: User) => void;
  clearSelection: () => void;
}

export const useUserSelection = (): UseUserSelectionResult => {
  const { state, dispatch } = useUserContext();

  // `useCallback` mantiene la misma referencia de función entre renders.
  const selectUser = useCallback(
    (user: User): void => dispatch({ type: 'select_user', payload: user }),
    [dispatch],
  );

  const clearSelection = useCallback((): void => dispatch({ type: 'clear_user' }), [dispatch]);

  return { selectedUser: state.selectedUser, selectUser, clearSelection };
};
