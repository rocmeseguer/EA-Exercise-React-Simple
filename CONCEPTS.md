# Conceptos clave de React + TypeScript

> Documento de referencia teórica del proyecto **EA-Exercise-React-Simple**.
> Cada sección incluye **qué es**, un **ejemplo real** extraído del código de `src/` y **por qué** se ha diseñado así.

## Índice

0. [Arquitectura de capas del cliente](#0-arquitectura-de-capas-del-cliente)
1. [Virtual DOM vs. DOM real](#1-virtual-dom-vs-dom-real)
2. [TSX y componentes funcionales con funciones flecha (sin `React.FC`)](#2-tsx-y-componentes-funcionales-con-funciones-flecha-sin-reactfc)
3. [Inmutabilidad de las props y flujo de datos unidireccional](#3-inmutabilidad-de-las-props-y-flujo-de-datos-unidireccional)
4. [Estado local con `useState`](#4-estado-local-con-usestate)
5. [Estado global con Context API + `useReducer`](#5-estado-global-con-context-api--usereducer)
6. [Lógica asíncrona con `useEffect` + Custom Hooks](#6-lógica-asíncrona-con-useeffect--custom-hooks)
7. [Manejo defensivo de errores HTTP (`try` / `catch` / `finally`)](#7-manejo-defensivo-de-errores-http-try--catch--finally)
8. [Renderizado de listas y la propiedad `key`](#8-renderizado-de-listas-y-la-propiedad-key)
9. [Resumen del flujo de datos](#9-resumen-del-flujo-de-datos)

---

## 0. Arquitectura de capas del cliente

Antes de entrar en los conceptos, conviene entender **dónde vive cada cosa**:

```text
src/
├── components/     # UI: qué se ve. No hace fetch ni contiene lógica de negocio.
│   ├── common/     #   Loading, ErrorMessage (reutilizables)
│   └── users/      #   UserList, UserListItem (presentacionales) + *Page (contenedores)
├── context/        # Estado global: UserContext (Provider) + user.reducer (función pura)
├── controllers/    # Custom Hooks: useUsers, useUserDetail, useUserSelection
├── models/         # Tipos: user.model, api.model, user-state.model
├── routes/         # AppRouter: mapa de rutas de la aplicación
└── services/       # HTTP: http.service (fetch genérico), user.service (endpoints)
```

La regla es que **las dependencias solo apuntan "hacia abajo"**:

```text
components  ──▶  controllers  ──▶  services  ──▶  API REST (Express)
                     │
                     └──▶  context (estado global)
         (todas las capas usan  models/  para los tipos)
```

**¿Por qué?** Cada capa tiene una única razón para cambiar. Si cambia la URL de un endpoint, solo se toca `services/`. Si cambia el diseño, solo `components/`. Así es más fácil testear (un reducer o un servicio se prueban sin montar React) y trabajar en equipo.

> **Backend.** Por defecto la app usa datos simulados (`services/user.mock.ts`) para funcionar sin servidor. Para usar la API de Express, copia `.env.example` como `.env.local` y define `REACT_APP_API_URL` (p. ej. `http://localhost:3000/api`). La API debe exponer `GET /users` y `GET /users/:id`.

---

## 1. Virtual DOM vs. DOM real

### Definición

- El **DOM real** es el árbol de nodos HTML que el navegador pinta. Modificarlo es *caro*: cada cambio puede provocar recálculo de estilos, *layout* y repintado.
- El **Virtual DOM** es una representación ligera de ese árbol en forma de objetos JavaScript. Cada vez que el estado cambia, React:
  1. Vuelve a ejecutar los componentes afectados y obtiene un **nuevo** Virtual DOM.
  2. Lo **compara** con el anterior (*diffing* / *reconciliación*).
  3. Aplica al DOM real **solo las diferencias mínimas** (*commit*).

### Ejemplo en el proyecto

`src/index.tsx` es el único punto en el que tocamos el DOM real directamente:

```tsx
const rootElement: HTMLElement | null = document.getElementById('root');

if (rootElement === null) {
  throw new Error('No se ha encontrado el elemento #root en public/index.html.');
}

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement,
);
```

A partir de aquí, nunca escribimos `document.querySelector(...)` ni `element.innerHTML = ...`. Por ejemplo, al pulsar *Increment* en `Home.tsx`:

```tsx
<p>Count: {count}</p>
```

React recalcula el componente entero, pero al comparar ve que **solo ha cambiado un nodo de texto** y únicamente actualiza ese texto en el DOM real. El `<h1>` y el `<button>` ni se tocan.

### ¿Por qué?

- **Programación declarativa:** describimos *cómo debe verse la UI para un estado dado* (`UI = f(estado)`), no *los pasos para modificarla*. Desaparece toda una clase de errores (DOM desincronizado del estado).
- **Rendimiento razonable por defecto:** React agrupa cambios y minimiza operaciones sobre el DOM.
- **Nota:** el Virtual DOM no es "más rápido que el DOM" en sí mismo; lo que aporta es que, sin esfuerzo por nuestra parte, las actualizaciones sean *suficientemente eficientes* y el código mucho más mantenible.

---

## 2. TSX y componentes funcionales con funciones flecha

### Definición

- **TSX** es JSX con TypeScript: una sintaxis parecida a HTML que el compilador transforma en llamadas a funciones (`<p>Hola</p>` → `jsx('p', { children: 'Hola' })`). Por eso podemos incrustar expresiones con `{ }` y TypeScript comprueba tipos dentro del marcado.
- Un **componente funcional** es una función que recibe *props* y devuelve elementos de React. En este proyecto se escriben **siempre como funciones flecha, tipando las props directamente en el parámetro y el retorno como `JSX.Element`**.

### Ejemplo en el proyecto

`src/components/common/ErrorMessage.tsx`:

```tsx
interface ErrorMessageProps {
  message: string;
  /** Opcional: si se pasa, se muestra un botón de reintento. */
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps): JSX.Element => (
  <div role="alert">
    <p>⚠️ {message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry}>
        Reintentar
      </button>
    )}
  </div>
);
```

Fíjate en tres detalles:

1. Las props se definen en una `interface` con nombre (`ErrorMessageProps`), autodocumentada.
2. La desestructuración `({ message, onRetry }: ErrorMessageProps)` deja claro qué usa el componente.
3. El tipo de retorno `: JSX.Element` es explícito: si por error devolvemos `undefined`, el compilador avisa.

### ¿Por qué evitar `React.FC`?

```tsx
// ❌ Evitado en este proyecto
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => { ... };
```

- **`children` implícito (React ≤ 17):** `React.FC` añadía `children` a todas las props aunque el componente no los aceptase, así que `<ErrorMessage message="x">texto</ErrorMessage>` compilaba sin error. Con el tipado directo, si un componente acepta `children` lo declaramos explícitamente (ver `UserProviderProps` en `UserContext.tsx`).
- **Genéricos:** con `React.FC` no se pueden declarar componentes genéricos (`<T,>(props: ListProps<T>) => ...`) de forma natural.
- **Coherencia:** un componente es *solo una función*. Tiparla como cualquier otra función (parámetros + retorno) es más simple y es la recomendación actual de la comunidad (la plantilla oficial de Create React App eliminó `React.FC` por estos motivos).

### ¿Por qué funciones flecha y no `function`?

Es sobre todo una **convención de estilo** que da consistencia: componentes, hooks, servicios y *helpers* se declaran todos igual (`export const nombre = (...): Tipo => ...`), lo que refuerza la idea de que son **valores** (funciones de primera clase) que se pueden pasar, componer y exportar.

---

## 3. Inmutabilidad de las props y flujo de datos unidireccional

### Definición

- Las **props** son los argumentos de un componente. Son **de solo lectura**: un componente **nunca** debe modificar sus props.
- El **flujo de datos es unidireccional**: los datos **bajan** de padres a hijos por props; los eventos **suben** de hijos a padres mediante *callbacks* (funciones pasadas también como props).

### Ejemplo en el proyecto

`UserListPage` (padre) → `UserList` → `UserListItem` (hijo):

```tsx
// UserListPage.tsx — el padre posee los datos y decide qué hacer al seleccionar
const handleSelect = (user: User): void => {
  selectUser(user); // 1) Actualiza el estado global
  navigate(`/users/${user.id}`); // 2) Navega al detalle
};

<UserList users={users} selectedUserId={selectedUser?.id ?? null} onSelect={handleSelect} />
```

```tsx
// UserListItem.tsx — el hijo solo pinta y "avisa" hacia arriba
interface UserListItemProps {
  user: User;
  isSelected: boolean;
  onSelect: (user: User) => void;
}

export const UserListItem = ({ user, isSelected, onSelect }: UserListItemProps): JSX.Element => (
  <li>
    <button type="button" aria-pressed={isSelected} onClick={(): void => onSelect(user)}>
      {user.name}
    </button>
  </li>
);
```

La inmutabilidad se refuerza también desde los tipos (`src/models/user.model.ts`):

```ts
export interface User {
  readonly id: number;
  readonly name: string;
}
```

Si alguien escribe `user.name = 'Otro'`, **TypeScript da error de compilación**.

### ¿Por qué?

- **Predecibilidad:** para saber de dónde viene un dato basta con subir por el árbol. No hay "efectos a distancia".
- **Detección de cambios barata:** React (y `useMemo`, `React.memo`...) comparan por **referencia** (`===`). Si mutamos un objeto, la referencia no cambia y React *no se entera* de que debe re-renderizar. Creando objetos nuevos, el cambio es evidente.
- **Componentes reutilizables:** `UserListItem` no sabe nada de rutas ni de contexto; se podría usar en cualquier otra vista.

---

## 4. Estado local con `useState`

### Definición

`useState` declara una variable de estado **privada de un componente**. Devuelve una tupla `[valor, setValor]`. Llamar a `setValor` programa un nuevo render con el valor actualizado. Cuando el componente se desmonta, su estado desaparece.

### Ejemplo en el proyecto

`src/components/Home.tsx`:

```tsx
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
```

También se usa en `controllers/useUserDetail.ts` para el estado de carga del detalle, que solo interesa a una vista:

```ts
const [fetchedUser, setFetchedUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
```

### ¿Por qué?

- **Encapsulación:** el contador no le importa a nadie más; llevarlo al estado global solo añadiría acoplamiento y re-renders innecesarios.
- **Actualización funcional** (`setCount(prev => prev + 1)`): si hiciéramos `setCount(count + 1)` dos veces seguidas en el mismo evento, ambas leerían el mismo `count` "antiguo" y solo sumaría 1. La forma funcional siempre parte del último valor.
- **Regla práctica:** *empieza siempre con estado local* y súbelo (al padre o al contexto) solo cuando otro componente lo necesite.

---

## 5. Estado global con Context API + `useReducer`

### Definición

- **`useReducer`** gestiona estado mediante un **reducer**: una función **pura** `(estado, acción) => nuevoEstado`. Los componentes no modifican el estado: **despachan acciones** (`dispatch({ type: ... })`) que describen *qué ha pasado*.
- **Context API** permite que un valor (aquí, `state` y `dispatch`) esté disponible para **todo un subárbol** sin pasarlo por props nivel a nivel (*prop drilling*).
- Combinados forman un **patrón tipo Redux, nativo de React**, sin librerías externas.

### Ejemplo en el proyecto

**1. Tipos del estado y de las acciones** (`src/models/user-state.model.ts`):

```ts
export interface UserState {
  readonly users: readonly User[];
  readonly status: RequestStatus;
  readonly error: string | null;
  readonly selectedUser: User | null;
}

export type UserAction =
  | { type: 'fetch_users_start' }
  | { type: 'fetch_users_success'; payload: readonly User[] }
  | { type: 'fetch_users_error'; payload: string }
  | { type: 'select_user'; payload: User }
  | { type: 'clear_user' };
```

`UserAction` es una **unión discriminada**: según el valor de `type`, TypeScript sabe si hay `payload` y de qué tipo.

**2. Reducer puro** (`src/context/user.reducer.ts`):

```ts
export const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'fetch_users_start':
      return { ...state, status: 'loading', error: null };
    case 'fetch_users_success':
      return { ...state, status: 'success', users: action.payload };
    case 'fetch_users_error':
      return { ...state, status: 'error', error: action.payload };
    case 'select_user':
      return { ...state, selectedUser: action.payload };
    case 'clear_user':
      return { ...state, selectedUser: null };
    default: {
      const unhandled: never = action; // comprobación exhaustiva
      return unhandled;
    }
  }
};
```

**3. Provider + hook de acceso** (`src/context/UserContext.tsx`):

```tsx
const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  const value: UserContextValue = useMemo(
    (): UserContextValue => ({ state, dispatch }),
    [state],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextValue => {
  const context: UserContextValue | undefined = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext debe usarse dentro de un <UserProvider>.');
  }
  return context;
};
```

**4. Composición en la raíz** (`src/App.tsx`):

```tsx
export const App = (): JSX.Element => (
  <UserProvider>
    <AppRouter />
  </UserProvider>
);
```

**5. Uso desde un controller** (`src/controllers/useUserSelection.ts`):

```ts
const selectUser = useCallback(
  (user: User): void => dispatch({ type: 'select_user', payload: user }),
  [dispatch],
);
```

### ¿Por qué?

| Decisión | Beneficio |
| --- | --- |
| Reducer como **función pura** en fichero aparte | Se testea sin React: `expect(userReducer(s, a)).toEqual(...)`. Mismo input → mismo output. |
| **Spread** (`{ ...state, ... }`) en lugar de mutar | Nueva referencia ⇒ React detecta el cambio y re-renderiza a los consumidores. |
| **Unión discriminada** de acciones + caso `never` | Si se añade una acción y se olvida tratarla, **el compilador falla**. |
| `status: 'idle' \| 'loading' \| 'success' \| 'error'` en vez de varios booleanos | Imposible representar estados contradictorios (`isLoading && hasError`). |
| `createContext<... \| undefined>(undefined)` + `useUserContext` | Error claro si se usa fuera del Provider y el tipo de retorno nunca es `undefined`. |
| `useMemo` sobre `value` | Evita re-renderizar todos los consumidores cuando el Provider se renderiza sin cambios de estado. |
| Los componentes usan **hooks controller**, no `dispatch` directamente | Los componentes no conocen los nombres de las acciones; se pueden renombrar sin tocar la UI. |

**¿Cuándo usar estado global?** Cuando varias vistas necesitan los mismos datos: aquí la lista de usuarios cargada en `/users` se **reutiliza** en `/users/:id` sin repetir la petición, y el usuario seleccionado sobrevive a la navegación.

---

## 6. Lógica asíncrona con `useEffect` + Custom Hooks

### Definición

- **`useEffect`** ejecuta *efectos secundarios* (peticiones HTTP, suscripciones, timers...) **después** de que React haya pintado. Se vuelve a ejecutar cuando cambia alguna de sus **dependencias**, y puede devolver una **función de limpieza** que React llama antes del siguiente efecto o al desmontar.
- Un **Custom Hook** es una función cuyo nombre empieza por `use` y que combina otros hooks. Sirve para **extraer lógica con estado fuera de los componentes** y reutilizarla. En este proyecto actúan como **controllers**: conectan UI ↔ estado ↔ servicios.

### Ejemplo en el proyecto

**Carga del listado (estado global)** — `src/controllers/useUsers.ts`:

```ts
const loadUsers = useCallback(async (): Promise<void> => {
  dispatch({ type: 'fetch_users_start' });
  try {
    const users: readonly User[] = await getUsers();
    dispatch({ type: 'fetch_users_success', payload: users });
  } catch (error: unknown) {
    dispatch({ type: 'fetch_users_error', payload: getErrorMessage(error) });
  }
}, [dispatch]);

useEffect((): void => {
  if (state.status === 'idle') {
    void loadUsers();
  }
}, [state.status, loadUsers]);
```

**Carga del detalle con cancelación (estado local)** — `src/controllers/useUserDetail.ts`:

```ts
useEffect((): (() => void) | void => {
  if (userId === null || cachedUser !== null) return;

  const controller: AbortController = new AbortController();

  const load = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setFetchedUser(null);
    try {
      const user: User = await getUserById(userId, controller.signal);
      setFetchedUser(user);
    } catch (err: unknown) {
      if (isAbortError(err)) return;
      setError(getErrorMessage(err));
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  void load();

  return (): void => controller.abort(); // limpieza
}, [userId, cachedUser]);
```

**El componente queda limpio** — `src/components/users/UserDetailPage.tsx`:

```tsx
const { id } = useParams<{ id: string }>();
const { user, isLoading, error } = useUserDetail(id);
```

### ¿Por qué?

- **Separación de responsabilidades:** `UserDetailPage` no sabe que existe `fetch`, ni `AbortController`, ni la caché. Solo pinta según `user`, `isLoading` y `error`.
- **La función del efecto no es `async`:** `useEffect` espera que devolvamos *nada* o una función de limpieza, no una `Promise`. Por eso se define una función `async` interna (`load`) y se invoca con `void load()` (el `void` indica explícitamente que no esperamos su resultado).
- **Dependencias honestas:** listamos en el array todo lo que el efecto lee (`userId`, `cachedUser`). `useCallback` estabiliza `loadUsers` para que pueda ser dependencia sin provocar bucles infinitos.
- **Limpieza y *race conditions*:** si el usuario navega de `/users/1` a `/users/2` antes de que llegue la primera respuesta, la limpieza aborta la petición antigua. Sin ella, una respuesta lenta podría "pisar" a la nueva.
- **Estado derivado, no duplicado:** `cachedUser` se *calcula* a partir del estado global con `useMemo`; no se copia a otro `useState`. Una sola fuente de verdad.
- **Composición de hooks:** `useUsers` reutiliza `useUserSelection`. `UserDetailPage` usa solo `useUserSelection`, así que **no** dispara la descarga del listado como efecto colateral.
- **¿Por qué no se cancela `loadUsers` al desmontar?** Porque su resultado se guarda en el Provider (que vive en la raíz y nunca se desmonta), no en el componente. Si se cancelase, al salir y volver rápido a `/users` se perdería una petición ya en curso.

---

## 7. Manejo defensivo de errores HTTP (`try` / `catch` / `finally`)

### Definición

Programar a la defensiva significa **asumir que la red falla**: el servidor puede estar caído, tardar demasiado, responder 404/500 o devolver un JSON con otra forma. Cada caso debe convertirse en un **estado visible en la UI**, nunca en una pantalla en blanco.

- `try`: el camino feliz.
- `catch (error: unknown)`: el error se tipa como `unknown` (puede ser *cualquier cosa*) y se normaliza.
- `finally`: se ejecuta **siempre**, haya éxito o error. Ideal para liberar recursos o apagar indicadores.

### Ejemplo en el proyecto

**Servicio HTTP genérico** — `src/services/http.service.ts` (resumido):

```ts
export const httpGet = async <T>(
  path: string,
  guard: TypeGuard<T>,
  signal?: AbortSignal,
): Promise<T> => {
  // ...
  const timeoutId = setTimeout((): void => { timedOut = true; controller.abort(); }, DEFAULT_TIMEOUT_MS);
  signal?.addEventListener('abort', forwardAbort);

  try {
    const response: Response = await fetch(`${API_BASE_URL}${path}`, { signal: controller.signal, ... });

    // `fetch` NO lanza error con 404 o 500: hay que comprobar `ok` a mano.
    if (!response.ok) {
      throw new HttpError('http', `Error ${response.status}: ${response.statusText}`, response.status);
    }

    const data: unknown = await response.json();
    if (!guard(data)) {
      throw new HttpError('invalid_response', 'La respuesta del servidor no tiene el formato esperado.');
    }
    return data;
  } catch (error: unknown) {
    if (error instanceof HttpError) throw error;
    if (isAbortError(error)) {
      if (timedOut) throw new HttpError('timeout', 'El servidor ha tardado demasiado en responder.');
      throw error;
    }
    throw new HttpError('network', 'No se ha podido contactar con el servidor.');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', forwardAbort);
  }
};
```

**Validación en tiempo de ejecución** — `src/models/user.model.ts`:

```ts
export const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'number' && typeof candidate.name === 'string';
};
```

**Tres estados en la interfaz** — `src/components/users/UserListPage.tsx`:

```tsx
if (status === 'idle' || status === 'loading') {
  return <Loading message="Cargando usuarios..." />;
}

if (status === 'error') {
  return <ErrorMessage message={error ?? 'Error desconocido.'} onRetry={(): void => void reload()} />;
}

return ( /* Éxito: lista de usuarios */ );
```

### ¿Por qué?

- **`fetch` solo rechaza por errores de red.** Un `404` o un `500` *resuelven* la promesa con `response.ok === false`. Olvidar esta comprobación es uno de los errores más comunes.
- **`unknown` en lugar de `any`:** obliga a comprobar el tipo (`instanceof`) antes de usar el error. `getErrorMessage` centraliza esa conversión a texto para la UI.
- **Errores de dominio (`HttpError`)** con `kind` (`'network' | 'timeout' | 'http' | 'invalid_response'`) y `status`: la UI podría reaccionar distinto a un 401 (ir al login) que a un 500.
- **Type guards en vez de `as User`:** TypeScript desaparece al compilar; lo que llega por la red es `unknown`. Validar evita que un cambio en el backend provoque un error críptico tres componentes más abajo.
- **`finally` para liberar recursos:** en `httpGet` siempre limpiamos el *timeout* y el *listener* (si no, se acumularían). En `useUserDetail` siempre apagamos `isLoading`, tanto si hay éxito como error.
- **¿Por qué `loadUsers` no tiene `finally`?** Porque no hay nada que limpiar: la transición `loading → success | error` la realiza el reducer dentro de `try` y `catch`. Añadir un `finally` vacío solo sería ruido. **Usa `finally` cuando haya algo que deba ocurrir sí o sí.**
- **Cancelación ≠ error:** si una petición se aborta porque el usuario ha cambiado de vista, no se muestra ningún mensaje (`if (isAbortError(err)) return;`).
- **Accesibilidad:** `Loading` usa `role="status"` y `ErrorMessage` usa `role="alert"`, de modo que los lectores de pantalla anuncian los cambios.

---

## 8. Renderizado de listas y la propiedad `key`

### Definición

Para pintar una colección se **transforma** el array de datos en un array de elementos con `map` (función pura, no muta el original). Cada elemento necesita una prop especial **`key`**: un identificador **estable y único entre hermanos** que React usa para emparejar elementos entre renders durante la reconciliación.

### Ejemplo en el proyecto

`src/components/users/UserList.tsx`:

```tsx
export const UserList = ({ users, selectedUserId, onSelect }: UserListProps): JSX.Element => {
  if (users.length === 0) {
    return <p>No hay usuarios registrados.</p>;
  }

  return (
    <ul>
      {users.map(
        (user: User): JSX.Element => (
          <UserListItem
            key={user.id}
            user={user}
            isSelected={user.id === selectedUserId}
            onSelect={onSelect}
          />
        ),
      )}
    </ul>
  );
};
```

### ¿Por qué?

- **Sin `key`** (o con una mala `key`), React empareja elementos por **posición**. Si se inserta un usuario al principio, React cree que *todos* han cambiado y vuelve a renderizarlos; peor aún, el estado interno (un `input`, el foco, una animación) puede quedar asociado al elemento equivocado.
- **¿Por qué no usar el índice (`key={index}`)?** El índice cambia al reordenar, filtrar o insertar, así que no identifica al *dato*, sino a la *posición*. Solo es aceptable en listas estáticas que nunca cambian.
- **La mejor `key` es el id de la base de datos** (`user.id`), que la API de Express ya nos proporciona.
- **`key` va en el elemento que devuelve `map`** (`<UserListItem key=...>`), no dentro de `UserListItem`. Además, `key` no llega como prop al hijo: es de uso exclusivo de React.
- **Estado vacío explícito:** manejar `users.length === 0` es parte de la programación defensiva; una lista vacía no debe parecer un error ni una pantalla rota.

---

## 9. Resumen del flujo de datos

**Estado local** (Home, detalle):

```text
Evento (click) → setState(...) → re-render del componente
```

**Estado global** (listado y selección):

```text
Componente → controller (useUsers) → dispatch(acción) → reducer (puro)
          → nuevo estado en el Provider → re-render de los componentes suscritos
```

**Petición HTTP completa** (entrar en `/users`):

```text
UserListPage monta
  → useUsers: useEffect detecta status 'idle'
  → dispatch(fetch_users_start)          ⇒ UI: <Loading />
  → userService.getUsers() → httpGet('/users', isUserArray)
      ├─ OK    → dispatch(fetch_users_success) ⇒ UI: <UserList />
      └─ Error → dispatch(fetch_users_error)   ⇒ UI: <ErrorMessage onRetry=... />
```

### Checklist de buenas prácticas aplicadas

- [x] Componentes como funciones flecha con props tipadas; sin `React.FC`.
- [x] Cero `any`; retornos explícitos; tipos de dominio en `src/models/`.
- [x] Estado nunca mutado: spread, `map`, `find`, `readonly`.
- [x] `useState` para estado efímero; Context + `useReducer` para estado compartido.
- [x] Peticiones aisladas en `services/`, orquestadas desde Custom Hooks en `controllers/`.
- [x] `try`/`catch`/`finally`, `AbortController`, timeout y validación de respuestas.
- [x] Estados de Cargando, Éxito y Error visibles en la UI.
- [x] Listas con `key` estable basada en el id.
