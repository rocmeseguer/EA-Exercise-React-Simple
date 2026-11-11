import { CounterProvider } from './context/CounterContext';
import { UserProvider } from './context/UserContext';
import { AppRouter } from './routes/AppRouter';

/**
 * Componente raíz. Su única responsabilidad es COMPONER la aplicación:
 * los Providers envuelven al router para que todas las vistas compartan
 * el mismo estado global (contador y usuarios) y este sobreviva a la navegación.
 */
export const App = (): JSX.Element => (
  <CounterProvider>
    <UserProvider>
      <AppRouter />
    </UserProvider>
  </CounterProvider>
);
