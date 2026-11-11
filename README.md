# Gestión de Estado en React Exercise Simple

Frontend en **React + TypeScript** que consume la API REST de usuarios (Express).
Demuestra los dos tipos de gestión de estado en React y una arquitectura de capas limpia.

> 📘 La explicación teórica de cada concepto, con ejemplos del propio código, está en **[CONCEPTS.md](./CONCEPTS.md)**.

## Puesta en marcha

```bash
npm install
npm start            # http://localhost:3000 (abre otro puerto si la API ya usa el 3000)
```

Por defecto la app usa **datos simulados**, así que funciona sin backend.
Para conectarla a tu API de Express:

```bash
cp .env.example .env.local
# edita REACT_APP_API_URL, p. ej. http://localhost:3000/api
```

La API debe exponer `GET /users` → `User[]` y `GET /users/:id` → `User`, con `User = { id: number; name: string }`.

## Estructura

```text
src/
├── components/     # UI (presentacionales y contenedores *Page)
├── context/        # UserContext (Provider) + user.reducer (función pura)
├── controllers/    # Custom Hooks: useUsers, useUserDetail, useUserSelection
├── models/         # Tipos: user.model, api.model, user-state.model
├── routes/         # AppRouter (mapa de rutas)
└── services/       # http.service (fetch genérico) + user.service (endpoints)
```

## Los dos tipos de estado

| | Estado local (`useState`) | Estado global (Context + `useReducer`) |
| --- | --- | --- |
| Ejemplo | Contador de `Home.tsx`, carga del detalle en `useUserDetail.ts` | Lista de usuarios y usuario seleccionado (`UserContext.tsx`) |
| Alcance | Un solo componente | Cualquier componente dentro de `<UserProvider>` |
| Flujo | Componente → `setState` → re-render | Componente → controller → `dispatch(acción)` → reducer → Context → re-render |

### Acciones del estado global

- `fetch_users_start` / `fetch_users_success` / `fetch_users_error`: ciclo de vida de `GET /users`.
- `select_user`: selecciona un usuario.
- `clear_user`: limpia el usuario seleccionado.

## Scripts

- `npm start`: servidor de desarrollo.
- `npm run build`: build de producción.
- `npx tsc --noEmit`: comprobación de tipos.
