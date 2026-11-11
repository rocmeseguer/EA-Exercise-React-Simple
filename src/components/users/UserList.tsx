import { User } from '../../models/user.model';
import { UserListItem } from './UserListItem';

interface UserListProps {
  users: readonly User[];
  selectedUserId: number | null;
  onSelect: (user: User) => void;
}

/**
 * Lista presentacional: transforma datos en elementos con `map` (función pura).
 *
 * La `key` debe ser un identificador ESTABLE y ÚNICO (el id de la BD), nunca el
 * índice del array: así React sabe qué elemento es cuál entre renders y puede
 * reordenar/insertar/eliminar nodos del DOM de forma mínima y correcta.
 */
export const UserList = ({ users, selectedUserId, onSelect }: UserListProps): JSX.Element => {
  if (users.length === 0) {
    return <p>No hay usuarios registrados.</p>;
  }

  return (
    <ul>
      {users.map(
        (user: User): JSX.Element => (
          <UserListItem
            key={user.id}
            user={user}
            isSelected={user.id === selectedUserId}
            onSelect={onSelect}
          />
        ),
      )}
    </ul>
  );
};
