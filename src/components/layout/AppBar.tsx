import { useState } from 'react';
import {
  AppBar as MuiAppBar, Toolbar, Typography, IconButton, Box,
  InputBase, Avatar, alpha, Menu, MenuItem
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useLocation } from 'react-router-dom';
import { useThemeContext } from '../../theme/ThemeContext';

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/events': 'Events',
  '/analytics': 'Analytics',
  '/users': 'Users',
  '/exports': 'Exports',
  '/settings': 'Settings',
};

export default function AppBar() {
  const location = useLocation();
  const { mode, toggleTheme } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = breadcrumbMap[location.pathname] || pathSegments[pathSegments.length - 1] || 'Dashboard';

  return (
    <MuiAppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        backgroundImage: 'none',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: '64px !important' }}>
        {/* Breadcrumb replacement with simple title */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {currentPage}
          </Typography>
        </Box>

        {/* Search */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            backgroundColor: (t) => alpha(t.palette.primary.main, 0.04),
            borderRadius: 2, px: 1.5, py: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            width: 240,
            transition: 'all 0.2s',
            '&:focus-within': {
              borderColor: 'primary.main',
              width: 300,
              backgroundColor: 'background.paper',
              boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.1)}`,
            },
          }}
        >
          <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <InputBase placeholder="Search..." sx={{ fontSize: '0.85rem', flex: 1 }} />
        </Box>

        {/* Theme Toggle */}
        <IconButton 
          size="small" 
          onClick={toggleTheme}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
          {mode === 'light' ? <DarkModeRoundedIcon sx={{ fontSize: 20 }} /> : <LightModeRoundedIcon sx={{ fontSize: 20 }} />}
        </IconButton>

        {/* Notifications */}
        <IconButton 
          size="small" 
          onClick={handleOpen}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
          <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: { mt: 1.5, width: 280, borderRadius: 2, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
          </Box>
          <MenuItem onClick={handleClose} sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>No new notifications</Typography>
          </MenuItem>
        </Menu>

        {/* Profile */}
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
          RK
        </Avatar>
      </Toolbar>
    </MuiAppBar>
  );
}
