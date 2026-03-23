import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip,
  TextField, InputAdornment, alpha, Dialog, DialogTitle,
  DialogContent, DialogActions, ToggleButtonGroup, Divider, ToggleButton, useTheme
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../types';
import { staticEvents } from '../../data/staticEvents';

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'rgba(16,185,129,0.1)', text: '#059669' },
  draft: { bg: 'rgba(59,130,246,0.1)', text: '#2563eb' },
  paused: { bg: 'rgba(245,158,11,0.1)', text: '#d97706' },
  archived: { bg: 'rgba(100,116,139,0.1)', text: '#64748b' },
};

const emptyForm = { name: '', description: '', venue: '', startDate: '', endDate: '' };

export default function EventsList() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [events, setEvents] = useState<Event[]>(staticEvents);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase())
  );

  const handleFieldChange = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreate = () => {
    if (!form.name.trim() || !form.venue.trim() || !form.startDate || !form.endDate) return;
    const newEvent: Event = {
      id: Date.now().toString(),
      name: form.name,
      description: form.description,
      venue: form.venue,
      startDate: form.startDate,
      endDate: form.endDate,
      status: 'draft',
      languages: [],
      totalConversations: 0,
      totalExhibitors: 0,
      primaryColor: '#6366f1',
      welcomeMessage: '',
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => [newEvent, ...prev]);
    setDialogOpen(false);
    setForm(emptyForm);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setForm(emptyForm);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small" placeholder="Search events..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment>,
            }}
            sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
          <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small" sx={{ '& .MuiToggleButton-root': { borderRadius: 1.5 } }}>
            <ToggleButton value="grid"><ViewModuleOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
            <ToggleButton value="list"><ViewListOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddOutlinedIcon />} onClick={() => setDialogOpen(true)} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
          Create Event
        </Button>
      </Box>

      {/* Events View */}
      {viewMode === 'grid' ? (
        filtered.length === 0 ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: alpha('#94a3b8', 0.05), borderRadius: 3 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>No Data Found</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((event) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <Card
                  sx={{
                    borderRadius: 1, cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
                  }}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <Box sx={{ height: 4, background: `linear-gradient(90deg, ${event.primaryColor}, ${alpha(event.primaryColor, 0.4)})` }} />
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 0.25, fontWeight: 700, color: 'text.primary' }}>{event.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{event.venue}</Typography>
                      </Box>
                      <Chip
                        label={event.status?.charAt(0).toUpperCase() + event.status?.slice(1)}
                        size="small"
                        sx={{
                          fontWeight: 700, fontSize: '0.7rem',
                          backgroundColor: statusColors[event.status]?.bg || '#eee',
                          color: statusColors[event.status]?.text || '#333',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {event.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2.5 }}>
                      <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
                        {event.startDate ? new Date(event.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''} – {event.endDate ? new Date(event.endDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />

                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <ChatOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                          {event.totalConversations?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <PeopleOutlinedIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
                          {event.totalExhibitors || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid', borderColor: alpha('#94a3b8', 0.1) }}>
                  <th style={{ padding: '16px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Event Name</th>
                  <th style={{ padding: '16px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Dates</th>
                  <th style={{ padding: '16px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Venue</th>
                  <th style={{ padding: '16px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Conversations</th>
                  <th style={{ padding: '16px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>No Data Found</Typography>
                    </td>
                  </tr>
                ) : (
                  filtered.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: event.primaryColor }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{event.name}</Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''} – {event.endDate ? new Date(event.endDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        </Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{event.venue}</Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{event.totalConversations?.toLocaleString() || 0}</Typography>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Chip
                          label={event.status?.charAt(0).toUpperCase() + event.status?.slice(1)}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: '0.7rem', height: 24,
                            backgroundColor: statusColors[event.status]?.bg || '#eee',
                            color: statusColors[event.status]?.text || '#333',
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Card>
      )}

      {/* Create Event Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Event</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Event Name" fullWidth size="small" value={form.name} onChange={handleFieldChange('name')} />
          <TextField label="Description" fullWidth size="small" multiline rows={2} value={form.description} onChange={handleFieldChange('description')} />
          <TextField label="Venue" fullWidth size="small" value={form.venue} onChange={handleFieldChange('venue')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Start Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={handleFieldChange('startDate')} />
            <TextField label="End Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={form.endDate} onChange={handleFieldChange('endDate')} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit" size="small">Cancel</Button>
          <Button variant="contained" size="small" onClick={handleCreate}>Create Event</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
