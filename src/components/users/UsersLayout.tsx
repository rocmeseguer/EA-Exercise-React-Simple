import React from 'react';
import { Outlet } from 'react-router-dom';

export function UsersLayout(): JSX.Element {
  return (
    <div>
      <h2>Users Section</h2>
      <Outlet />
    </div>
  );
}
