import { useState } from 'react';

/**
 * Página de inicio: ejemplo de ESTADO LOCAL con `useState`.
 * El contador solo le interesa a este componente, así que no tiene sentido
 * llevarlo al estado global. Al desmontar el componente, el estado se pierde.
 */
export const Home = (): JSX.Element => {
  const [count, setCount] = useState<number>(0);

  // Actualización funcional: `prev => prev + 1` garantiza partir del valor más
  // reciente aunque React agrupe (batch) varias actualizaciones seguidas.
  const increment = (): void => setCount((prev: number): number => prev + 1);

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
