import { useNavigate, useParams } from 'react-router-dom';
import { useUserDetail } from '../../controllers/useUserDetail';
import { ErrorMessage } from '../common/ErrorMessage';
import { Loading } from '../common/Loading';

/**
 * Componente contenedor de la ruta /users/:id.
 * El parámetro `:id` de la URL es la "fuente de verdad" de qué usuario mostrar,
 * así la vista funciona también si se recarga la página o se comparte el enlace.
 */
export const UserDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading, error } = useUserDetail(id);

  // Al volver, `UserListPage` se monta de nuevo y su estado local empieza vacío:
  // no hace falta "limpiar" ninguna selección.
  const handleBack = (): void => navigate('/users');

  return (
    <div>
      <h3>Detalle del usuario con ID: {id}</h3>
      {isLoading && <Loading message="Cargando usuario..." />}
      {error !== null && <ErrorMessage message={error} />}
      {user !== null && <p>Nombre: {user.name}</p>}
      <button type="button" onClick={handleBack}>
        Volver al listado
      </button>
    </div>
  );
};
