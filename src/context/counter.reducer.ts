import { CounterAction, CounterState } from '../models/counter-state.model';

export const initialCounterState: CounterState = {
  count: 0,
};

/**
 * Reducer PURO del contador: `(estado, acción) => estadoNuevo`.
 * Nunca muta `state`: devuelve un objeto nuevo con el operador spread.
 */
export const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    default: {
      // Comprobación exhaustiva: una acción nueva sin tratar => error de compilación.
      const unhandled: never = action.type;
      return unhandled;
    }
  }
};
