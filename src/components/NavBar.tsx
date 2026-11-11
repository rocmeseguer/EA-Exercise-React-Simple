import { Link } from 'react-router-dom';

/**
 * Barra de navegación. `Link` cambia la URL SIN recargar la página
 * (navegación del lado del cliente, típica de una SPA).
 */
export const NavBar = (): JSX.Element => (
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
