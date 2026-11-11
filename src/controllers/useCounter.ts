import { useCallback } from 'react';
import { useCounterContext } from '../context/CounterContext';

/**
 * Controller (Custom Hook) del contador global.
 * El componente solo ve `count` e `increment`: no conoce el contexto,
 * ni el reducer, ni el nombre de las acciones.
 */
export interface UseCounterResult {
  count: number;
  increment: () => void;
}

export const useCounter = (): UseCounterResult => {
  const { state, dispatch } = useCounterContext();

  const increment = useCallback((): void => dispatch({ type: 'increment' }), [dispatch]);

  return { count: state.count, increment };
};
