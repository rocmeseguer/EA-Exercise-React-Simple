interface LoadingProps {
  message?: string;
}

/** Indicador de carga reutilizable. `role="status"` lo anuncia a lectores de pantalla. */
export const Loading = ({ message = 'Cargando...' }: LoadingProps): JSX.Element => (
  <p role="status" aria-live="polite">
    {message}
  </p>
);
