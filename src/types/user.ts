export interface User {
  id: number;
  name: string;
}

export interface State {
  selectedUser: User | null;
}

export type Action =
  | { type: "select_user"; payload: User }
  | { type: "clear_user" };
