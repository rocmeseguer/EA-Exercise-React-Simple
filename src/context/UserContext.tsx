import { createContext, Dispatch, ReactNode, useContext, useMemo, useReducer } from 'react';
import { UserAction, UserState } from '../models/user-state.model';
import { initialUserState, userReducer } from './user.reducer';

/**
 * Estado GLOBAL de usuarios: Context API + useReducer.
 *
 *  - `useReducer` centraliza CÓMO cambia el estado (lógica predecible, tipo Redux).
 *  - `Context` resuelve DÓNDE está disponible: cualquier componente descendiente
 *    puede leerlo sin pasar props manualmente nivel a nivel ("prop drilling").
 */

interface UserContextValue {
  readonly state: UserState;
  readonly dispatch: Dispatch<UserAction>;
}

// `undefined` como valor por defecto: permite detectar un uso fuera del Provider.
const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  // Memoizamos el objeto `value`: si no, se crearía uno nuevo en cada render del
  // Provider y TODOS los consumidores se re-renderizarían aunque nada cambiase.
  const value: UserContextValue = useMemo(
    (): UserContextValue => ({ state, dispatch }),
    [state],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Hook de acceso al contexto. Encapsula `useContext` y garantiza, en tiempo de
 * ejecución y de tipos, que el valor nunca es `undefined`.
 */
export const useUserContext = (): UserContextValue => {
  const context: UserContextValue | undefined = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext debe usarse dentro de un <UserProvider>.');
  }
  return context;
};
