import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/user';
import { useUserContext } from '../../context/UserContext';

export function UserList(): JSX.Element {
  const navigate = useNavigate();
  const users: User[] = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ];

  const { state, dispatch } = useUserContext();

  return (
    <div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <button
              onClick={() => {
                dispatch({ type: "select_user", payload: user });
                navigate(`/users/${user.id}`);
              }}
            >
              {user.name}
            </button>
          </li>
        ))}
      </ul>
      {state.selectedUser && <p>Usuario seleccionado: {state.selectedUser.name}</p>}
    </div>
  );
}
