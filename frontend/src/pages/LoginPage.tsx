import { Button, TextField, Box, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Временные данные для теста
    login('test@example.com', 'password');
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Вход в систему
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          type="email"
          required
        />
        <TextField
          label="Пароль"
          fullWidth
          margin="normal"
          type="password"
          required
        />
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          sx={{ mt: 2 }}
        >
          Войти
        </Button>
      </form>
    </Box>
  );
}