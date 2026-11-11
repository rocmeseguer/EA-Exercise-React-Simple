import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../controllers/useUsers';
import { User } from '../../models/user.model';
import { ErrorMessage } from '../common/ErrorMessage';
import { Loading } from '../common/Loading';
import { UserList } from './UserList';

/**
 * Componente "contenedor" de la ruta /users.
 *
 *  - La LISTA de usuarios es estado GLOBAL (useUsers → Context): se descarga una
 *    vez y se reutiliza en toda la app.
 *  - El usuario SELECCIONADO es estado LOCAL (useState): solo le importa a esta
 *    vista. Al navegar al detalle el componente se desmonta y, al volver, se
 *    monta de nuevo con `selectedUser = null` (sin selección).
 */
export const UserListPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { users, status, error, reload } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Renderizado condicional según el ciclo de vida de la petición.
  if (status === 'idle' || status === 'loading') {
    return <Loading message="Cargando usuarios..." />;
  }

  if (status === 'error') {
    return <ErrorMessage message={error ?? 'Error desconocido.'} onRetry={(): void => void reload()} />;
  }

  return (
    <div>
      <UserList users={users} selectedUserId={selectedUser?.id ?? null} onSelect={setSelectedUser} />
      {selectedUser && (
        <div>
          <p>Usuario seleccionado: {selectedUser.name}</p>
          <button type="button" onClick={(): void => navigate(`/users/${selectedUser.id}`)}>
            Ver detalle
          </button>
        </div>
      )}
    </div>
  );
};
