import { useEffect, useMemo, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { User } from '../models/user.model';
import { getErrorMessage, isAbortError } from '../services/http.service';
import { getUserById } from '../services/user.service';

/**
 * Controller (Custom Hook) del detalle de un usuario.
 *
 * A diferencia del listado, este dato es EFÍMERO y solo lo usa una vista,
 * así que su estado de carga se gestiona con `useState` local (no global).
 *
 * Estrategia:
 *  1. Si el usuario ya está en el estado global (lo cargó el listado), se usa
 *     directamente: cero peticiones extra.
 *  2. Si no (p. ej. se entra directamente por URL a /users/2), se pide a la API.
 */

export interface UseUserDetailResult {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/** Función pura: convierte el parámetro de la URL (string) en un id válido. */
export const parseUserId = (rawId: string | undefined): number | null => {
  const id: number = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const useUserDetail = (rawId: string | undefined): UseUserDetailResult => {
  const { state } = useUserContext();
  const userId: number | null = parseUserId(rawId);

  // Valor DERIVADO del estado global: se calcula, no se duplica en otro useState.
  const cachedUser: User | null = useMemo(
    (): User | null => state.users.find((user: User): boolean => user.id === userId) ?? null,
    [state.users, userId],
  );

  // Estado local para el caso "no estaba en caché".
  const [fetchedUser, setFetchedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect((): (() => void) | void => {
    if (userId === null || cachedUser !== null) return;

    // AbortController: si el id cambia o el componente se desmonta antes de que
    // llegue la respuesta, cancelamos la petición. Así evitamos "race conditions"
    // (una respuesta antigua que pisa a una nueva) y actualizar un componente desmontado.
    const controller: AbortController = new AbortController();

    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setFetchedUser(null);
      try {
        const user: User = await getUserById(userId, controller.signal);
        setFetchedUser(user);
      } catch (err: unknown) {
        if (isAbortError(err)) return; // Cancelación voluntaria: no es un error de la UI.
        setError(getErrorMessage(err));
      } finally {
        // Se ejecuta tanto si hubo éxito como error: apagamos el indicador de carga
        // (salvo que la petición se haya cancelado y el efecto ya no esté vigente).
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void load();

    // Función de limpieza del efecto.
    return (): void => controller.abort();
  }, [userId, cachedUser]);

  if (userId === null) {
    return { user: null, isLoading: false, error: `"${rawId ?? ''}" no es un identificador válido.` };
  }
  if (cachedUser !== null) {
    return { user: cachedUser, isLoading: false, error: null };
  }
  // Solo devolvemos el usuario descargado si corresponde al id actual de la URL
  // (evita mostrar un instante el usuario anterior al navegar entre detalles).
  const currentUser: User | null = fetchedUser?.id === userId ? fetchedUser : null;
  return { user: currentUser, isLoading, error };
};
