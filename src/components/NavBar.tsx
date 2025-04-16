import React from 'react';
import { Link } from 'react-router-dom';

export function NavBar(): JSX.Element {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/users">Users</Link>
        </li>
      </ul>
    </nav>
  );
}
