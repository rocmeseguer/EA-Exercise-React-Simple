import React from 'react';
import { useParams } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';

export function UserDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { state } = useUserContext();
  
  return (
    <div>
      <h3>Detalle del usuario con ID: {id}</h3>
      {state.selectedUser && <p>Nombre: {state.selectedUser.name}</p>}
    </div>
  );
}
