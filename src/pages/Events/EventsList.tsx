import { useState } from 'react';
import {
  Box, Card, Typography, Grid, Button, Chip,
  TextField, InputAdornment, alpha, Dialog, DialogTitle,
  DialogContent, DialogActions, ToggleButtonGroup, ToggleButton, useTheme, CircularProgress
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useNavigate } from 'react-router-dom';
import { useGetEventsQuery, useCreateEventMutation } from '../../store/eventsApiSlice';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6'];

const emptyForm = { name: '', description: '', start_date: '', end_date: '' };

export default function EventsList() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: events = [], isLoading } = useGetEventsQuery();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleFieldChange = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.start_date || !form.end_date) return;
    try {
      const created = await createEvent({
        name: form.name,
        description: form.description || null,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      }).unwrap();
      setDialogOpen(false);
      setForm(emptyForm);
      navigate(`/events/${created.id}`);
    } catch {
      // errors can be enhanced with a snackbar later
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setForm(emptyForm);
  };

  const colorFor = (id: number) => COLORS[id % COLORS.length];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

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

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && (
        filtered.length === 0 ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: alpha('#94a3b8', 0.05), borderRadius: 3 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>No Events Found</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((event) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <Card
                  sx={{
                    borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
                  }}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <Box sx={{ height: 4, background: `linear-gradient(90deg, ${colorFor(event.id)}, ${alpha(colorFor(event.id), 0.4)})` }} />
                  <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>{event.name}</Typography>
                      <Chip label="Active" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: 'rgba(16,185,129,0.1)', color: '#059669' }} />
                    </Box>
                    {event.description && (
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {formatDate(event.start_date)} – {formatDate(event.end_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* List View */}
      {!isLoading && viewMode === 'list' && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${alpha('#94a3b8', 0.15)}` }}>
                  <th style={{ padding: '14px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>Event Name</th>
                  <th style={{ padding: '14px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>Description</th>
                  <th style={{ padding: '14px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>Start Date</th>
                  <th style={{ padding: '14px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>End Date</th>
                  <th style={{ padding: '14px 24px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>
                    <ChatOutlinedIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>No Events Found</Typography>
                    </td>
                  </tr>
                ) : (
                  filtered.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => navigate(`/events/${event.id}`)}
                      style={{ borderBottom: `1px solid ${alpha('#94a3b8', 0.08)}`, cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 24px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colorFor(event.id), flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{event.name}</Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '14px 24px', maxWidth: 280 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.description || '—'}
                        </Typography>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{formatDate(event.start_date)}</Typography>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{formatDate(event.end_date)}</Typography>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <Chip label="Active" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22, bgcolor: 'rgba(16,185,129,0.1)', color: '#059669' }} />
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
          <TextField label="Event Name" fullWidth size="small" value={form.name} onChange={handleFieldChange('name')} required />
          <TextField label="Description" fullWidth size="small" multiline rows={2} value={form.description} onChange={handleFieldChange('description')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Start Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={handleFieldChange('start_date')} required />
            <TextField label="End Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={form.end_date} onChange={handleFieldChange('end_date')} required />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit" size="small" disabled={isCreating}>Cancel</Button>
          <Button
            variant="contained" size="small" onClick={handleCreate} disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {isCreating ? 'Creating...' : 'Create Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
