import React, { createContext, useContext, useReducer, Dispatch } from "react";
import { State, Action } from "../types/user";

const initialState: State = {
  selectedUser: null
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select_user":
      return { ...state, selectedUser: action.payload };
    case "clear_user":
      return { ...state, selectedUser: null };
    default:
      return state;
  }
}

interface UserContextType {
  state: State;
  dispatch: Dispatch<Action>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext(): UserContextType {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within a UserProvider");
  return context;
}
