import { useCounter } from '../controllers/useCounter';

/**
 * Página de inicio: ejemplo de ESTADO GLOBAL (Context + useReducer).
 *
 * `Home` se desmonta cada vez que navegamos a /users, pero el valor de `count`
 * no vive en el componente sino en el `CounterProvider` (en la raíz de la app),
 * así que al volver a Home el contador CONSERVA su valor.
 */
export const Home = (): JSX.Element => {
  const { count, increment } = useCounter();

  return (
    <div>
      <h1>Home Page</h1>
      <p>Count: {count}</p>
      <button type="button" onClick={increment}>
        Increment
      </button>
    </div>
  );
};
