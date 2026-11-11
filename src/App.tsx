import { UserProvider } from './context/UserContext';
import { AppRouter } from './routes/AppRouter';

/**
 * Componente raíz. Su única responsabilidad es COMPONER la aplicación:
 * el Provider envuelve al router para que todas las vistas compartan
 * el mismo estado global de usuarios.
 */
export const App = (): JSX.Element => (
  <UserProvider>
    <AppRouter />
  </UserProvider>
);
