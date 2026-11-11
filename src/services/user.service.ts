import { isUser, isUserArray, User } from '../models/user.model';
import { API_BASE_URL, HttpError, httpGet } from './http.service';
import { MOCK_USERS, simulateLatency } from './user.mock';

/**
 * Servicio de usuarios: traduce operaciones de dominio ("dame los usuarios")
 * a llamadas HTTP concretas contra la API REST de Express.
 *
 *   GET /users       -> User[]
 *   GET /users/:id   -> User
 *
 * Son funciones puras respecto a React: no usan hooks ni conocen la UI,
 * por lo que se pueden testear y reutilizar en cualquier contexto.
 */

const USE_MOCK: boolean = API_BASE_URL === undefined;

export const getUsers = async (signal?: AbortSignal): Promise<readonly User[]> => {
  if (USE_MOCK) {
    await simulateLatency(signal);
    return MOCK_USERS;
  }
  return httpGet<User[]>('/users', isUserArray, signal);
};

export const getUserById = async (id: number, signal?: AbortSignal): Promise<User> => {
  if (USE_MOCK) {
    await simulateLatency(signal);
    const found: User | undefined = MOCK_USERS.find((user: User): boolean => user.id === id);
    if (found === undefined) {
      throw new HttpError('http', `Error 404: el usuario ${id} no existe.`, 404);
    }
    return found;
  }
  return httpGet<User>(`/users/${id}`, isUser, signal);
};
