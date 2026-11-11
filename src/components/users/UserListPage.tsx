import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../controllers/useUsers';
import { User } from '../../models/user.model';
import { ErrorMessage } from '../common/ErrorMessage';
import { Loading } from '../common/Loading';
import { UserList } from './UserList';

/**
 * Componente "contenedor" de la ruta /users.
 * Obtiene datos y acciones del controller (`useUsers`) y decide QUÉ pintar
 * según el estado de la petición: Cargando, Error o Éxito.
 */
export const UserListPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { users, status, error, selectedUser, selectUser, reload } = useUsers();

  const handleSelect = (user: User): void => {
    selectUser(user); // 1) Actualiza el estado global
    navigate(`/users/${user.id}`); // 2) Navega al detalle
  };

  // Renderizado condicional según el ciclo de vida de la petición.
  if (status === 'idle' || status === 'loading') {
    return <Loading message="Cargando usuarios..." />;
  }

  if (status === 'error') {
    return <ErrorMessage message={error ?? 'Error desconocido.'} onRetry={(): void => void reload()} />;
  }

  return (
    <div>
      <UserList users={users} selectedUserId={selectedUser?.id ?? null} onSelect={handleSelect} />
      {selectedUser && <p>Usuario seleccionado: {selectedUser.name}</p>}
    </div>
  );
};
