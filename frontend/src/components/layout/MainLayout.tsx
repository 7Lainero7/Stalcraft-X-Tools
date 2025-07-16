import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';

export default function MainLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main">
        {isAuthenticated && <CreatePostFAB />} {/* Кнопка только для авторизованных */}
        <Outlet />
      </Box>
    </Box>
  );
}