import { Drawer, Divider, List, Toolbar, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, Menu } from '@mui/icons-material';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import SidebarItem from './SidebarItem';

const drawerWidth = 240;

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : theme.spacing(7),
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : theme.spacing(7),
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        <SidebarItem icon={<Menu />} text="Главная" to="/" />
      </List>
    </Drawer>
  );
}