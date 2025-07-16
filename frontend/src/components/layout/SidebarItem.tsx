import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ReactNode } from 'react';

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  to: string;
}

export default function SidebarItem({ icon, text, to }: SidebarItemProps) {
  return (
    <ListItem disablePadding>
      <ListItemButton component={RouterLink} to={to}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  );
}