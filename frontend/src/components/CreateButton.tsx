import { useAuth } from '../contexts/AuthContext';
import { Button } from '@mui/material';

export default function CreateButton() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Button 
        variant="contained" 
        onClick={() => alert('Для публикации войдите в систему')}
      >
        Войти для публикации
      </Button>
    );
  }

  return <Button variant="contained">Создать пост</Button>;
}