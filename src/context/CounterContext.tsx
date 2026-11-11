import { createContext, Dispatch, ReactNode, useContext, useMemo, useReducer } from 'react';
import { CounterAction, CounterState } from '../models/counter-state.model';
import { counterReducer, initialCounterState } from './counter.reducer';

/**
 * Estado GLOBAL del contador: Context API + useReducer.
 *
 * ¿Por qué un contexto separado del de usuarios? Cada contexto tiene una única
 * responsabilidad y, además, un cambio en el contador solo re-renderiza a los
 * componentes suscritos a ESTE contexto (no a los que leen usuarios).
 */

interface CounterContextValue {
  readonly state: CounterState;
  readonly dispatch: Dispatch<CounterAction>;
}

const CounterContext = createContext<CounterContextValue | undefined>(undefined);

interface CounterProviderProps {
  children: ReactNode;
}

export const CounterProvider = ({ children }: CounterProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(counterReducer, initialCounterState);

  // Memoizamos `value` para no crear un objeto nuevo en cada render del Provider.
  const value: CounterContextValue = useMemo(
    (): CounterContextValue => ({ state, dispatch }),
    [state],
  );

  return <CounterContext.Provider value={value}>{children}</CounterContext.Provider>;
};

export const useCounterContext = (): CounterContextValue => {
  const context: CounterContextValue | undefined = useContext(CounterContext);
  if (context === undefined) {
    throw new Error('useCounterContext debe usarse dentro de un <CounterProvider>.');
  }
  return context;
};
