# Gestión de Estado en React Exercise Simple

Este proyecto demuestra dos tipos de gestión de estado en React:

## 1. Estado Local (useState)

El estado local se gestiona usando el hook `useState` de React, ideal para estado específico de componentes.

### Ejemplo en Home.tsx:
```typescript
const [count, setCount] = useState<number>(0);
```
- Usado para un contador simple
- Estado encapsulado dentro del componente
- No accesible por otros componentes

## 2. Estado Global (Context + useReducer)

El estado global se implementa combinando Context API y useReducer.

### Estructura:

1. **Tipos** (`types/user.ts`):
```typescript
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
```

2. **Contexto** (`context/UserContext.tsx`):
- Implementa el patrón reducer para manejar actualizaciones de estado
- Proporciona un Provider que envuelve la aplicación
- Define acciones específicas para modificar el estado

### Acciones disponibles:
- `select_user`: Selecciona un usuario
- `clear_user`: Limpia el usuario seleccionado

### Uso en componentes:

1. **Acceder al estado global**:
```typescript
const { state, dispatch } = useUserContext();
```

2. **Despachar acciones**:
```typescript
dispatch({ type: "select_user", payload: user });
```

## Flujo de Datos

1. **Estado Local**:
   - Componente → useState → Actualización → Re-render del componente

2. **Estado Global**:
   - Componente → dispatch(action) → reducer → Context → Re-render de componentes suscritos

## Beneficios de esta Arquitectura

1. **Separación de Responsabilidades**:
   - Estado local para lógica de componentes
   - Estado global para datos compartidos

2. **Mantenibilidad**:
   - Acciones tipadas
   - Flujo de datos predecible
   - Fácil de debuggear

3. **Escalabilidad**:
   - Fácil de extender con nuevas acciones
   - Patrón consistente en toda la aplicación
