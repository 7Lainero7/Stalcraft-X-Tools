import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // Сайдбар для всех
    children: [
      {
        index: true,
        element: <HomePage /> // Главная доступна всем
      },
      {
        path: '/public',
        element: <PublicContentPage /> // Публичный контент
      },
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        element: <ProtectedRoute />, // Защищенные роуты
        children: [
          {
            path: '/create',
            element: <CreatePostPage /> // Создание контента
          },
          {
            path: '/profile',
            element: <ProfilePage /> // Профиль
          }
        ]
      }
    ]
  }
]);

export default router;