import { User } from '../../models/user.model';

interface UserListItemProps {
  user: User;
  isSelected: boolean;
  onSelect: (user: User) => void;
}

/**
 * Elemento de la lista. Es "tonto" (presentacional): todo lo que necesita
 * llega por props, que son de SOLO LECTURA. Para cambiar algo, notifica al
 * padre mediante el callback `onSelect` (los datos bajan, los eventos suben).
 */
export const UserListItem = ({ user, isSelected, onSelect }: UserListItemProps): JSX.Element => (
  <li>
    <button type="button" aria-pressed={isSelected} onClick={(): void => onSelect(user)}>
      {user.name}
    </button>
  </li>
);
