import { Outlet } from 'react-router-dom';

/**
 * Layout de la sección de usuarios (rutas anidadas).
 * `<Outlet />` es el "hueco" donde React Router pinta la ruta hija activa
 * (listado o detalle), manteniendo la cabecera común.
 */
export const UsersLayout = (): JSX.Element => (
  <div>
    <h2>Users Section</h2>
    <Outlet />
  </div>
);
