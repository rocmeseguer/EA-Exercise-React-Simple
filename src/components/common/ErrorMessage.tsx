interface ErrorMessageProps {
  message: string;
  /** Opcional: si se pasa, se muestra un botón de reintento. */
  onRetry?: () => void;
}

/**
 * Componente presentacional de error.
 * No decide QUÉ hacer al reintentar: recibe la acción por props (callback),
 * respetando el flujo de datos unidireccional.
 */
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
