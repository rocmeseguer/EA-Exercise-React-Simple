import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '../components/Home';
import { NavBar } from '../components/NavBar';
import { UserDetailPage } from '../components/users/UserDetailPage';
import { UserListPage } from '../components/users/UserListPage';
import { UsersLayout } from '../components/users/UsersLayout';

/**
 * Configuración centralizada del enrutado.
 * Tener todas las rutas en un único sitio da una visión clara del mapa de la app.
 *
 *   /            -> Home
 *   /users       -> UsersLayout > UserListPage
 *   /users/:id   -> UsersLayout > UserDetailPage
 *   (otra)       -> redirige a /
 */
export const AppRouter = (): JSX.Element => (
  // `future`: adopta ya el comportamiento de React Router v7 (y elimina sus avisos).
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <NavBar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/users" element={<UsersLayout />}>
        <Route index element={<UserListPage />} />
        <Route path=":id" element={<UserDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
